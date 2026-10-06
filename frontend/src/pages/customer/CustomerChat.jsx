import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../../services/chatApi';
import ChatWindow from '../../components/ChatWindow';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const CustomerChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await chatApi.getChatById(id);
        if (res.success && res.data) {
          setChat(res.data);
        } else {
          setError('Chat conversation not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error loading conversation');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChat();
    }
  }, [id]);

  if (loading) return <LoadingSpinner text="Connecting to conversation..." />;
  if (error || !chat) return <ErrorMessage message={error || 'Conversation not found'} />;

  const recipient = chat.provider || { name: 'Service Provider' };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary"
        style={{ marginBottom: '1.25rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <ChatWindow
        chatId={chat._id}
        recipient={recipient}
        initialMessages={chat.messages || []}
      />
    </div>
  );
};

export default CustomerChat;
