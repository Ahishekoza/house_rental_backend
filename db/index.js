import mongoose from "mongoose";


export const connectDB =async()=>{
    const DB_URL = process.env.MONGODB_URL
    const DB_NAME = process.env.MONGODB_DB_NAME
    try {
        const connectedDB = await mongoose.connect(`${DB_URL}/${DB_NAME}`)
        console.log("MongoDB connected Successfully :",connectedDB.connection.host);
    } catch (error) {
        console.log("Error connecting to MongoDB: " + error);
    }
}