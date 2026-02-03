import type { Response } from "express";
import type { AuthRequest } from "../utils/auth.middleware.js";
import Order from "../model/order.model.js";
import Cart from "../model/cart.model.js";

// Import the actual Model objects
import { User } from "../model/user.model.js"; 
import Product from "../model/product.model.js";

/**
 * Reusable helper using actual Model references instead of strings
 * This prevents "Schema hasn't been registered" errors.
 */
const populateOrderDetails = async (order: any) => {
  return await order.populate([
    { path: "user", model: User, select: "name email" },
    { path: "items.product", model: Product }
  ]);
};

// POST /api/orders - Create order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { billingDetails, shippingDetails } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 1. Fetch and Validate Cart
    const userCart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      model: Product // Using Model object
    });

    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // 2. Prepare order items & calculate total
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

    // 3. Create and SAVE the order first
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "pending",
      billingDetails,
      shippingDetails
    });

    await order.save();

    // 4. Update Stock & Clear Cart
    for (const cartItem of userCart.items) {
      await Product.findByIdAndUpdate(cartItem.product, {
        $inc: { quantity: -cartItem.quantity }
      });
    }

    userCart.items = [];
    await userCart.save();

    // 5. SAFE POPULATION
    // We wrap this in a sub-try-catch so that if population fails, 
    // the user STILL gets a success message since the order is already in the DB.
    try {
      await populateOrderDetails(order);
    } catch (popErr) {
      console.error("⚠️ Population warning:", popErr.message);
      // Continue anyway, the order is safe in the DB.
    }

    // 6. Return response (Frontend expects 'order' object)
    return res.status(201).json({ 
      message: "Order placed successfully", 
      order: {
        ...order.toObject(),
        id: order._id // Ensure 'id' exists for your frontend navigate()
      } 
    });

  } catch (error: any) {
    console.error("❌ CRITICAL ORDER ERROR:", error.message);
    return res.status(500).json({ 
      message: "Failed to create order", 
      details: error.message 
    });
  }
};

// GET /api/orders - User orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user?.id })
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

// PATCH /api/orders/:id/cancel - User cancels their own order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user?.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({ message: "Cannot cancel an order that has already been shipped." });
    }

    order.status = "cancelled";
    await order.save();

    // RESTORE STOCK
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

// GET /api/orders/admin/all - Admin only
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    // Basic check: You should have an 'admin' role check here!
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", model: User, select: "name email" });
      
    res.status(200).json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// PATCH /api/orders/:id/status - Admin only
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Status updated", order });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update status" });
  }
};