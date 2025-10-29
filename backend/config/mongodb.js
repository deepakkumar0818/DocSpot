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

        // Get MongoDB URI from environment
        let mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.error('❌ MONGODB_URI is not set in environment variables!');
            console.log('\n⚠️  Please set MONGODB_URI in your .env file or environment variables');
            process.exit(1);
        }

        // Get database name from environment, default to 'prescripto' if not specified
        const dbName = process.env.MONGODB_DB_NAME || 'prescripto';
        
        // Check if URI already has a database name before query params
        // Pattern: checks for /databaseName? or /databaseName$ (end of string)
        const hasDbNameBeforeQuery = mongoURI.match(/\.mongodb\.net\/[^/?]+(\?|$)/);
        
        // Only add database name if it's not already in the URI
        if (!hasDbNameBeforeQuery) {
            if (mongoURI.includes('?')) {
                // URI has query parameters (like ?appName=Cluster0)
                // Insert database name before the query string
                mongoURI = mongoURI.replace(/\.mongodb\.net(\?)/, `.mongodb.net/${dbName}$1`);
                console.log(`📝 Added database name "${dbName}" before query parameters`);
            } else if (mongoURI.endsWith('/')) {
                // URI ends with /
                mongoURI = mongoURI + dbName;
                console.log(`📝 Added database name "${dbName}" to URI ending with /`);
            } else if (!mongoURI.includes('.mongodb.net/')) {
                // URI doesn't have database path after .mongodb.net
                // Insert database name before query params or at the end
                if (mongoURI.includes('?')) {
                    mongoURI = mongoURI.replace('?', `/${dbName}?`);
                } else {
                    mongoURI = mongoURI + '/' + dbName;
                }
                console.log(`📝 Added database name "${dbName}" to URI`);
            } else {
                // Has .mongodb.net/ but might be /test or empty, replace it
                mongoURI = mongoURI.replace(/\.mongodb\.net\/[^/?]*(\?|$)/, `.mongodb.net/${dbName}$1`);
                console.log(`📝 Replaced database in URI with "${dbName}"`);
            }
        } else {
            console.log(`✅ Database name already present in URI`);
        }
        
        console.log(`📝 Using database name: ${dbName}`);
        console.log(`🔗 Final MongoDB URI (without credentials): ${mongoURI.replace(/\/\/[^@]+@/, '//***:***@')}`);
        
        console.log(`🔗 Connecting to MongoDB...`);
        await mongoose.connect(mongoURI);
        
        // Log connection info
        const db = mongoose.connection.db;
        const connectedDbName = db.databaseName;
        console.log(`✅ Connected to database: ${connectedDbName}`);
        
        // Verify we're using the expected database
        if (connectedDbName !== dbName) {
            console.log(`⚠️  Warning: Connected to "${connectedDbName}" but expected "${dbName}"`);
            console.log(`   Check your MONGODB_URI and MONGODB_DB_NAME environment variables`);
        }
        
        // List collections (async operation)
        try {
            const collections = await db.listCollections().toArray();
            const collectionNames = collections.map(c => c.name);
            console.log(`📊 Available collections (${collectionNames.length}): ${collectionNames.join(', ') || 'None'}`);
        } catch (err) {
            console.log(`📊 Could not list collections: ${err.message}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        console.log('\n⚠️  MongoDB Connection Failed!');
        console.log('Please check your environment variables:');
        console.log('1. MONGODB_URI - Full MongoDB connection string');
        console.log('2. MONGODB_DB_NAME - Database name (optional, defaults to "prescripto")');
        console.log('\nFor MongoDB Atlas: Ensure username and password are correct');
        console.log('For local MongoDB: Ensure MongoDB service is running\n');
        process.exit(1);
    }
}

export default connectDB