import mongoose from 'mongoose';

const interactiveRecordSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['flower', 'candle', 'message']
    },
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: function() {
            return this.type === 'message';
        }
    },
    candleId: {
        type: Number,
        required: function() {
            return this.type === 'candle';
        }
    },
    flowerType: {
        type: String,
        required: function() {
            return this.type === 'flower';
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export const InteractiveRecord = mongoose.model('InteractiveRecord', interactiveRecordSchema); 