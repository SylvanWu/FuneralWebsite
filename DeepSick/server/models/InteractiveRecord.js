import mongoose from 'mongoose';

const interactiveRecordSchema = new mongoose.Schema({
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
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export const InteractiveRecord = mongoose.model('InteractiveRecord', interactiveRecordSchema); 