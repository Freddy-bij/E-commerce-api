import { Router } from "express";
import { getAllOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { authenticateToken } from "../utils/auth.middleware.js";

const adminRouter = Router();

// Admin order routes (protected + admin role check in controller)
adminRouter.get("/orders", authenticateToken, getAllOrders);
adminRouter.patch(
  "/orders/:id/status",
  authenticateToken,
  updateOrderStatus
);

export { adminRouter };