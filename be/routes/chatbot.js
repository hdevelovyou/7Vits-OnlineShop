const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Route gửi tin nhắn tới chatbot
router.post('/message', chatbotController.sendMessage);

// Route lấy trạng thái chatbot
router.get('/status', chatbotController.getStatus);

// Route reset cuộc hội thoại
router.post('/reset', chatbotController.resetConversation);

module.exports = router; 