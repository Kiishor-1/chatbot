# eCommerce Chatbot MERN Application

This project is an eCommerce chatbot built with the MERN stack, utilizing **Google Generative AI (Gemini)** for answering user queries. The chatbot can handle text-based queries and file-based queries (e.g., images, PDFs, text files). It is designed to provide a modern chatbot interface and a robust backend for processing requests efficiently.

---

## Features

- **Chatbot Interface**: A user-friendly UI for text and file uploads.
- **Generative AI Integration**: Uses Google Generative AI (Gemini) for intelligent responses.
- **File Processing**: Supports image, PDF, and text file uploads for query context.
- **Real-time Feedback**: Displays file previews and provides immediate responses.
- **Error Handling**: Robust error messages for unsupported file types or server issues.

---

## Prerequisites

- Node.js (version 16 or later)
- MongoDB (if using a database for future extension)
- Google Generative AI API Key (Gemini)
- React (for the frontend)
- Backend tools: `express`, `cors`, `fileUpload`, `sharp`, `tesseract.js`
- Frontend tools: `react-icons`, `react-hot-toast`, `axios`

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/ecommerce-chatbot.git
   cd ecommerce-chatbot
Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```
Set up your environment variables:

Create a .env file in the backend directory and add:
env
```
PORT=8080
GEMINI_API_KEY=your_google_generative_ai_api_key
FRONT_ENDS=http://localhost:5173
```
Start the backend server:

```bash
cd backend
node app.js
```

Start the frontend:

```bash
cd ../frontend
npm run dev
```

Backend API

Endpoint: /api/V1/chat
Method: POST
Handles user queries and file uploads.

Request Body:

message: (string) Text query from the user.
file: (file) File uploaded for query context (optional).
Response:

```json

{
  "response": "Your response here."
}
```

## Frontend Setup
Configuration
Update the API endpoint in utility/api.js:

```javascript

export const BOT_ENDPOINT = {
  CHAT_WITH_BOT: "http://localhost:8080/api/V1/chat",
};
```

## Features
- Chat Interface: Displays conversation history.
- File Upload: Supports file previews for images, PDFs, and text files.
- Spinner: Indicates loading during API requests.
- Error Notifications: Uses react-hot-toast for user feedback.

## File Structure
```bash

ecommerce-chatbot/
│
├── backend/
│   ├── data/
│   │   └── data.json                # eCommerce product data
│   ├── app.js                      # Main server file
│   └── .env                        # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Chatbot.jsx         # Chatbot UI component
│   │   ├── utility/
│   │   │   └── api.js              # API endpoints
│   │   ├── App.jsx                 # Main React app
│   │   └── index.js                # Entry point
│   └── public/                     # Public assets
│
├── README.md                       # Documentation
└── package.json                    # Dependencies
```

### File Upload Instructions
Supported Formats:
Images: .jpg, .jpeg, .png
Documents: .pdf, .txt
Preview:
Images are displayed as thumbnails.
Text content is shown in a scrollable preview box.
PDFs show a placeholder text.
Development Notes

### Gemini AI Integration:

Ensure GEMINI_API_KEY is correctly configured in .env.
Adjust response instructions in app.js to meet your requirements.
Error Handling:

Frontend provides clear toast notifications for errors.
Backend validates file types and handles unsupported formats gracefully.
License
This project is licensed under the MIT License. Feel free to modify and distribute as needed.

Acknowledgments
Special thanks to Google Generative AI (Gemini) for powering the chatbot responses.

---

### Key Features of the README

1. **Comprehensive Installation Guide**:
   - Covers backend and frontend setup with environment variables.

2. **Clear API Documentation**:
   - Specifies the chatbot endpoint and its behavior.

3. **File Upload Details**:
   - Lists supported formats and preview functionality.

4. **Development Notes**:
   - Provides tips for configuring Gemini AI and error handling.

5. **File Structure**:
   - Explains the project directory organization for easy navigation.

---

