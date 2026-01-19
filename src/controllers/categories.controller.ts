import type { Request, Response } from "express"
import {  category } from "../model/category.model.js"

export const createCategory = async (req:Request, res:Response ) => {
    try {
        const {name,description} = req.body
        const categories = await category.create({name , description})
        res.status(201).json({ categories , message:"category created sucessfully"})
    } catch (error) {
        res.status(500).json({ message: "category fail to be created"})
    }
}

export const getAllCategories = async(req:Request , res:Response) => {
    try {
      const categories = await category.find({})
      res.status(200).json(categories)
        
    } catch (error) {
        res.status(404).json({message: "categories not found"})
    }
}

export const getCategory = async(req:Request , res:Response) => {
          

          try {
            const {id} = req.params
          const categoryinfo = category.findById(id)
          res.status(200).json(categoryinfo)
          } catch (error) {
            
          }
}
export const uppdateCategory = async (req:Request, res:Response) =>{
    try {
        const {id} = req.params
        const status = req.body
 
        const uppdateCategory = await category.findByIdAndUpdate(id, status, {new:true})
        if(!uppdateCategory){
            res.status(404).json({message:"category not found"})
        }
        res.status(200).json(uppdateCategory)
    } catch (error) {
        res.status(500).json({message:"failed to update category"})
    }
}

export const deleteCategory = async (req:Request, res:Response) =>{
    try {
        const {id} = req.params
        const deletedCategory = await category.findByIdAndDelete(id)
        if(!deletedCategory){
            res.status(404).json({message:"category not found"})
        }
        res.status(200).json({message:"category deleted successfully"})
    } catch (error) {
        
    }
}