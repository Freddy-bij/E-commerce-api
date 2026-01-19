import type { Request, Response } from "express"
import { product } from "../model/product.model.js"
import { category } from "../model/category.model.js"


export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, categoryId, quantity } = req.body

    if (!name || !price || !quantity) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const cat = await category.findById(categoryId)
    if (!cat) {
      return res.status(404).json({ message: "Category not found" })
    }

    const inStock = quantity > 0

    const productCreated = await product.create({
      name,
      price,
      description,
      categoryId,
      quantity,
      inStock
    })

    res.status(201).json({
      product: productCreated,
      message: "Product created successfully"
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "product fail to be created",
      error
    })
  }
}


export const getAllProducts = async(req:Request , res:Response) => {
    try {
      const products = await product.find({})
      res.status(200).json(products)
        
    } catch (error) {
        res.status(404).json({message: "products not found"})
    }
}

 export const getProduct = async(req:Request , res:Response) => {

          try {
            const {id} = req.params
          const productinfo = await product.findById(id)
          res.status(200).json(productinfo)
          } catch (error) {
            
          }
}

export const deleteProduct = async (req:Request , res:Response) =>{
    try {
        const {id}= req.params
        const deletedProduct = await product.findByIdAndDelete(id)
    
        if(!deletedProduct){
            res.status(404).json({message: "product not found"})
        }
        res.status(200).json({message:"product deleted successfully"})
    } catch (error) {
        console.log(error)
    }
}
 export const uppddateProduct = async (req:Request, res:Response) =>{
    try {
        const {id} = req.params
        const { name , price , description, categoryId, quantity} = req.body

        const uppdateData: any = {}

        if (name !== undefined) uppdateData.name = name
        if (price !== undefined) uppdateData.price = price 
        if ( description !== undefined) uppdateData.description = description
        if (categoryId !== undefined) uppdateData.categoryId = categoryId
        
        if (quantity !== undefined) {
            uppdateData.quantity = quantity
            uppdateData.instock = quantity > 0
        }
 
        const uppdateProduct = await product.findByIdAndUpdate(id, uppdateData , {new:true})
        if(!uppdateProduct){
            res.status(404).json({message: "product not found"})
        }
        res.status(200).json(uppdateProduct)
    } catch (error) {
      res.status(500).json({message: "failed to update product"})  
    }
 }