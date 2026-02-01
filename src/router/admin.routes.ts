// router/admin.routes.js
import { Router } from "express";
import { getAllOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { authenticateToken, authorizeAdmin } from "../utils/auth.middleware.js";

const adminRouter = Router();

// Apply security to ALL routes in this router
adminRouter.use(authenticateToken);
adminRouter.use(authorizeAdmin);

adminRouter.get("/orders", getAllOrders);
adminRouter.patch("/orders/:id/status", updateOrderStatus);

export { adminRouter };