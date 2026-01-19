import express from "express"
import { addItemToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cart.controller.js";

const cartRouter = express.Router();


cartRouter.get("/cart/:userId", getCart);
cartRouter.post("/cart/:userId/items", addItemToCart);
cartRouter.put("/cart/:userId/items/:id", updateCartItem);
cartRouter.delete("/cart/:userId/items/:id", removeCartItem);
cartRouter.delete("/cart/:userId", clearCart);

export default cartRouter;