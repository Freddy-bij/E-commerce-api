
import { Router } from "express";
import { authenticateToken } from "../utils/auth.middleware.js";
import { 
  cancelOrder, 
  createOrder, 
  getOrderById, 
  getUserOrders,
  getAllOrders,
  updateOrderStatus 
} from "../controllers/order.controller.js";

const OrderRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *         name:
 *           type: string
 *           description: Product name (snapshot)
 *         price:
 *           type: number
 *           format: float
 *           description: Product price at order time
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity ordered
 *       example:
 *         product: 507f191e810c19729de860ea
 *         name: iPhone 15 Pro
 *         price: 1200
 *         quantity: 2
 *     
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Order ID
 *         user:
 *           type: string
 *           description: User ID reference
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalAmount:
 *           type: number
 *           format: float
 *           description: Total order amount
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *           description: Order status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 507f1f77bcf86cd799439011
 *         user: 507f191e810c19729de860ea
 *         items:
 *           - product: 507f191e810c19729de860eb
 *             name: iPhone 15 Pro
 *             price: 1200
 *             quantity: 2
 *         totalAmount: 2400
 *         status: pending
 *         createdAt: 2024-01-15T10:30:00.000Z
 *         updatedAt: 2024-01-15T10:30:00.000Z
 *     
 *     OrderResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         order:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             items:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderItem'
 *             totalAmount:
 *               type: number
 *             status:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *       example:
 *         message: Order placed successfully
 *         order:
 *           id: 507f1f77bcf86cd799439011
 *           items:
 *             - product: 507f191e810c19729de860eb
 *               name: iPhone 15 Pro
 *               price: 1200
 *               quantity: 2
 *           totalAmount: 2400
 *           status: pending
 *           createdAt: 2024-01-15T10:30:00.000Z
 *     
 *     UpdateOrderStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *           description: New order status
 *           example: confirmed
 *     
 *     OrderError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         details:
 *           type: string
 *       example:
 *         message: Failed to create order
 *         details: Cart is empty
 */

/**
 * @swagger
 * tags:
 *   - name: Orders (Customer)
 *     description: Customer order management endpoints
 *   - name: Orders (Admin)
 *     description: Admin order management endpoints
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order from cart
 *     description: Creates a new order from the user's cart items. Validates stock, reduces inventory, and clears the cart.
 *     tags: [Orders (Customer)]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Bad request - Cart is empty or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *             examples:
 *               emptyCart:
 *                 value:
 *                   message: Cart is empty. Add items before placing an order.
 *               insufficientStock:
 *                 value:
 *                   message: Insufficient stock
 *                   details: Only 5 units of iPhone 15 Pro available
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 */
OrderRouter.post("/", authenticateToken, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for logged-in user
 *     description: Retrieves all orders placed by the authenticated user, sorted by creation date (newest first)
 *     tags: [Orders (Customer)]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 */
OrderRouter.get("/", authenticateToken, getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get single order by ID
 *     description: Retrieves details of a specific order. Users can only view their own orders.
 *     tags: [Orders (Customer)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderItem'
 *                     totalAmount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Invalid order ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *       403:
 *         description: Forbidden - Can only view own orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. You can only view your own orders.
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 */
OrderRouter.get("/:id", authenticateToken, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     description: Cancels a pending order and restores product stock. Only orders with "pending" status can be cancelled.
 *     tags: [Orders (Customer)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID to cancel
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: cancelled
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid ID or order cannot be cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *             examples:
 *               cannotCancel:
 *                 value:
 *                   message: Order cannot be cancelled
 *                   details: Orders can only be cancelled when status is "pending". Current status: shipped
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *       403:
 *         description: Forbidden - Can only cancel own orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. You can only cancel your own orders.
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 */
OrderRouter.patch("/:id/cancel", authenticateToken, cancelOrder);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     description: Retrieves all orders with pagination and optional status filtering. Requires admin role.
 *     tags: [Orders (Admin)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *         description: Filter orders by status
 *         example: pending
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of orders per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalCount:
 *                       type: integer
 *                       example: 98
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       items:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/OrderItem'
 *                       totalAmount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin role required.
 *       500:
 *         description: Server error
 */
OrderRouter.get("/admin/orders", authenticateToken, getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     description: Updates the status of an order. Validates status transitions and restores stock if cancelled. Requires admin role.
 *     tags: [Orders (Admin)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusInput'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: confirmed
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Bad request - Invalid status or transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderError'
 *             examples:
 *               invalidStatus:
 *                 value:
 *                   message: Invalid status
 *                   validStatuses: [pending, confirmed, shipped, delivered, cancelled]
 *               invalidTransition:
 *                 value:
 *                   message: Invalid status transition
 *                   details: Cannot change status from "delivered" to "pending"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin role required.
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
OrderRouter.patch("/admin/orders/:id/status", authenticateToken, updateOrderStatus);

export default OrderRouter;