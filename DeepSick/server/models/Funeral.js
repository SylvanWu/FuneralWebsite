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

// Main Funeral schema
const funeralSchema = new mongoose.Schema({
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
            'Chinese Traditional Funeral'
        ]
    },
    ceremonySteps: [stepSchema]
}, {
    timestamps: true
});

// Create indexes for better query performance
funeralSchema.index({ organizerId: 1 });
funeralSchema.index({ createdAt: -1 });

const Funeral = mongoose.model('Funeral', funeralSchema);
export default Funeral;