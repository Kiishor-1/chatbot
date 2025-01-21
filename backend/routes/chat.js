const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middlewares/authMiddleware');
const Conversation = require('../models/Conversation');
const profitLossData = require('../data/Profit_Loss_2024.json');
const balanceSheetData = require('../data/Balance_Sheet_2024.json');
const executiveSummaryData = require('../data/Executive_Summary_2024.json');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { message, conversationId } = req.body;

  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found' });
    }

    let conversation;
    let messages = [];

    // Handle existing conversation or prepare for a new one
    if (conversationId) {
      conversation = await Conversation.findOne({ conversationId, userId: req.user?._id });

      if (conversation) {
        messages = conversation.messages.slice(-25); // Fetch last 25 messages for context
      } else {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    }

    // Add the user's new message
    messages.push({ role: 'user', content: message });

    // Provide data context for financial analysis
    const profitLossDataContext = `Here is the profit and loss data: ${JSON.stringify(profitLossData)}.`;
    const balanceSheetDataContext = `Here is the balance sheet data: ${JSON.stringify(balanceSheetData)}.`;
    const executiveSummaryDataContext = `Here is the executive summary data: ${JSON.stringify(executiveSummaryData)}.`;

    // Format the prompt for Gemini, adding context data
    const prompt = [
      ...messages.map((msg) => `${msg.role}: ${msg.content}`),
      profitLossDataContext,
      balanceSheetDataContext,
      executiveSummaryDataContext
    ].join('\n');

    // Call Gemini API
    const model = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const assistantMessage = await result.response.text();

    // Update or create the conversation
    if (conversation) {
      conversation.messages.push({ role: 'user', content: message });
      conversation.messages.push({ role: 'assistant', content: assistantMessage });
      await conversation.save();
    } else {
      // Create a new conversation
      conversation = new Conversation({
        title: message.slice(0, 20), 
        conversationId: new mongoose.Types.ObjectId(),
        userId: req.user?._id,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: assistantMessage },
        ],
      });
      await conversation.save();
    }

    // Respond with assistant's answer and conversation ID
    res.status(200).json({
      answer: assistantMessage,
      conversationId: conversation.conversationId,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});


// API: Get all conversation titles for a user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user?._id }).select('title conversationId');
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// API: Get messages for a specific conversation
router.get('/history/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findOne({ conversationId, userId: req.user?._id });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.status(200).json({ messages: conversation.messages.slice(-25) }); // Fetch last 25 messages
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: 'Failed to fetch conversation messages' });
  }
});

module.exports = router;