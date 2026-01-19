import type { Response } from "express";
import cart from "../model/cart.model.js";
import mongoose from "mongoose";
import type { AuthRequest } from "../utils/auth.middleware.js";

// Helper to validate ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// GET /api/cart/:userId
export const getCart = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const userCart = await cart.findOne({ user: userId } as any).populate("items.product");

  if (!userCart) {
    return res.status(200).json({ items: [] });
  }

  res.status(200).json(userCart);
};

// POST /api/cart/:userId/items

export const addItemToCart = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  // 1. Immediate validation (Fixes 'possibly undefined' error)
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    let userCart = await cart.findOne({ user: userId } as any);

    if (!userCart) {
      // 2. Fix .create() error by casting to any or ensuring types match
      userCart = await cart.create({
        user: userId,
        items: [{ product: productId, quantity }]
      } as any); 
    } else {
      const itemIndex = userCart.items.findIndex(
        (item) => item.product.toString() === productId
      );


      if (itemIndex > -1) {
    // 1. Get the item first
    const item = userCart!.items[itemIndex];
    
    // 2. Assert the item exists before modifying
    if (item) {
        item.quantity += quantity;
    }
} else {
    // For the push, just ensure userCart is asserted
    userCart!.items.push({ product: productId, quantity } as any);
}

      await userCart.save();
    }

    const populatedCart = await userCart.populate("items.product");
    res.status(200).json(populatedCart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/cart/:userId/items/:id
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const { userId, id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const userCart = await cart.findOne({ user: userId } as any);
  if (!userCart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const item = (userCart.items as any).id(id);
  if (!item) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  item.quantity = quantity;
  await userCart.save();

  const populatedCart = await userCart.populate("items.product");
  res.status(200).json(populatedCart);
};

// DELETE /api/cart/:userId/items/:id
export const removeCartItem = async (req: AuthRequest, res: Response) => {
  const { userId, id } = req.params;

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const userCart = await cart.findOne({ user: userId } as any);
  if (!userCart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const item =( userCart.items as any).id(id);
  if (!item) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  item.remove();
  await userCart.save();

  const populatedCart = await userCart.populate("items.product");
  res.status(200).json(populatedCart);
};

// DELETE /api/cart/:userId
export const clearCart = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await cart.findOneAndDelete({ user: userId } as any);

  res.status(200).json({ message: "Cart cleared successfully" });
};
