const ChatMessage = require('../models/ChatMessage');

// Send a chat message
exports.sendMessage = async(req, res) => {
    try {
        const { sender, senderRole, message, socketId } = req.body;

        if (!sender || !senderRole || !message) {
            return res.status(400).json({
                success: false,
                message: 'Sender, role, and message are required',
            });
        }

        const chatMessage = new ChatMessage({
            sender,
            senderRole,
            message,
            socketId,
        });

        await chatMessage.save();

        res.status(201).json({
            success: true,
            data: chatMessage,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get chat history
exports.getChatHistory = async(req, res) => {
    try {
        const { limit = 50 } = req.query;

        const messages = await ChatMessage.find()
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages.reverse(), // Reverse to show oldest first
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Clear chat history
exports.clearChatHistory = async(req, res) => {
    try {
        await ChatMessage.deleteMany({});

        res.status(200).json({
            success: true,
            message: 'Chat history cleared',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};