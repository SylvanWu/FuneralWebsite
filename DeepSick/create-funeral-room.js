// Script to create a funeral room in the database for testing
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config({
    path: path.resolve(path.dirname(fileURLToPath(
        import.meta.url)), './server/.env')
});

// Define the Funeral schema for MongoDB
const canvasItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    color: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String }
});

const funeralSchema = new mongoose.Schema({
    organizerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    stringId: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    sceneType: { type: String, required: true },
    deceasedName: { type: String, trim: true },
    deceasedImage: { type: String },
    backgroundImage: { type: String },
    password: { type: String },
    canvasItems: [canvasItemSchema],
    ceremonySteps: Array
}, { timestamps: true });

// Create the model
const Funeral = mongoose.model('Funeral', funeralSchema);

async function createTestFuneralRoom() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/memorial');
        console.log('Connected to MongoDB!');

        // Create a default organizer ID
        const organizerId = new mongoose.Types.ObjectId('000000000000000000000000');

        // Check if test funeral rooms already exist
        const existingRooms = await Funeral.find({ stringId: { $in: ['testroom1', 'testroom2', 'testroom3'] } });

        if (existingRooms.length > 0) {
            console.log(`Found ${existingRooms.length} existing test rooms. Skipping creation.`);

            // List the found rooms
            existingRooms.forEach(room => {
                console.log(`Room: ${room.deceasedName}, ID: ${room.stringId || room._id}, Type: ${room.sceneType}`);
            });
        } else {
            // Create test funeral rooms
            const testRooms = [{
                    stringId: 'testroom1',
                    title: 'Test Funeral Room 1',
                    organizerId,
                    sceneType: 'Church Funeral',
                    deceasedName: 'John Smith',
                    password: 'test123',
                    backgroundImage: '',
                    canvasItems: []
                },
                {
                    stringId: 'testroom2',
                    title: 'Test Funeral Room 2',
                    organizerId,
                    sceneType: 'Garden Funeral',
                    deceasedName: 'Mary Johnson',
                    password: 'test123',
                    backgroundImage: '',
                    canvasItems: []
                },
                {
                    stringId: 'testroom3',
                    title: 'Test Funeral Room 3',
                    organizerId,
                    sceneType: 'Forest Funeral',
                    deceasedName: 'David Williams',
                    password: 'test123',
                    backgroundImage: '',
                    canvasItems: []
                }
            ];

            console.log('Creating test funeral rooms...');
            await Funeral.insertMany(testRooms);
            console.log('Test funeral rooms created successfully!');
        }

        // Display all funeral rooms in the database
        console.log('\nAll funeral rooms in database:');
        const allRooms = await Funeral.find({})
            .select('stringId _id deceasedName sceneType title');

        allRooms.forEach(room => {
            console.log(`- ${room.deceasedName || room.title}, ID: ${room.stringId || room._id}, Type: ${room.sceneType}`);
        });

    } catch (error) {
        console.error('Error creating test funeral rooms:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createTestFuneralRoom();