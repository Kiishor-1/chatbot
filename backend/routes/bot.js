const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('./models/Conversation');
const authMiddleware = require('./middlewares/authMiddleware');
const fs = require('fs');
const path = require('path');

const app = express();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// File Upload Setup
const upload = multer({ dest: 'uploads/' });

// Route: File Upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });

    const filePath = path.resolve(req.file.path);
    const fileBuffer = fs.readFileSync(filePath);
    const pdfContent = await pdfParse(fileBuffer);

    const content = pdfContent.text;

    // Save file content to database or in-memory store
    const fileData = new Conversation({
      userId: req.user._id,
      title: req.file.originalname,
      content,
    });

    await fileData.save();
    fs.unlinkSync(filePath); // Clean up file

    res.status(200).json({ message: 'File uploaded successfully', fileId: fileData._id });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Route: Chat API
router.post('/chat', authMiddleware, async (req, res) => {
  const { message, conversationId } = req.body;

  try {
    const contextFiles = await Conversation.find({ userId: req.user._id });

    const context = contextFiles
      .map((file) => file.content)
      .join('\n');

    const prompt = `${context}\nUser: ${message}`;

    const model = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);

    const assistantMessage = result.response.text;

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      conversation.messages.push({ role: 'user', content: message });
      conversation.messages.push({ role: 'assistant', content: assistantMessage });
      await conversation.save();
    } else {
      conversation = new Conversation({
        userId: req.user._id,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: assistantMessage },
        ],
      });
      await conversation.save();
    }

    res.status(200).json({ answer: assistantMessage, conversationId: conversation._id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// Route: Get Conversation History
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id }).select('title _id');
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// Apply routes
app.use('/api', router);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));