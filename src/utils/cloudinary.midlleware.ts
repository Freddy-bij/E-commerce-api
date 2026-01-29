import multer from "multer";
import path from "path";

// Use memory storage instead of disk storage
// Files will be stored in memory as Buffer objects
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log("🔍 Filtering file:", file.originalname, "mimetype:", file.mimetype);
  
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log("✅ File passed filter");
    return cb(null, true);
  }
  
  console.log("❌ File rejected by filter");
  cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
};

// Create multer upload instance with memory storage
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

console.log("📤 Multer configured with memory storage for Cloudinary upload");