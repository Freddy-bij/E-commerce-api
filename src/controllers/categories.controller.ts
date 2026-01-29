import type { Request, Response } from "express";
import { category } from "../model/category.model.js";
import cloudinary from "../config/cloudinary.config.js";
import { Readable } from "stream";

// TypeScript declaration for req.file
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

/**
 * Helper function to upload buffer to Cloudinary
 */
const uploadToCloudinary = (buffer: Buffer, originalName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "categories", // Store in 'categories' folder in Cloudinary
        public_id: `category-${Date.now()}`, // Unique filename
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          reject(error);
        } else {
          console.log("✅ Image uploaded to Cloudinary:", result?.secure_url);
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Helper function to extract public_id from Cloudinary URL
 */
const extractPublicId = (imageUrl: string): string | null => {
  try {
    // Example URL: https://res.cloudinary.com/your-cloud/image/upload/v123456/categories/category-123.jpg
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (match && match[1]) {
      return match[1]; // Returns: categories/category-123
    }
    
    // Fallback method
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      // Get everything after 'upload/' and before the file extension
      const afterUpload = urlParts.slice(uploadIndex + 1);
      // Skip version number if present (starts with 'v')
      const startIndex = afterUpload[0]?.startsWith('v') ? 1 : 0;
      const pathWithExtension = afterUpload.slice(startIndex).join('/');
      return pathWithExtension.replace(/\.\w+$/, ''); // Remove extension
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

/**
 * Helper function to delete image from Cloudinary
 */
const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    const publicId = extractPublicId(imageUrl);

    if (!publicId) {
      console.warn("⚠️ Could not extract public_id from URL:", imageUrl);
      return;
    }

    console.log("🗑️  Attempting to delete image with public_id:", publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log("✅ Image deleted from Cloudinary:", publicId);
    } else {
      console.warn("⚠️ Cloudinary delete result:", result);
    }
  } catch (error) {
    console.error("⚠️ Failed to delete image from Cloudinary:", error);
    // Don't throw error - continue with update even if deletion fails
  }
};

/**
 * Create a new category with name, description, and image file
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Get the uploaded file from multer
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    console.log("📤 Uploading image to Cloudinary...");
    
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    // Store Cloudinary URL in database
    const img = uploadResult.secure_url;

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
    console.error("❌ Create category error:", err);
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

    // If a new file is uploaded, upload to Cloudinary
    if (req.file) {
      console.log("📤 Uploading new image to Cloudinary...");
      
      // Get old category to delete old image
      const oldCategory = await category.findById(id);
      
      // Upload new image
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      
      updateData.img = uploadResult.secure_url;
      
      // Delete old image from Cloudinary if it exists
      if (oldCategory?.img) {
        await deleteFromCloudinary(oldCategory.img);
      }
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
    console.error("❌ Update category error:", err);
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

    // Delete image from Cloudinary
    if (deletedCategory.img) {
      await deleteFromCloudinary(deletedCategory.img);
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err: unknown) {
    console.error("❌ Delete category error:", err);
    res.status(500).json({ message: "Error deleting category" });
  }
};