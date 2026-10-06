import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../../services/chatApi';
import ChatWindow from '../../components/ChatWindow';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { ArrowLeft } from 'lucide-react';

const ProviderChat = () => {
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
        setError(err.response?.data?.message || err.message || 'Error loading chat conversation');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChat();
    }
  }, [id]);

  if (loading) return <LoadingSpinner text="Connecting to customer message thread..." />;
  if (error || !chat) return <ErrorMessage message={error || 'Conversation not found'} />;

  const recipient = chat.customer || { name: 'Customer' };

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

export default ProviderChat;
