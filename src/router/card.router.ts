
import express from "express"
import { addItemToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cart.controller.js";
import { authenticateToken } from "../utils/auth.middleware.js";

const cartRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Cart item ID
 *         product:
 *           type: string
 *           description: Product ID reference
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity of the product
 *       example:
 *         _id: 507f1f77bcf86cd799439011
 *         product: 507f191e810c19729de860ea
 *         quantity: 2
 *     
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Cart ID
 *         user:
 *           type: string
 *           description: User ID reference
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 507f1f77bcf86cd799439011
 *         user: 507f191e810c19729de860ea
 *         items:
 *           - _id: 507f1f77bcf86cd799439012
 *             product: 507f191e810c19729de860eb
 *             quantity: 2
 *         createdAt: 2024-01-15T10:30:00.000Z
 *         updatedAt: 2024-01-15T10:30:00.000Z
 *     
 *     AddItemInput:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID to add
 *           example: 507f191e810c19729de860ea
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity to add
 *           example: 2
 *     
 *     UpdateItemInput:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: New quantity
 *           example: 5
 *     
 *     CartError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *       example:
 *         message: Error message description
 */

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management API
 */

/**
 * @swagger
 * /api/cart/{userId}:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *         example: 507f191e810c19729de860ea
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Cart'
 *                 - type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: {}
 *                       example: []
 *       403:
 *         description: Forbidden - User can only access their own cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 */
cartRouter.get("/:userId", authenticateToken, getCart);

/**
 * @swagger
 * /api/cart/{userId}/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *         example: 507f191e810c19729de860ea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddItemInput'
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 */
cartRouter.post("/:userId/items", authenticateToken, addItemToCart);

/**
 * @swagger
 * /api/cart/{userId}/items/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *         example: 507f191e810c19729de860ea
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Cart item ID
 *         example: 507f1f77bcf86cd799439012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemInput'
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - Quantity must be at least 1
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       403:
 *         description: Forbidden - User can only modify their own cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       404:
 *         description: Cart or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 */
cartRouter.put("/:userId/items/:id", authenticateToken, updateCartItem);

/**
 * @swagger
 * /api/cart/{userId}/items/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *         example: 507f191e810c19729de860ea
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Cart item ID to remove
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       403:
 *         description: Forbidden - User can only modify their own cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       404:
 *         description: Cart or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 */
cartRouter.delete("/:userId/items/:id", authenticateToken, removeCartItem);

/**
 * @swagger
 * /api/cart/{userId}:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *         example: 507f191e810c19729de860ea
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully
 *       403:
 *         description: Forbidden - User can only clear their own cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartError'
 */
cartRouter.delete("/:userId", authenticateToken, clearCart);

export default cartRouter;