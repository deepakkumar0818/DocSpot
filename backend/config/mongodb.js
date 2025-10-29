import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            const dbName = mongoose.connection.db.databaseName;
            console.log(`✅ MongoDB connected successfully to database: ${dbName}`);
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        // Ensure database name is included in connection string
        let mongoURI = process.env.MONGODB_URI;
        
        // If URI doesn't have a database name, add 'prescripto' as default
        if (mongoURI && !mongoURI.includes('/prescripto') && !mongoURI.match(/\/[^/?]+(\?|$)/)) {
            // Check if it ends with / or has query params
            if (mongoURI.endsWith('/') || mongoURI.includes('?')) {
                mongoURI = mongoURI.replace(/\/(\?|$)/, '/prescripto$1');
            } else {
                mongoURI = mongoURI + '/prescripto';
            }
            console.log(`📝 Added database name to connection string`);
        }
        
        await mongoose.connect(mongoURI);
        
        // Log connection info
        const db = mongoose.connection.db;
        console.log(`🔗 Connected to database: ${db.databaseName}`);
        
        // List collections (async operation)
        try {
            const collections = await db.listCollections().toArray();
            console.log(`📊 Available collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
        } catch (err) {
            console.log(`📊 Could not list collections: ${err.message}`);
        }
        
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