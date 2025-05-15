// MongoDB Atlas Connection Test Script
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('Testing MongoDB Atlas connection...');
console.log('MONGO_URI:', process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@') : 'Not set');

// Exit if MONGO_URI is not set
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not set in environment variables. Please check your .env file.');
  process.exit(1);
}

// MongoDB Atlas connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4,
};

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, mongoOptions)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB Atlas!');
    // List all collections in the database
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    if (collections.length === 0) {
      console.log('Database is empty. No collections found.');
    } else {
      console.log('Available collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    if (err.message.includes('ENOTFOUND')) {
      console.error('Hint: Check if the cluster URL is correct.');
    } else if (err.message.includes('Authentication failed')) {
      console.error('Hint: Check if username and password are correct.');
    } else if (err.message.includes('timed out')) {
      console.error('Hint: Check your network connection or IP whitelist settings in MongoDB Atlas.');
    }
  })
  .finally(() => {
    // Close the connection and exit
    mongoose.connection.close();
    process.exit();
  }); 