const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getActiveQuestion,
    submitAnswer,
    getPollResults,
    getPollHistory,
    closeQuestion,
} = require('../controllers/questionController');

// @route   POST /api/questions
// @desc    Create a new question/poll
router.post('/', createQuestion);

// @route   GET /api/questions/active
// @desc    Get active question
router.get('/active', getActiveQuestion);

// @route   POST /api/questions/answer
// @desc    Submit answer to a question
router.post('/answer', submitAnswer);

// @route   GET /api/questions/:questionId/results
// @desc    Get results for a specific question
router.get('/:questionId/results', getPollResults);

// @route   GET /api/questions/history
// @desc    Get poll history
router.get('/history', getPollHistory);

// @route   PUT /api/questions/:questionId/close
// @desc    Close/end a question
router.put('/:questionId/close', closeQuestion);

module.exports = router;