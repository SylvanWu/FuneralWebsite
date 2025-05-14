// Define the Will data model to store users' will information,
// including the owner of the will, uploader's name, farewell message, and video filename.
import mongoose from 'mongoose';

const willSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: String,
        required: true,
        index: true
    },
    uploaderName: {
        type: String,
        required: true,
        trim: true
    },
    farewellMessage: {
        type: String,
        default: ''
    },
    videoFilename: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('Will', willSchema);
