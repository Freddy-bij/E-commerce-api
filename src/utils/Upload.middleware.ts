// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Save to uploads/categories folder
// const uploadDir = path.join(process.cwd(), "uploads", "categories");

// console.log("🔍 DEBUG: uploadDir is set to:", uploadDir);
// console.log("🔍 DEBUG: process.cwd() is:", process.cwd());

// // Ensure upload directory exists
// if (!fs.existsSync(uploadDir)) {
//   console.log("⚠️ Directory doesn't exist, creating:", uploadDir);
//   fs.mkdirSync(uploadDir, { recursive: true });
//   console.log("✅ Created uploads directory:", uploadDir);
// } else {
//   console.log("✅ Directory already exists:", uploadDir);
// }

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log("🔍 DEBUG: Saving file to destination:", uploadDir);
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     const nameWithoutExt = path.basename(file.originalname, ext);
//     const finalName = `${nameWithoutExt}-${uniqueSuffix}${ext}`;
//     console.log("🔍 DEBUG: Generated filename:", finalName);
//     console.log("🔍 DEBUG: Full path will be:", path.join(uploadDir, finalName));
//     cb(null, finalName);
//   },
// });

// // File filter to accept only images
// const fileFilter = (
//   req: Express.Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   console.log("🔍 DEBUG: Filtering file:", file.originalname, "mimetype:", file.mimetype);
//   const allowedTypes = /jpeg|jpg|png|gif|webp/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (mimetype && extname) {
//     console.log("✅ File passed filter");
//     return cb(null, true);
//   }
//   console.log("❌ File rejected by filter");
//   cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
// };

// // Create multer upload instance
// export const upload = multer({
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter,
// });

// // Log configuration
// console.log("📤 Multer configured to upload to:", uploadDir);