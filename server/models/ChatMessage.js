const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
    },
    senderRole: {
        type: String,
        enum: ['teacher', 'student'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    socketId: {
        type: String,
    },
});

// Check if model exists before creating it (prevents OverwriteModelError)
module.exports = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);