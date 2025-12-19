const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    socketId: {
        type: String,
        required: true,
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isKicked: {
        type: Boolean,
        default: false,
    },
    currentAnswer: {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
        },
        optionIndex: Number,
        answeredAt: Date,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
});

// Check if model exists before creating it (prevents OverwriteModelError)
module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);