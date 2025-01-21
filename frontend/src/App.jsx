import { IoChatbox } from "react-icons/io5";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useState, useEffect, useRef } from 'react';
import Chatbot from './components/Chatbot';

const App = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const modalRef = useRef(null);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsChatbotOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">eCommerce Chatbot</h1>

      <button
        onClick={toggleChatbot}
        className="fixed bottom-4 right-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"
      >
        <IoChatbox fontSize="1.5rem" />
      </button>

      {isChatbotOpen && (
        <div
          ref={modalRef}
          className="fixed top-0 right-0 h-full lg:w-1/3 md:w-2/3 w-full bg-white shadow-xl border-l border-gray-300 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 bg-blue-500 text-white">
            <h2 className="text-lg font-bold">Chat with Us</h2>
            <button
              onClick={toggleChatbot}
              className="text-white bg-blue-400 hover:bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center"
            >
              <IoIosCloseCircleOutline/>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <Chatbot />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
