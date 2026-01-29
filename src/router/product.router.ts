import express from "express";
import { 
  createProduct, 
  deleteProduct, 
  getAllProducts, 
  getProduct, 
  updateProduct 
} from "../controllers/product.controller.js";
import { upload } from "../utils/cloudinary.midlleware.js";


const productRouter = express.Router();

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
 *         img:
 *           type: string
 *           description: Product image URL from Cloudinary
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 507f1f77bcf86cd799439011
 *         name: iPhone 15 Pro
 *         price: 1200
 *         description: Latest Apple smartphone with A17 chip
 *         categoryId: 64f9a2b3c1e4a9f8d1234567
 *         quantity: 50
 *         inStock: true
 *         img: https://res.cloudinary.com/demo/image/upload/v1234567/products/product-1234567890.jpg
 *         createdAt: 2024-01-15T10:30:00.000Z
 *         updatedAt: 2024-01-15T10:30:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API with Cloudinary image support
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
 *         multipart/form-data:
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
 *               img:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (optional, max 5MB, jpg/png/gif/webp)
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
productRouter.post("/", upload.single("img"), createProduct);

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products with Cloudinary image URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Failed to fetch products
 */
productRouter.get("/", getAllProducts);

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
 *       500:
 *         description: Error fetching product
 */
productRouter.get("/:id", getProduct);

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
 *         multipart/form-data:
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
 *               img:
 *                 type: string
 *                 format: binary
 *                 description: New product image file (optional, replaces old image)
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
productRouter.put("/:id", upload.single("img"), updateProduct);

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
 *         description: Product deleted successfully (image removed from Cloudinary)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error deleting product
 */
productRouter.delete("/:id", deleteProduct);

export default productRouter;