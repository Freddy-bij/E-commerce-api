import type { Response } from "express";
import cart from "../model/card.model.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

// GET /api/cart/:userId
export const getCart = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const userCart = await cart.findOne({ user: userId }).populate("items.product");

  if (!userCart) {
    return res.status(200).json({ items: [] });
  }

  res.json(userCart);
};

// POST /api/cart/:userId/items
export const addItemToCart = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let userCart = await cart.findOne({ user: userId });

  if (!userCart) {
    userCart = await cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });
  } else {
   const itemIndex = userCart.items.findIndex(
  (item) => item.product.toString() === productId
);

if (itemIndex > -1) {
  const item = userCart.items[itemIndex];
  if (item) {
    item.quantity += quantity; 
  }
} else {
  // create a proper subdocument
  userCart.items.push(
    new userCart.items.create({ product: productId, quantity })
  )
}

    await userCart.save();
  }

  res.status(200).json(userCart);
};

// PUT /api/cart/:userId/items/:id
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const { userId, id } = req.params;
  const { quantity } = req.body;

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const userCart = await cart.findOne({ user: userId });

  if (!userCart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const item = userCart.items.id(id);

  if (!item) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  item.quantity = quantity;
  await userCart.save();

  res.status(200).json(userCart);
};

// DELETE /api/cart/:userId/items/:id
export const removeCartItem = async (req: AuthRequest, res: Response) => {
  const { userId, id } = req.params;

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const userCart = await cart.findOne({ user: userId });

  if (!userCart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  userCart.items = userCart.items.filter((item) => item._id.toString() !== id);

  await userCart.save();

  res.status(200).json(userCart);
};

// DELETE /api/cart/:userId
export const clearCart = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (req.user?.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await cart.findOneAndDelete({ user: userId });

  res.status(200).json({ message: "Cart cleared successfully" });
};
