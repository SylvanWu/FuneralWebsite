// Define the Will data model to store users' will information,
// including the owner of the will, uploader's name, farewell message, and video filename.
import mongoose from 'mongoose';

const willSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true            // Filled from req.userId after JWT verification
    },
    roomId: {
        type: String,
        required: true,           // Room ID, required
        index: true               // Add index for query optimization
    },
    uploaderName: {
        type: String,
        required: true,           // Name passed from frontend
        trim: true
    },
    farewellMessage: {
        type: String,
        default: ''               // Farewell text message
    },
    videoFilename: {
        type: String,
        default: ''               // Filename saved by multer
    }
}, {
    timestamps: true             // Automatically adds createdAt / updatedAt
});

export default mongoose.model('Will', willSchema); 