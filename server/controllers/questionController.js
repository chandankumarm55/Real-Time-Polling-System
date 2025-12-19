const Question = require('../models/Question');
const Student = require('../models/Student');

// Create a new question/poll
exports.createQuestion = async(req, res) => {
    try {
        const { questionText, options, timeLimit } = req.body;

        // Validate input
        if (!questionText || !options || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Question text and at least 2 options are required',
            });
        }

        // Auto-close any active questions before creating new one
        const activeQuestion = await Question.findOne({ isActive: true });
        if (activeQuestion) {
            activeQuestion.isActive = false;
            activeQuestion.endedAt = new Date();
            await activeQuestion.save();
            console.log('Auto-closed previous active question:', activeQuestion._id);
        }

        // Format options
        const formattedOptions = options.map(opt => ({
            text: typeof opt === 'string' ? opt : opt.text,
            isCorrect: opt.isCorrect || false,
            votes: 0,
            percentage: 0,
            votedBy: [],
        }));

        // Get active students count
        const activeStudents = await Student.countDocuments({ isActive: true, isKicked: false });

        // Create new question
        const question = new Question({
            questionText,
            options: formattedOptions,
            timeLimit: timeLimit || 60,
            expectedStudents: activeStudents,
            isActive: true,
        });

        await question.save();

        res.status(201).json({
            success: true,
            data: question,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get active question
exports.getActiveQuestion = async(req, res) => {
    try {
        const question = await Question.findOne({ isActive: true });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'No active question found',
            });
        }

        res.status(200).json({
            success: true,
            data: question,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Submit answer
exports.submitAnswer = async(req, res) => {
    try {
        const { questionId, optionIndex, studentId } = req.body;

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found',
            });
        }

        if (!question.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This question is no longer active',
            });
        }

        // Check if option index is valid
        if (optionIndex < 0 || optionIndex >= question.options.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid option',
            });
        }

        // Check if student already voted
        const alreadyVoted = question.options.some(opt =>
            opt.votedBy.includes(studentId)
        );

        if (alreadyVoted) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted your answer',
            });
        }

        // Record the vote
        question.options[optionIndex].votes += 1;
        question.options[optionIndex].votedBy.push(studentId);
        question.totalVotes += 1;

        // Calculate percentages
        question.calculatePercentages();

        // Check if all students answered
        if (question.totalVotes >= question.expectedStudents) {
            question.allStudentsAnswered = true;
        }

        await question.save();

        // Update student's current answer
        await Student.findOneAndUpdate({ socketId: studentId }, {
            currentAnswer: {
                questionId: question._id,
                optionIndex,
                answeredAt: new Date(),
            },
        });

        res.status(200).json({
            success: true,
            data: question,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get poll results
exports.getPollResults = async(req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                questionText: question.questionText,
                options: question.options.map(opt => ({
                    text: opt.text,
                    votes: opt.votes,
                    percentage: opt.percentage,
                    isCorrect: opt.isCorrect,
                })),
                totalVotes: question.totalVotes,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get poll history
exports.getPollHistory = async(req, res) => {
    try {
        const questions = await Question.find({ isActive: false })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data: questions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Close/End active question
exports.closeQuestion = async(req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findByIdAndUpdate(
            questionId, {
                isActive: false,
                endedAt: new Date(),
            }, { new: true }
        );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found',
            });
        }

        res.status(200).json({
            success: true,
            data: question,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};