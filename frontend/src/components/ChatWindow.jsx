import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../services/chatApi';

const ChatWindow = ({ chatId, recipient, initialMessages = [] }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id || user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data && (!chatId || data.chatId === chatId)) {
        setMessages((prev) => [
          ...prev,
          {
            sender: { _id: data.senderId, name: 'Participant' },
            message: data.message?.message || data.message || '',
            timestamp: new Date()
          }
        ]);
      }
    };

    socket.on('chat:message', handleNewMessage);

    return () => {
      socket.off('chat:message', handleNewMessage);
    };
  }, [socket, chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const msg = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await chatApi.sendMessage({
        chatId: chatId || undefined,
        recipientId: recipient?._id || recipient?.id || undefined,
        message: msg
      });

      if (res.success && res.data?.messages) {
        setMessages(res.data.messages);
      } else {
        // Optimistic UI update
        setMessages((prev) => [
          ...prev,
          {
            sender: { _id: currentUserId, name: user?.name },
            message: msg,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to send message:', err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="glass-panel-static"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '520px',
        borderRadius: '24px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.7)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}
          >
            {recipient?.name?.charAt(0) || <UserIcon size={18} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
              {recipient?.name || 'Conversation'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {recipient?.role === 'provider' ? 'Service Provider' : 'Customer'}
            </div>
          </div>
        </div>

        <span className="live-pulse">
          <span className="live-dot"></span> Live
        </span>
      </div>

      {/* Message List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
            No messages yet. Say hello to start the conversation!
          </div>
        ) : (
          messages.map((m, idx) => {
            const senderId = m.sender?._id || m.sender;
            const isMe = String(senderId) === String(currentUserId);

            return (
              <div
                key={idx}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  background: isMe
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : 'rgba(255, 255, 255, 0.9)',
                  color: isMe ? '#ffffff' : '#0f172a',
                  padding: '0.75rem 1rem',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
                  fontSize: '0.92rem'
                }}
              >
                <div>{m.message}</div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: isMe ? 'rgba(255, 255, 255, 0.75)' : '#94a3b8',
                    textAlign: 'right',
                    marginTop: '0.25rem'
                  }}
                >
                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '0.85rem 1.25rem',
          background: 'rgba(255, 255, 255, 0.85)',
          borderTop: '1px solid rgba(226, 232, 240, 0.7)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="form-input"
          style={{ padding: '0.65rem 1rem', borderRadius: '999px' }}
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="btn-primary"
          style={{ width: '42px', height: '42px', padding: 0, borderRadius: '50%' }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
