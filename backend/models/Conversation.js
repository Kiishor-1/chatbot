const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  conversationId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
      content: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Conversation', ConversationSchema);
