import { useState } from 'react';
import axios from 'axios';
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import toast from 'react-hot-toast';
import { BOT_ENDPOINT } from '../utility/api';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message && !file) {
      toast.error('Please enter a message or upload a file.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('message', message);
      if (file) {
        formData.append('file', file);
      }

      const { data } = await axios.post(BOT_ENDPOINT.CHAT_WITH_BOT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setConversation([
        ...conversation,
        ...(message ? [{ role: 'user', content: message }] : []),
        { role: 'assistant', content: data.response },
      ]);

      setMessage('');
      setFile(null);
      setFilePreview('');
    } catch (error) {
      console.error('Error sending message or file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target.result);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        setFilePreview('PDF file selected.');
      } else if (selectedFile.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target.result);
        };
        reader.readAsText(selectedFile);
      } else {
        setFilePreview('File preview not available.');
      }
    }
  };

  return (
    <div className="flex w-full text-sm flex-col p-4 bg-gray-100 h-full rounded-lg border border-gray-300 shadow-md">
      {/* Chat History */}
      <div className="flex-1 flex flex-col overflow-y-auto hideScroll p-2 border-b border-gray-300">
        {conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded-md w-[fit-content] ${msg.role === 'user'
              ? 'bg-blue-100 text-blue-900 self-end'
              : 'bg-green-100 text-green-900 self-start'
              }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      {file && (
        <div className="mt-4 border-t border-gray-300 pt-4">
          <h4 className="text-sm font-semibold text-gray-800">File Preview:</h4>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded border border-gray-300 flex flex-col items-center items-center justify-center">
              {file.type.startsWith('image/') && (
                <img src={filePreview} alt="Preview" className="max-w-full max-h-full rounded-md" />
              )}
              {file.type === 'application/pdf' && (
                <p className="text-gray-600 text-sm">PDF</p>
              )}
              {file.type.startsWith('text/') && (
                <pre className="bg-gray-200 p-2 rounded-md text-sm overflow-auto max-h-16">
                  {filePreview.slice(0, 100)}...
                </pre>
              )}
              {!filePreview && (
                <p className="text-gray-600 text-sm">Preview not available</p>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {file.name.length > 10
                ? `${file.name.slice(0, 5)}...${file.name.split('.').pop()}`
                : file.name}
            </div>
          </div>
        </div>
      )}


      <div className="flex items-center gap-2 mt-4 border border-2 rounded-full px-4 py-2">
        <label
          htmlFor="file-upload"
          className="flex items-center rounded-md cursor-pointer hover:bg-gray-300"
        >
          <MdOutlineDriveFolderUpload fontSize="1.3rem" />
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.txt"
          />
        </label>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 px-4 py-2 borde bg-inherit border-gray-300 rounded-md outline-none "
        />

        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
          disabled={isLoading} 
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
