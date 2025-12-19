// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    senderRole: {
        type: String,
        enum: ['student', 'teacher'],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
chatSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);