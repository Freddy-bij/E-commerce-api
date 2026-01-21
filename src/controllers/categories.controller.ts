// import type { Request, Response } from "express"
// import {  category } from "../model/category.model.js"

// export const createCategory = async (req:Request, res:Response ) => {
//     try {
//         const {name,description} = req.body
//         const categories = await category.create({name , description})
//         res.status(201).json({ categories , message:"category created sucessfully"})
//     } catch (error) {
//         res.status(500).json({ message: "category fail to be created"})
//     }
// }

// export const getAllCategories = async(req:Request , res:Response) => {
//     try {
//       const categories = await category.find({})
//       res.status(200).json(categories)
        
//     } catch (error) {
//         res.status(404).json({message: "categories not found"})
//     }
// }

// export const getCategory = async(req:Request , res:Response) => {
          

//           try {
//             const {id} = req.params
//           const categoryinfo = category.findById(id)
//           res.status(200).json(categoryinfo)
//           } catch (error) {
            
//           }
// }
// export const uppdateCategory = async (req:Request, res:Response) =>{
//     try {
//         const {id} = req.params
//         const status = req.body
 
//         const uppdateCategory = await category.findByIdAndUpdate(id, status, {new:true})
//         if(!uppdateCategory){
//             res.status(404).json({message:"category not found"})
//         }
//         res.status(200).json(uppdateCategory)
//     } catch (error) {
//         res.status(500).json({message:"failed to update category"})
//     }
// }

// export const deleteCategory = async (req:Request, res:Response) =>{
//     try {
//         const {id} = req.params
//         const deletedCategory = await category.findByIdAndDelete(id)
//         if(!deletedCategory){
//             res.status(404).json({message:"category not found"})
//         }
//         res.status(200).json({message:"category deleted successfully"})
//     } catch (error) {
        
//     }
// }


import type { Request, Response } from "express"
import { category } from "../model/category.model.js"

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ message: "Name is required" })
    }

    const categoryCreated = await category.create({
      name,
      description
    })

    res.status(201).json({
      category: categoryCreated,
      message: "Category created successfully"
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Category failed to be created",
      error
    })
  }
}

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await category.find({})
    res.status(200).json(categories)
  } catch (error) {
    res.status(404).json({ message: "Categories not found" })
  }
}

export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const categoryInfo = await category.findById(id)
    
    if (!categoryInfo) {
      return res.status(404).json({ message: "Category not found" })
    }
    
    res.status(200).json(categoryInfo)
  } catch (error) {
    res.status(500).json({ message: "Error fetching category" })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deletedCategory = await category.findByIdAndDelete(id)

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" })
    }
    
    res.status(200).json({ message: "Category deleted successfully" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error deleting category" })
  }
}

export const uppdateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description

    const updatedCategory = await category.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    )
    
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" })
    }
    
    res.status(200).json(updatedCategory)
  } catch (error) {
    res.status(500).json({ message: "Failed to update category" })
  }
}
