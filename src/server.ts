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
dotenv.config()

const port = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

createAdminAcount()

// Routes
app.use("/api/categories", router);
app.use("/api/product", productRouter);
app.use("/api/users", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/oders" , OrderRouter)
app.use("/admin" , adminRouter)

app.use("/api-docs", swagger);

// START SERVER
app.listen(port, async () => {
    await connectDB()
    console.log(`app is running on port ${port}`);
});