import type { Request, Response } from "express";
import Cart from "../model/cart.model.js";
import { product as ProductModel } from "../model/product.model.js";


const populateCart = async (cart: any) => {
  return await cart.populate({
    path: 'items.product',
    model: 'Product' 
  });
};

/**
 * Get user's cart
 * GET /api/cart/:userId
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    await populateCart(cart);
    res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

/**
 * Add item to cart
 * POST /api/cart/:userId/items
 */
export const addItemToCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product ID and quantity are required" });
    }

  
    const productExists = await ProductModel.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      
      cart = new Cart({ 
        user: userId, 
        items: [{ product: productId, quantity }] 
      });
    } else {
      
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await populateCart(cart);
    
    res.status(200).json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to add item to cart" 
    });
  }
};


export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { userId, id } = req.params; // This 'id' could be Product ID OR Cart Item ID
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // 1. Try to find by Cart Item _id first
    let item = cart.items.id(id);

    // 2. If not found, try to find by the Product reference ID
    if (!item) {
      item = cart.items.find(
        (i: any) => i.product && i.product.toString() === id
      );
    }

    if (!item) {
      return res.status(404).json({ 
        message: `Item not found in cart. Searched for ID: ${id}` 
      });
    }

    // Update the quantity
    item.quantity = quantity;
    
    await cart.save();

    // Populate using our helper to ensure the frontend gets the full product data back
    await populateCart(cart);
    
    res.status(200).json(cart);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};

export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const { userId, id } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items.pull({ _id: id });
    
    await cart.save();
    await populateCart(cart);
    
    res.status(200).json(cart);
  } catch (error) {
    console.error("Remove item error:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};


export const clearCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully", cart });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};