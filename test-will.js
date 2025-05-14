import mongoose from 'mongoose';
import Will from './server/models/Will.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'server', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/memorial')
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Create a test Will
    const testWill = new Will({
      owner: 'test-user-id',
      roomId: 'test-room-id',
      uploaderName: 'Test User',
      farewellMessage: 'This is a test message',
      videoFilename: ''
    });
    
    // Save the test Will
    return testWill.save();
  })
  .then(savedWill => {
    console.log('Successfully created Will:', savedWill);
    
    // Clean up - delete the test Will
    return Will.deleteOne({ _id: savedWill._id });
  })
  .then(() => {
    console.log('Test complete, cleaning up');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error in test:', err);
    mongoose.disconnect();
  }); 