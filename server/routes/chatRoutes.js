const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getChatHistory,
    clearChatHistory,
} = require('../controllers/chatController');

// @route   POST /api/chat/send
// @desc    Send a chat message
router.post('/send', sendMessage);

// @route   GET /api/chat/history
// @desc    Get chat history
router.get('/history', getChatHistory);

// @route   DELETE /api/chat/clear
// @desc    Clear chat history
router.delete('/clear', clearChatHistory);

module.exports = router;