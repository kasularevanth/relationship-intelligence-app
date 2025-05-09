import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  ArrowRight, 
  ChevronRight,
  MessageCircle
} from 'lucide-react';

// Phase definitions based on your project overview
const PHASES = {
  ONBOARDING: {
    name: 'onboarding',
    title: 'Onboarding & History',
    description: 'Let\'s get a feel for this relationship.',
    sampleQuestions: [
      "How did you and [Name] meet?",
      "What's your favorite memory with them?", 
      "How often do you talk or see each other?",
      "What do you usually talk about?"
    ]
  },
  EMOTIONAL_MAPPING: {
    name: 'emotional_mapping',
    title: 'Emotional Mapping',
    description: 'Now let\'s explore the emotional dynamics.',
    sampleQuestions: [
      "What do you love or appreciate most about [Name]?",
      "What role do they play in your life?",
      "How do you feel after talking to them?",
      "Have they been there for you during hard times?"
    ]
  },
  DYNAMICS_TENSIONS: {
    name: 'dynamics_tensions',
    title: 'Dynamics & Tensions',
    description: 'Let\'s get honest about the hard parts too.',
    sampleQuestions: [
      "When was the last time you felt disconnected or misunderstood by them?",
      "What's something they do that triggers or annoys you?",
      "Have you ever argued or had a conflict? What happened?",
      "Do you feel like the relationship is balanced?"
    ]
  },
  DUAL_LENS_REFLECTION: {
    name: 'dual_lens_reflection',
    title: 'Dual-Lens Reflection',
    description: 'Now let\'s switch perspectives and build empathy.',
    sampleQuestions: [
      "How do you think they would describe this relationship?",
      "How do you think they view you?",
      "What might they say you bring to their life?",
      "What's something you wish they knew about you?"
    ]
  }
};

