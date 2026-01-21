import express from "express"
import { createProduct, deleteProduct, getAllProducts, getProduct, uppddateProduct } from "../controllers/product.controller.js"

const productRouter = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - quantity
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated product ID
 *         name:
 *           type: string
 *           description: Product name
 *         price:
 *           type: number
 *           format: float
 *           description: Product price
 *         description:
 *           type: string
 *           description: Product description
 *         categoryId:
 *           type: string
 *           description: Category ID reference
 *         quantity:
 *           type: integer
 *           description: Product quantity
 *         inStock:
 *           type: boolean
 *           description: Stock availability status
 *       example:
 *         _id: 507f1f77bcf86cd799439011
 *         name: iPhone 15 Pro
 *         price: 1200
 *         description: Latest Apple smartphone with A17 chip
 *         categoryId: 64f9a2b3c1e4a9f8d1234567
 *         quantity: 50
 *         inStock: true
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API
 */

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - quantity
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15 Pro
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 1200
 *               description:
 *                 type: string
 *                 example: Latest Apple smartphone with A17 chip
 *               categoryId:
 *                 type: string
 *                 example: 64f9a2b3c1e4a9f8d1234567
 *               quantity:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category not found
 *       500:
 *         description: Server error
 */
productRouter.post("/" , createProduct)

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Products not found
 */
productRouter.get("/" , getAllProducts )

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
productRouter.get("/:id" , getProduct)

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15 Pro Max
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 1399
 *               description:
 *                 type: string
 *                 example: Updated description
 *               categoryId:
 *                 type: string
 *                 example: 64f9a2b3c1e4a9f8d1234567
 *               quantity:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to update product
 */
productRouter.put("/:id" , uppddateProduct)

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: product deleted successfully
 *       404:
 *         description: Product not found
 */
productRouter.delete("/:id" , deleteProduct)

export default productRouter