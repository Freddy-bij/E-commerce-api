import type { Request, Response } from "express";
import { category } from "../model/category.model.js";

// TypeScript declaration for req.file
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

/**
 * Create a new category with name, description, and image file
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Get the uploaded file path from multer
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Store relative path that can be served by Express
    const img = `/uploads/categories/${req.file.filename}`;

    const categoryCreated = await category.create({
      name,
      description,
      img,
    });

    res.status(201).json({
      category: categoryCreated,
      message: "Category created successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Category failed to be created";
    res.status(500).json({ message });
  }
};

/**
 * Get all categories from the database
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await category.find({});
    // Return 200 even if empty array (not an error condition)
    res.status(200).json(categories);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch categories";
    res.status(500).json({ message });
  }
};

/**
 * Get a single category by its MongoDB ID
 */
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoryInfo = await category.findById(id);

    if (!categoryInfo) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(categoryInfo);
  } catch (err: unknown) {
    res.status(500).json({ message: "Error fetching category" });
  }
};

/**
 * Update an existing category (allows partial updates)
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Build the update object dynamically
    const updateData: Record<string, string | undefined> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    // If a new file is uploaded, update the image path
    if (req.file) {
      updateData.img = `/uploads/categories/${req.file.filename}`;
    }

    const updatedCategory = await category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update category";
    res.status(500).json({ message });
  }
};

/**
 * Remove a category from the database
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedCategory = await category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err: unknown) {
    res.status(500).json({ message: "Error deleting category" });
  }
};