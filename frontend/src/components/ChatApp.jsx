  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import ChatSidebar from './ChatSidebar';
  import ChatWindow from './ChatWindow';
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const ChatApp = () => {
    const [chats, setChats] = useState(() => {
      const storedChats = localStorage.getItem('chats');
      return storedChats ? JSON.parse(storedChats) : [];
    });
    const [selectedChatIndex, setSelectedChatIndex] = useState(() => {
      const storedIndex = localStorage.getItem('selectedChatIndex');
      return storedIndex ? parseInt(storedIndex, 10) : 0;
    });
    const [conversations, setConversations] = useState(() => {
      const storedConversations = localStorage.getItem('conversations');
      return storedConversations ? JSON.parse(storedConversations) : [];
    });
    const userId = 'user124'; // Replace with actual user ID logic

   useEffect(() => {
  const fetchChatHistory = async () => {
    const currentConversationId = conversations[selectedChatIndex]?.conversationId;
    if (!currentConversationId) return;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/history?user_id=${userId}&conversation_id=${currentConversationId}`
      );

      const data = response.data;

      const formattedData = data.map(chat => ({
        user: chat.user_message,
        bot: chat.bot_response
      }));

      const updatedChats = [...chats];

      // If current index is undefined, initialize it
      if (!updatedChats[selectedChatIndex]) {
        updatedChats[selectedChatIndex] = [];
      }

      // Only update if chat is empty
      if (updatedChats[selectedChatIndex].length === 0) {
        updatedChats[selectedChatIndex] = formattedData;
        setChats(updatedChats);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  fetchChatHistory();
}, [selectedChatIndex, conversations]);

const handleSendMessage = async (message) => {
    // console.log("Updated chat:", updatedChats[selectedChatIndex]);

  const updatedChats = [...chats];
  if (!updatedChats[selectedChatIndex]) updatedChats[selectedChatIndex] = [];

  // Push user's message first
  console.log("Updated chat:", updatedChats[selectedChatIndex]);
  updatedChats[selectedChatIndex].push({
    user: message,
    timestamp: new Date().toLocaleString()
  });
  

  setChats([...updatedChats]);
  localStorage.setItem('chats', JSON.stringify(updatedChats));

  // Get conversation ID
  const currentConversationId = conversations[selectedChatIndex]?.conversationId;
  if (!currentConversationId) return;

  try {
    const response = await axios.post(`${BACKEND_URL}/chat`, {
      message,
      user_id: userId,
      conversation_id: currentConversationId
    });

    const { products, message: fallbackMessage } = response.data;

    if (products && products.length > 0) {
      // ✅ Insert this block here
      console.log("Response data:", response.data);

      updatedChats[selectedChatIndex].push({
        bot: 'Here are some matching products:',
        products,
        timestamp: new Date().toLocaleString()
      });
    } else {
      updatedChats[selectedChatIndex].push({
        bot: fallbackMessage || 'No products found.',
        timestamp: new Date().toLocaleString()
      });
    }

    setChats([...updatedChats]);
    localStorage.setItem('chats', JSON.stringify(updatedChats));
  } catch (error) {
    console.error('Error sending message:', error);
  }
};




    const startNewConversation = async () => {
      try {
          const response = await axios.post(`${BACKEND_URL}/new_conversation`, {
              user_id: userId
          });
          const newConversationId = response.data.conversation_id;  // Save the conversation ID
          const newConversations = [...conversations, { conversationId: newConversationId }];
          setConversations(newConversations);  // Update the conversations state
          localStorage.setItem('conversations', JSON.stringify(newConversations));  // Store conversations in localStorage
          const newChats = [...chats, []]; // Add a new empty chat array
          setChats(newChats);
          localStorage.setItem('chats', JSON.stringify(newChats)); // Store chats in localStorage
          const newIndex = newConversations.length - 1;
          setSelectedChatIndex(newIndex); // Select the new conversation
          localStorage.setItem('selectedChatIndex', newIndex); // Store selectedChatIndex in localStorage
          console.log('New conversation started:', newConversationId);
      } catch (error) {
          console.error('Error starting a new conversation:', error);
      }
    };

    const deleteConversation = async (index) => {
      const conversationId = conversations[index]?.conversationId;

      if (!conversationId) {
          console.error("Conversation ID is missing!");
          return;
      }

      try {
          await axios.delete(`${BACKEND_URL}/conversation`, {
              data: {
                  user_id: userId,
                  conversation_id: conversationId
              }
          });

          const newConversations = conversations.filter((_, i) => i !== index);
          const newChats = chats.filter((_, i) => i !== index);

          setConversations(newConversations);
          setChats(newChats);

          localStorage.setItem('conversations', JSON.stringify(newConversations));
          localStorage.setItem('chats', JSON.stringify(newChats));

          if (selectedChatIndex >= newConversations.length) {
              setSelectedChatIndex(newConversations.length - 1);
              localStorage.setItem('selectedChatIndex', newConversations.length - 1);
          }
      } catch (error) {
          console.error('Error deleting conversation:', error);
      }
    };

    const selectChat = (index) => {
      setSelectedChatIndex(index);
      localStorage.setItem('selectedChatIndex', index); // Store selectedChatIndex in localStorage
    };

    return (
      <div className="chat-app h-screen flex text-gray-100">
        <ChatSidebar
          chats={chats}
          selectChat={selectChat}
          startNewConversation={startNewConversation}
          deleteConversation={deleteConversation}
          selectedChatIndex={selectedChatIndex}
        />
        <ChatWindow
  chat={chats[selectedChatIndex] || []}
  onSendMessage={handleSendMessage}
  conversationId={conversations[selectedChatIndex]?.conversationId}
  onFirstMessage={() => {
    if (conversations.length === 0) startNewConversation();
  }}
/>

      </div>
    );
  };

  export default ChatApp;