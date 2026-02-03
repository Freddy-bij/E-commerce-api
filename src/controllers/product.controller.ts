import type { Request, Response } from "express";
import  Product from "../model/product.model.js";
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
        folder: "products", // Store in 'products' folder in Cloudinary
        public_id: `product-${Date.now()}`, // Unique filename
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
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (match && match[1]) {
      return match[1];
    }
    
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const startIndex = afterUpload[0]?.startsWith('v') ? 1 : 0;
      const pathWithExtension = afterUpload.slice(startIndex).join('/');
      return pathWithExtension.replace(/\.\w+$/, '');
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
  }
};

/**
 * Create a new product with optional image upload
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, categoryId, quantity } = req.body;

    if (!name || !price || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cat = await category.findById(categoryId);
    if (!cat) {
      return res.status(404).json({ message: "Category not found" });
    }

    const inStock = quantity > 0;

    // Handle image upload if file is present
    let img = "";
    if (req.file) {
      console.log("📤 Uploading product image to Cloudinary...");
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      img = uploadResult.secure_url;
    }

    const productCreated = await Product.create({
      name,
      price,
      description,
      categoryId,
      quantity,
      inStock,
      img
    });

    res.status(201).json({
      product: productCreated,
      message: "Product created successfully"
    });
  } catch (error) {
    console.error("❌ Create product error:", error);
    res.status(500).json({
      message: "Product failed to be created",
      error
    });
  }
};

/**
 * Get all products
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}).populate('categoryId');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * Get a single product by ID
 */
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productInfo = await Product.findById(id).populate('categoryId');
    
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json(productInfo);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

/**
 * Update a product with optional image upload
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, description, categoryId, quantity } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    
    if (quantity !== undefined) {
      updateData.quantity = quantity;
      updateData.inStock = quantity > 0;
    }

    // Handle image upload if new file is present
    if (req.file) {
      console.log("📤 Uploading new product image to Cloudinary...");
      
      // Get old product to delete old image
      const oldProduct = await Product.findById(id);
      
      // Upload new image
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      
      updateData.img = uploadResult.secure_url;
      
      // Delete old image from Cloudinary if it exists
      if (oldProduct?.img) {
        await deleteFromCloudinary(oldProduct.img);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("❌ Update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image from Cloudinary if it exists
    if (deletedProduct.img) {
      await deleteFromCloudinary(deletedProduct.img);
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};