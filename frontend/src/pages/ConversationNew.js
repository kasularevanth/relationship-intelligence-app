import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationService } from '../services/api';

const ConversationNew = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { relationshipId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const startNewConversation = async () => {
      try {
        setLoading(true);
        // Call API to start a new conversation
       
        const response = await conversationService.start(relationshipId);
        
        
        // Once created, navigate to the conversation interface
        navigate(`/conversations/${response.data.conversation._id}`);
      } catch (err) {
        console.error('Error starting conversation:', err);
        setError(err.message || 'Failed to start conversation');
        setLoading(false);
      }
    };

    startNewConversation();
  }, [relationshipId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4">Starting new conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => navigate(`/relationships/${relationshipId}`)}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Return to profile
        </button>
      </div>
    );
  }

  return null; // This component should redirect, so it doesn't normally render anything
};

export default ConversationNew;