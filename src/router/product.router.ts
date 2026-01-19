import express from "express"
import { createProduct, deleteProduct, getAllProducts, getProduct, uppddateProduct } from "../controllers/product.controller.js"

const productRouter = express.Router()

productRouter.post("/" , createProduct)
productRouter.get("/" , getAllProducts )
productRouter.get("/:id" , getProduct)
productRouter.put("/:id" , uppddateProduct)
productRouter.delete("/:id" , deleteProduct)

export default productRouter
