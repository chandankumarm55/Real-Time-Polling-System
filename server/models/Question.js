// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true,
    },
    options: [{
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
        isCorrect: {
            type: Boolean,
            default: false,
        },
        votedBy: [{
            type: String, // Socket IDs of students who voted for this option
        }],
    }],
    timeLimit: {
        type: Number,
        default: 60, // seconds
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
    isActive: {
        type: Boolean,
        default: true,
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

// Pre-save middleware to calculate percentages
questionSchema.pre('save', function() {
    this.calculatePercentages();
});

module.exports = mongoose.model('Question', questionSchema);