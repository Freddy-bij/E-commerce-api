import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        const uri = process.env.MONGO_URI; // Make sure this matches your .env exactly

        if (!uri) {
            throw new Error("MONGO_URI is undefined. Check your .env file naming.");
        }

        const conn = await mongoose.connect(uri);
        console.log(`✅ Database connected: ${conn.connection.host}`);
    } catch (error) {
        // Logging the actual error object helps you see if it's a password or network issue
        console.error("❌ Database connection failed:");
        console.error(error);
        process.exit(1); 
    }
}