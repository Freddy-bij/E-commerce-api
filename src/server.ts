import express from "express"
import dotenv from "dotenv"
import router from "./router/categories.router.js"
import productRouter from "./router/product.router.js"
import userRouter from "./router/users.router.js"
import swagger from "./swagger.js"
import { connectDb } from "./config/db.js"
dotenv.config()

const port = process.env.PORT 

const app = express()


app.use ( express.urlencoded({ extended: true}))


app.use(express.json());
app.use("/api/categories", router);
app.use("/api/product", productRouter)
app.use("/api/users", userRouter)
app.use("/api-docs", swagger)
    


app.listen ( port , async() => {
    await connectDb()
    console.log(`app is running on port ${port}` )
})