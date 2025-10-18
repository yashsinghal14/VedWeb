import React, { useState, useEffect } from 'react';

const ChatWindow = ({ socket, roomId }) => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        console.log("Received a message from another user:", data);
        setChatLog((prevLog) => [...prevLog, data]);
      });
    }

    return () => {
      if (socket) {
        socket.off('receive-message');
      }
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const messageData = {
        roomId,
        message,
        sender: `User ${socket.id.substring(0, 5)}`,
      };
      socket.emit('send-message', messageData);
      setChatLog((prevLog) => [...prevLog, messageData]); // Display your own message immediately
      setMessage('');
    }
  };

  return (
    <div style={{ width: '300px', border: '1px solid #ccc', marginLeft: '20px' }}>
      <div style={{ height: '400px', overflowY: 'scroll', padding: '10px' }}>
        {chatLog.map((item, index) => (
          <div key={index}>
            <strong>{item.sender}:</strong> {item.message}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ width: '80%', padding: '5px' }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;