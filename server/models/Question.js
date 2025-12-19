const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    votes: {
        type: Number,
        default: 0,
    },
    percentage: {
        type: Number,
        default: 0,
    },
    votedBy: [{
        type: String, // Student socket IDs or names
    }],
});

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: [optionSchema],
    timeLimit: {
        type: Number,
        default: 60, // in seconds
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    totalVotes: {
        type: Number,
        default: 0,
    },
    expectedStudents: {
        type: Number,
        default: 0,
    },
    allStudentsAnswered: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: {
        type: Date,
    },
});

// Method to calculate percentages
questionSchema.methods.calculatePercentages = function() {
    if (this.totalVotes === 0) {
        this.options.forEach(option => {
            option.percentage = 0;
        });
    } else {
        this.options.forEach(option => {
            option.percentage = Math.round((option.votes / this.totalVotes) * 100);
        });
    }
};
module.exports = mongoose.models.Question || mongoose.model('Question', questionSchema);