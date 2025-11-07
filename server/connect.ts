import mongoose, { mongo } from "mongoose";

export async function connectDB(uri: string) {
    if (!uri) {
        throw new Error("No MongoDB URI provided")
    }

    mongoose.set("strictQuery", false)
    await mongoose.connect(uri)
    console.log("MongoDB connected");
}