if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const port = process.env.PORT || 8080;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FRONT_ENDS = process.env.FRONT_ENDS.split(',');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || FRONT_ENDS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

const eCommerceData = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));

const extractTextFromImage = async (fileBuffer) => {
  try {
    const processedImage = await sharp(fileBuffer).toBuffer();
    const result = await Tesseract.recognize(processedImage, 'eng');
    return result.data.text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to process image');
  }
};

app.post('/api/V1/chat', async (req, res) => {
  const { message } = req.body;
  const file = req.files?.file;

  try {
    let fileContent = '';
    if (file) {
      if (file.mimetype.startsWith('image/')) {
        fileContent = await extractTextFromImage(file.data);
      } else if (file.mimetype === 'application/pdf') {
        fileContent = file.data.toString('utf8');
      } else {
        return res.status(400).json({ error: 'Unsupported file format' });
      }
    }

    const fileContext = fileContent ? `\n\nFile content:\n${fileContent}` : '';
    const context = eCommerceData
      .map((item) => `Product: ${item.title}\nDescription: ${item.description}`)
      .join('\n\n');

    const instructions = `
      - Keep responses short and crisp (maximum 50 words).
      - Avoid redundant text or excessive formatting (e.g., "**", "*").
      - Use bullet points or simple sentences for readability.
    `;

    const prompt = `
      You are an eCommerce assistant. Use the following data to answer queries succinctly:\n${context}${fileContext}
      \n\nInstructions:${instructions}
      \n\nUser: ${message}\nAssistant:
    `;

    const model = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);

    const cleanedResponse = result.response.text().replace(/[*]+/g, '').trim();

    res.status(200).json({ response: cleanedResponse });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});


app.get('/', (req, res) => {
  res.status(200).json({
    root: 'Standard root',
  });
});

app.all('*', (req, res, next) => {
  const error = new Error('No such routes available');
  error.statusCode = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});


app.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});
