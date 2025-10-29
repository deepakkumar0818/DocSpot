import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    console.log("Connecting to MongoDB...");
    console.log("hellos ",process.env.MONGODB_URI)
    try {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });

        await mongoose.connect(`${process.env.MONGODB_URI}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        console.log('\n⚠️  MongoDB Connection Failed!');
        console.log('Please check your .env file and ensure:');
        console.log('1. MONGODB_URI is set correctly');
        console.log('2. For MongoDB Atlas: username and password are correct');
        console.log('3. For local MongoDB: MongoDB service is running\n');
        process.exit(1);
    }
}

export default connectDB