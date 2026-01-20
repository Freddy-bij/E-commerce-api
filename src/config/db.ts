import mongoose from "mongoose";

 export const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI! || "mongodb+srv://freddybijanja31_db_user:GMsUJGC8lQCEELQR@cluster0.y8omqxv.mongodb.net/?appName=Cluster0")
        console.log(`data succefully connected: ${conn.connection.host}`)
    } catch (error) {
        console.log('connection failed')
    }
 }