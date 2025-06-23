import React, { useState, useRef, useEffect } from 'react';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const ChatWindow = ({ chat = [], onSendMessage, conversationId,  onFirstMessage }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
//   console.log("Product card data:", msg.products);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!conversationId) {
      console.error("Conversation ID is missing!");
      return;
    }
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this chat?")) {
      window.location.reload();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, message]);

  return (
    <div className="chat-window flex flex-col flex-1 p-4">
      <div className="messages flex-grow mb-4 overflow-y-auto">
        {!conversationId ? (
  <div className="text-center text-gray-200 font-bold">Start a new chat…</div>
) : chat.length === 0 ? (
  <div className="text-center text-gray-200 font-bold">No messages yet. Say something!</div>
        ) : (
          chat.map((msg, index) => (
            <div key={index} className="message-pair">
              <div className='py-2 flex justify-end'>
                {msg.user && (
                  <div className="user-message bg-[#3C3D37] p-4 rounded-full inline-block max-w-full">
                    <strong className='text-purple-300'>User:</strong> {msg.user}
                    <div className="text-xs text-gray-400 text-right">{msg.timestamp}</div>
                  </div>
                )}
              </div>
              <div className='py-2'>
                <div className="bot-message text-left text-black">
  {msg.bot && (
    <div className="mb-2">
      <strong className='text-purple-300'>Bot:</strong> {msg.bot}
    </div>
  )}

  {Array.isArray(msg.products) && msg.products.length > 0 && (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
      {msg.products.map((product, i) => (
        <div key={i} className="bg-white text-black p-3 rounded shadow-md max-w-md border">
          <img
  src={
    product.image
      ? `${BACKEND_URL}${product.image}`
      : "https://via.placeholder.com/150?text=No+Image"
  }
  alt={product.name}
  className="w-full h-32 object-contain mb-2"
/>

          <p><strong>{product.name || 'Unnamed Product'}</strong></p>
          <p>Price: ₹{product.price ?? 'N/A'}</p>
          <p>Rating: ⭐ {product.rating ?? 'N/A'}</p>
        </div>
      ))}
    </div>
  )}
</div>

              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex-none flex">
        <input
  type="text"
  value={message}
  onChange={(e) => {
    setMessage(e.target.value);
    if (!conversationId && onFirstMessage) {
      onFirstMessage(); // 🔥 trigger auto-start of conversation
    }
  }}
  placeholder={!conversationId ? "Start a new chat..." : "Type a message"}
  className="border p-2 flex-grow text-gray-800"
/>

        <button type="submit" className="bg-[#ECDFCC] text-gray-800 p-2 ml-2">
          Send
        </button>
        <button type="button" onClick={handleReset} className="bg-red-500 text-white p-2 ml-2 rounded">
          Reset
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
