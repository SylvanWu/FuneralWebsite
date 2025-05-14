// Funeral model for storing funeral ceremony data
import mongoose from 'mongoose';

// Step schema for ceremony steps
const stepSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['welcome', 'speech', 'music', 'slideshow', 'reading', 'prayer', 'moment', 'commitment', 'farewell']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    mediaURL: {
        type: String
    },
    order: {
        type: Number,
        required: true
    }
});

// Canvas item schema for funeral room decorations
const canvasItemSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
});

// Main Funeral schema
const funeralSchema = new mongoose.Schema({
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Add stringId field to store non-ObjectId roomIds
    stringId: {
        type: String,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    sceneType: {
        type: String,
        required: true,
        enum: [
            'Church Funeral',
            'Garden Funeral',
            'Forest Funeral',
            'Seaside Funeral',
            'Starry Night Funeral',
            'Chinese Traditional Funeral',
            // Frontend keys for mapping
            'church',
            'garden',
            'forest',
            'seaside',
            'starryNight',
            'chineseTraditional'
        ]
    },
    deceasedName: {
        type: String,
        trim: true
    },
    deceasedImage: {
        type: String
    },
    funeralPicture: {
        type: String
    },
    backgroundImage: {
        type: String
    },
    password: {
        type: String
    },
    canvasItems: [canvasItemSchema],
    ceremonySteps: [stepSchema]
}, {
    timestamps: true
});

// Create indexes for better query performance
funeralSchema.index({ organizerId: 1 });
funeralSchema.index({ createdAt: -1 });

const Funeral = mongoose.model('Funeral', funeralSchema);
export default Funeral;