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

// Method to calculate percentages - ENHANCED VERSION
questionSchema.methods.calculatePercentages = function() {
    if (this.totalVotes === 0) {
        this.options.forEach(option => {
            option.percentage = 0;
        });
        return;
    }

    // Calculate percentages based on ACTUAL votes (totalVotes)
    this.options.forEach(option => {
        option.percentage = Math.round((option.votes / this.totalVotes) * 100);
    });

    // Handle rounding errors to ensure total is exactly 100%
    const totalPercentage = this.options.reduce((sum, opt) => sum + opt.percentage, 0);

    if (totalPercentage !== 100 && this.totalVotes > 0) {
        // Find the option with the most votes and adjust
        const maxVotesOption = this.options.reduce((max, opt) =>
            opt.votes > max.votes ? opt : max, this.options[0]);

        maxVotesOption.percentage += (100 - totalPercentage);
    }
};

// Pre-save middleware to calculate percentages
questionSchema.pre('save', function() {
    this.calculatePercentages();
});

module.exports = mongoose.model('Question', questionSchema);