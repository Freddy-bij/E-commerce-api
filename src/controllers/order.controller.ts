
import type { Response } from "express";
import type { AuthRequest } from "../utils/auth.middleware.js";
import Order from "../model/order.model.js";
import Cart from "../model/cart.model.js";
import  { product } from "../model/product.model.js";
import mongoose from "mongoose";

// ============================================================================
// CUSTOMER ORDER CONTROLLERS
// ============================================================================

// POST /api/orders - Create order from cart
export const createOrder = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?.id;

    if (!userId) {
      await session.abortTransaction();
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find user's cart with populated products
    const userCart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .session(session);

    if (!userCart || userCart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Cart is empty. Add items before placing an order.",
      });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of userCart.items) {
      const product = cartItem.product as any;

      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Invalid product in cart",
          details: "One or more products no longer exist",
        });
      }

      // Check stock availability
      if (product.stock < cartItem.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Insufficient stock",
          details: `Only ${product.stock} units of "${product.name}" available`,
        });
      }

      // Create order item snapshot (freeze price and product name)
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });

      totalAmount += product.price * cartItem.quantity;

      // Reduce product stock
      product.stock -= cartItem.quantity;
      await product.save({ session });
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "pending",
    });

    await order.save({ session });

    // Clear cart after successful order
  
    userCart.items.length = 0; 
await userCart.save({ session });

    await session.commitTransaction();

    // Populate user details for response
    await order.populate("user", "name email");

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        id: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({
      message: "Failed to create order",
      details: error.message,
    });
  } finally {
    session.endSession();
  }
};

// GET /api/orders - Get all orders for logged-in user
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      count: orders.length,
      orders: orders.map((order) => ({
        id: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch orders",
      details: error.message,
    });
  }
};

// GET /api/orders/:id - Get single order (own order only)
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate("user", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership
    if (order.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only view your own orders.",
      });
    }

    res.status(200).json({
      order: {
        id: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: {
          name: (order.user as any).name,
          email: (order.user as any).email,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch order",
      details: error.message,
    });
  }
};

// PATCH /api/orders/:id/cancel - Cancel order (only if pending)
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;

    if (!userId) {
      await session.abortTransaction();
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership
    if (order.user.toString() !== userId) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "Access denied. You can only cancel your own orders.",
      });
    }

    // Check if order can be cancelled
    if (order.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Order cannot be cancelled",
        details: `Orders can only be cancelled when status is "pending". Current status: ${order.status}`,
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    order.status = "cancelled";
    await order.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: "Order cancelled successfully",
      order: {
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({
      message: "Failed to cancel order",
      details: error.message,
    });
  } finally {
    session.endSession();
  }
};

// ============================================================================
// ADMIN ORDER CONTROLLERS
// ============================================================================

// GET /api/admin/orders - Get all orders (admin only)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin role required.",
      });
    }

    const { status, page = "1", limit = "20" } = req.query;

    const query: any = {};
    if (status && typeof status === "string") {
      query.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(totalCount / parseInt(limit as string)),
        totalCount,
      },
      orders: orders.map((order) => ({
        id: order._id,
        user: {
          id: (order.user as any)._id,
          name: (order.user as any).name,
          email: (order.user as any).email,
        },
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch orders",
      details: error.message,
    });
  }
};

// PATCH /api/admin/orders/:id/status - Update order status (admin only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    // Check if user is admin
    if (req.user?.role !== "admin") {
      await session.abortTransaction();
      return res.status(403).json({
        message: "Access denied. Admin role required.",
      });
    }

    if (!status) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid status",
        validStatuses,
      });
    }

    // Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate("user", "name email")
      .session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }


    // ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Validate order status transition
const isValidStatusTransition = (
  currentStatus: string,
  newStatus: string
): boolean => {
  const transitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  return transitions[currentStatus]?.includes(newStatus) || false;
};

    // Validate status transition
    if (!isValidStatusTransition(order.status, status)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid status transition",
        details: `Cannot change status from "${order.status}" to "${status}"`,
      });
    }

    // If cancelling order, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }

    order.status = status;
    await order.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: "Order status updated successfully",
      order: {
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
        user: {
          name: (order.user as any).name,
          email: (order.user as any).email,
        },
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({
      message: "Failed to update order status",
      details: error.message,
    });
  } finally {
    session.endSession();
  }
};


