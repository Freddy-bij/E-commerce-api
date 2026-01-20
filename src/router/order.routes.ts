import { Router } from "express";
import { authenticateToken } from "../utils/auth.middleware.js";
import { cancelOrder, createOrder, getOrderById, getUserOrders } from "../controllers/order.controller.js";


const OrderRouter = Router();

// Customer order routes (all protected)
OrderRouter.post("/", authenticateToken, createOrder);
OrderRouter.get("/", authenticateToken, getUserOrders);
OrderRouter.get("/:id", authenticateToken, getOrderById);
OrderRouter.patch("/:id/cancel", authenticateToken, cancelOrder);

export default OrderRouter;