const VoiceSession = () => {
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(PHASES.ONBOARDING);
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [userInput, setUserInput] = useState(''); // For text input fallback
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch relationship data on mount
  useEffect(() => {
    const fetchRelationshipData = async () => {
      try {
        const res = await axios.get(`/api/relationships/${relationshipId}`);
        setRelationship(res.data);

        // Create a new conversation for this session
        const conversationRes = await axios.post('/api/conversations', {
          relationship: relationshipId,
          title: `Conversation with ${res.data.contactName} - ${new Date().toLocaleDateString()}`,
          status: 'active'
        });
        setConversation(conversationRes.data);

        // Add initial ai message
        const welcomeMessage = {
          role: 'ai',
          content: `Hi there! Let's talk about your relationship with ${res.data.contactName}. How did you two meet?`,
          phase: PHASES.ONBOARDING.name
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to conversation
        await axios.post(`/api/conversations/${conversationRes.data._id}/messages`, welcomeMessage);
        
      } catch (err) {
        console.error('Error setting up conversation:', err);
        setError('Failed to set up conversation. Please try again.');
      }
    };

    if (relationshipId) {
      fetchRelationshipData();
    }

    // Set up audio recording capabilities
    const setupAudioRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          await processAudio(audioBlob);
        };
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setError('Microphone access denied. Please enable microphone access or use text input instead.');
        // Switch to text input mode if microphone access is denied
        setInputMode('text');
      }
    };

    setupAudioRecording();

    // Cleanup
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [relationshipId]);

  // Process audio recording
  const processAudio = async (audioBlob) => {
    if (!conversation) return;
    
    setIsProcessing(true);
    
    try {
      // Create form data to send audio
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('conversationId', conversation._id);
      formData.append('phase', currentPhase.name);
      
      // Send audio to backend for processing
      const response = await axios.post('/api/conversations/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add user message
      const userMessage = {
        role: 'user',
        content: response.data.transcription,
        phase: currentPhase.name
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Save user message to conversation
      await axios.post(`/api/conversations/${conversation._id}/messages`, userMessage);
      
      // Add AI response
      if (response.data.aiResponse) {
        const assistantMessage = {
          role: 'ai',
          content: response.data.aiResponse,
          phase: currentPhase.name,
          insights: response.data.insights || []
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save ai message to conversation
        await axios.post(`/api/conversations/${conversation._id}/messages`, assistantMessage);
        
        // Check if we should advance to next phase
        checkPhaseProgression(response.data.aiResponse);
      }
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again or switch to text input.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle text input submission
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !conversation) return;
    
    try {
      // Add user message
      const userMessage = {
        role: 'user',
        content: userInput,
        phase: currentPhase.name
      };
      
      setMessages(prev => [...prev, userMessage]);
      setUserInput('');
      setIsProcessing(true);
      
      // Save user message to conversation
      await axios.post(`/api/conversations/${conversation._id}/messages`, userMessage);
      
      // Get AI response
      const response = await axios.post(`/api/conversations/${conversation._id}/ai-response`, {
        userMessage,
        phase: currentPhase.name
      });
      
      // Add AI response
      if (response.data.aiResponse) {
        const assistantMessage = {
          role: 'ai',
          content: response.data.aiResponse,
          phase: currentPhase.name,
          insights: response.data.insights || []
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save ai message to conversation
        await axios.post(`/api/conversations/${conversation._id}/messages`, assistantMessage);
        
        // Check if we should advance to next phase
        checkPhaseProgression(response.data.aiResponse);
      }
      
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start voice recording
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Toggle input mode between voice and text
  const toggleInputMode = () => {
    setInputMode(inputMode === 'voice' ? 'text' : 'voice');
  };

  // Check if we should advance to the next conversation phase
  const checkPhaseProgression = (aiResponse) => {
    // Logic to determine if we should move to the next phase
    // This is a simplified version - in production you might want more sophisticated logic
    
    // Count messages in current phase
    const phaseMessages = messages.filter(msg => msg.phase === currentPhase.name);
    
    // Check for phase-specific keywords in AI response
    const containsProgressionWords = (response) => {
      const progressionPhrases = [
        "Let's move on to discuss",
        "Now that we've explored",
        "Let's talk about the emotional aspects",
        "Let's shift our focus",
        "Now I'd like to understand"
      ];
      
      return progressionPhrases.some(phrase => response.includes(phrase));
    };
    
    // Progress to next phase if we have enough messages or AI suggests progression
    if ((phaseMessages.length >= 6) || containsProgressionWords(aiResponse)) {
      advanceToNextPhase();
    }
  };

  // Advance to next conversation phase
  const advanceToNextPhase = async () => {
    let nextPhase;
    
    switch(currentPhase.name) {
      case PHASES.ONBOARDING.name:
        nextPhase = PHASES.EMOTIONAL_MAPPING;
        break;
      case PHASES.EMOTIONAL_MAPPING.name:
        nextPhase = PHASES.DYNAMICS_TENSIONS;
        break;
      case PHASES.DYNAMICS_TENSIONS.name:
        nextPhase = PHASES.DUAL_LENS_REFLECTION;
        break;
      case PHASES.DUAL_LENS_REFLECTION.name:
        // We've reached the end of the session
        completeSession();
        return;
      default:
        nextPhase = PHASES.ONBOARDING;
    }
    
    setCurrentPhase(nextPhase);
    
    // Add transition message
    const transitionMessage = {
      role: 'ai',
      content: `Great! Now let's move on to the next phase: ${nextPhase.title}. ${nextPhase.description}`,
      phase: nextPhase.name
    };
    
    setMessages(prev => [...prev, transitionMessage]);
    
    // Save transition message
    if (conversation) {
      await axios.post(`/api/conversations/${conversation._id}/messages`, transitionMessage);
    }
  };

  // Force progression to next phase
  const forceNextPhase = () => {
    advanceToNextPhase();
  };

  // Complete the conversation session
  const completeSession = async () => {
    try {
      if (!conversation) return;
      
      // Add completion message
      const completionMessage = {
        role: 'ai',
        content: `Thank you for sharing about your relationship with ${relationship?.contactName}. I've gathered valuable insights that will help build a richer understanding of this connection. You can now view a summary of our conversation.`,
        phase: 'completion'
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      // Save completion message
      await axios.post(`/api/conversations/${conversation._id}/messages`, completionMessage);
      
      // Update conversation status to completed
      await axios.patch(`/api/conversations/${conversation._id}`, {
        status: 'completed'
      });
      
      // Navigate to conversation summary page
      setTimeout(() => {
        navigate(`/relationships/${relationshipId}/conversations/${conversation._id}/summary`);
      }, 3000);
      
    } catch (err) {
      console.error('Error completing session:', err);
      setError('Failed to complete session. Please try again.');
    }
  };

  // Render phase indicator
  const renderPhaseIndicator = () => {
    const phases = Object.values(PHASES);
    const currentIndex = phases.findIndex(phase => phase.name === currentPhase.name);
    
    return (
      <div className="flex items-center justify-center mb-6">
        {phases.map((phase, index) => (
          <div key={phase.name} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${currentIndex >= index ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              {index + 1}
            </div>
            {index < phases.length - 1 && (
              <div className={`h-1 w-12 ${currentIndex > index ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render message item
  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    return (
      <div 
        key={index} 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div 
          className={`max-w-3/4 p-3 rounded-lg
            ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          {message.content}
        </div>
      </div>
    );
  };

  // Render phase questions
  const renderPhaseQuestions = () => {
    return (
      <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
        <h3 className="text-sm font-medium text-indigo-800 mb-2">Sample Questions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {currentPhase.sampleQuestions.map((question, index) => (
            <div 
              key={index} 
              className="text-sm p-2 bg-white rounded border border-indigo-200 cursor-pointer hover:bg-indigo-100"
              onClick={() => setUserInput(question.replace('[Name]', relationship?.contactName || 'them'))}
            >
              {question.replace('[Name]', relationship?.contactName || 'them')}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!relationship) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              Conversation with {relationship.contactName}
            </h1>
            <button 
              onClick={() => navigate(`/relationships/${relationshipId}`)}
              className="p-1 rounded hover:bg-indigo-600"
            >
              <ArrowRight size={24} />
            </button>
          </div>
          <p className="text-sm opacity-80">{currentPhase.title}</p>
        </div>
        
        {/* Phase progress indicator */}
        <div className="p-4 bg-gray-50 border-b">
          {renderPhaseIndicator()}
        </div>

        {/* Error message if any */}
        {error && (
          <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 mb-4">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages container */}
        <div className="p-4 h-96 overflow-y-auto bg-gray-50">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>

        {/* Sample questions for current phase */}
        {renderPhaseQuestions()}

        {/* Input area */}
        <div className="p-4 border-t">
          {inputMode === 'voice' ? (
            <div className="flex justify-center items-center space-x-4">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  disabled={isProcessing}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600"
                >
                  <Square size={24} />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700"
                >
                  <Mic size={24} />
                </button>
              )}
              
              <button
                onClick={toggleInputMode}
                className="p-2 text-gray-500 hover:text-indigo-600"
              >
                <MessageCircle size={20} />
                <span className="text-xs block mt-1">Text</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="flex space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Type a message about ${relationship.contactName}...`}
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || !userInput.trim()}
                className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
              <button
                type="button"
                onClick={toggleInputMode}
                className="p-2 text-gray-500 hover:text-indigo-600"
              >
                <Mic size={20} />
                <span className="text-xs block mt-1">Voice</span>
              </button>
            </form>
          )}

          {isProcessing && (
            <div className="text-center mt-2 text-sm text-gray-500">
              Processing your message...
            </div>
          )}
          
          {/* Next phase button (only visible to admins or for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-center">
              <button 
                onClick={forceNextPhase}
                className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700 hover:bg-gray-300"
              >
                Debug: Next Phase
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceSession;