// test-model.js - Manual test for model operations
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

// Define a simplified schema for testing
const WillSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true
  },
  uploaderName: {
    type: String,
    required: true
  },
  farewellMessage: String,
  videoFilename: String
}, { timestamps: true });

// Create a model using the schema
const TestWill = mongoose.model('TestWill', WillSchema);

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/memorial')
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    try {
      // Create a test document
      const testData = {
        owner: 'test-owner-id-' + Date.now(),
        roomId: 'test-room-id-' + Date.now(),
        uploaderName: 'Test User',
        farewellMessage: 'This is a test message',
        videoFilename: ''
      };
      
      console.log('Creating test document with data:', testData);
      
      // Create and save the document
      const newWill = new TestWill(testData);
      const savedWill = await newWill.save();
      
      console.log('Successfully created test document:', savedWill.toJSON());
      
      // Find all documents in the collection
      const allWills = await TestWill.find({}).limit(5);
      console.log(`Found ${allWills.length} documents in the TestWill collection`);
      
      // Clean up - delete the test document
      await TestWill.deleteOne({ _id: savedWill._id });
      console.log('Test document cleaned up');
      
    } catch (err) {
      console.error('Error during testing:', err);
    }
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 