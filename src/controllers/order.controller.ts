import type { Response } from "express";
import type { AuthRequest } from "../utils/auth.middleware.js";
import Order from "../model/order.model.js";
import Cart from "../model/cart.model.js";

import { User } from "../model/user.model.js"; 
import Product from "../model/product.model.js";
import { orderConfirmationTemplate, orderStatusTemplate } from "../templates/email.templates.js";
import { sendOrderConfirmationEmail, sendOrderStatusUpdate } from "../services/email.services.js";


const populateOrderDetails = async (order: any) => {
  return await order.populate([
    { path: "user", model: User, select: "name email" },
    { path: "items.product", model: Product }
  ]);
};




export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { billingDetails, shippingDetails } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userCart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      model: Product 
    });

    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of userCart.items) {
      const product = cartItem.product as any;
      if (!product) continue;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });

      totalAmount += product.price * cartItem.quantity;
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "pending",
      billingDetails,
      shippingDetails
    });

    await order.save();

   
    for (const cartItem of userCart.items) {
      await Product.findByIdAndUpdate(cartItem.product, {
        $inc: { quantity: -cartItem.quantity }
      });
    }

   
    userCart.items = [];
    await userCart.save();

    try {
      await populateOrderDetails(order);
    } catch (popErr: any) {
      console.error("Population warning:", popErr.message);
    }

    // 📧 SEND EMAIL CONFIRMATION
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        const emailHtml = orderConfirmationTemplate(
          user.name || 'Customer',
          order._id.toString(),
          totalAmount,
          orderItems
        );
        
        await sendOrderConfirmationEmail(
          user.email,
          user.name || 'Customer',
          order._id.toString(),
          totalAmount,
          orderItems
        );
      }
    } catch (emailError: any) {
      console.error(" Email sending failed:", emailError.message);
     
    }

    return res.status(201).json({ 
      message: "Order placed successfully", 
      order: {
        ...order.toObject(),
        id: order._id 
      } 
    });

  } catch (error: any) {
    console.error("CRITICAL ORDER ERROR:", error.message);
    return res.status(500).json({ 
      message: "Failed to create order", 
      details: error.message 
    });
  }

}

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const filter = req.user?.id ? { user: req.user.id } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "items.product", model: Product });
    res.status(200).json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// GET /api/orders/:id - Single order
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    await populateOrderDetails(order);
    res.status(200).json({ order: { ...order.toObject(), id: order._id } });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching order" });
  }
};


// export const cancelOrder = async (req: AuthRequest, res: Response) => {
//   try {
    
//     const filter: Record<string, any> = { _id: req.params.id };
    
//     if (req.user?.id) {
//       filter.user = req.user.id;
//     }
    
//     const order = await Order.findOne(filter);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found or unauthorized" });
//     }

//     if (order.status === "shipped" || order.status === "delivered") {
//       return res.status(400).json({ message: "Cannot cancel an order that has already been shipped." });
//     }

//     order.status = "cancelled";
//     await order.save();

//     // Restore product quantities
//     for (const item of order.items) {
//       await Product.findByIdAndUpdate(item.product, {
//         $inc: { quantity: item.quantity }
//       });
//     }

//     res.status(200).json({ message: "Order cancelled successfully", order });
//   } catch (error: any) {
//     res.status(500).json({ message: "Failed to cancel order" });
//   }
// };


export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, any> = { _id: req.params.id };
    
    if (req.user?.id) {
      filter.user = req.user.id;
    }
    
    const order = await Order.findOne(filter).populate({ 
      path: "items.product", 
      model: Product 
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({ 
        message: "Cannot cancel an order that has already been shipped." 
      });
    }

    order.status = "cancelled";
    await order.save();

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    // 📧 SEND CANCELLATION EMAIL
    try {
      const user = await User.findById(order.user);
      
      if (user && user.email) {
        const emailHtml = orderStatusTemplate(
          user.name || 'Customer',
          order._id.toString(),
          'cancelled',
          order.totalAmount,
          order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        );
        
        await sendOrderStatusUpdate(
          user.email,
          user.name || 'Customer',
          order._id.toString(),
          'cancelled',
          emailHtml
        );
      }
    } catch (emailError: any) {
      console.error("⚠️ Cancellation email failed:", emailError.message);
    }

    res.status(200).json({ 
      message: "Order cancelled successfully", 
      order 
    });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
  
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", model: User, select: "name email" });
      
    res.status(200).json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status", 
        validStatuses 
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate({ path: "items.product", model: Product });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 📧 SEND STATUS UPDATE EMAIL
    try {
      const user = await User.findById(order.user);
      
      if (user && user.email) {
        const emailHtml = orderStatusTemplate(
          user.name || 'Customer',
          order._id.toString(),
          status,
          order.totalAmount,
          order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        );
        
        await sendOrderStatusUpdate(
          user.email,
          user.name || 'Customer',
          order._id.toString(),
          status,
          emailHtml
        );
      }
    } catch (emailError: any) {
      console.error("⚠️ Status update email failed:", emailError.message);
      // Don't fail the status update if email fails
    }

    res.status(200).json({ 
      message: "Status updated successfully", 
      order 
    });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};