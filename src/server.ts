import express from "express"
import dotenv from "dotenv"
import router from "./router/categories.router.js"
import productRouter from "./router/product.router.js"
import userRouter from "./router/users.router.js"
import swagger from "./swagger.js"
import cartRouter from "./router/card.router.js"
import { connectDB } from "./config/db.js"
import { createAdminAcount } from "./script/admin.js"
import OrderRouter from "./router/order.routes.js"
import { adminRouter } from "./router/admin.routes.js"
import cors from "cors"
import path from "path"
import multer from "multer"
import fs from "fs"

dotenv.config()

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// CRITICAL FIX: Serve from uploads folder (NOT public/uploads)
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// Debug logging
console.log("\n🔍 SERVER CONFIGURATION:");
console.log("📁 Project root:", process.cwd());
console.log("📁 Serving static files from:", uploadsPath);
console.log("📁 Uploads folder exists:", fs.existsSync(uploadsPath));

if (fs.existsSync(uploadsPath)) {
  const files = fs.readdirSync(uploadsPath);
  console.log("📸 Files in uploads folder:", files.length);
  if (files.length > 0) {
    console.log("📸 Files:", files);
  }
}
console.log("\n");

// Create admin account
createAdminAcount()

// API Routes
app.use("/api/categories", router);
app.use("/api/product", productRouter);
app.use("/api/users", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/oders", OrderRouter)
app.use("/admin", adminRouter)

// Swagger Documentation
app.use("/api-docs", swagger);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    uploadsPath: uploadsPath,
    cwd: process.cwd()
  });
});

// Error handling middleware (MUST be after all routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ 
        message: "File size is too large. Max 5MB allowed." 
      });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err) {
    console.error("Error:", err);
    return res.status(400).json({ message: err.message || "An error occurred" });
  }
  
  next();
});

// 404 handler - MUST be last
app.use((req, res) => {
  console.log("❌ 404 - Route not found:", req.path);
  res.status(404).json({ message: "Route not found" });
});

const port = process.env.PORT || 3000;

// START SERVER
app.listen(port, async () => {
  await connectDB()
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
  console.log(`🔗 CORS enabled for: http://localhost:5173`);
  console.log(`\n💡 Test image: http://localhost:${port}/uploads/short-1769611098893-681424976.jpg\n`);
});

export default app;