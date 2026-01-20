import express from "express"
import { createProduct, deleteProduct, getAllProducts, getProduct, uppddateProduct } from "../controllers/product.controller.js"

const productRouter = express.Router()


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
 *               - description
 *               - categoryId
 *               - quantity
 *               - inStock
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
 *               inStock:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
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
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRouter.get("/" , getAllProducts )



/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get single product
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRouter.get("/:id" , getProduct)

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: uppdate product
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: update product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRouter.put("/:id" , uppddateProduct)


/**
 * @swagger
 * /api/product:
 *   delete:
 *     summary: delete product
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRouter.delete("/:id" , deleteProduct)

export default productRouter
