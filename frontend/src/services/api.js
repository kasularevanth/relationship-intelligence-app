// frontend/src/services/api.js
import axios from 'axios';


const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});;


// Create a function to handle refresh token
const refreshTokenRequest = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await axios.post(
      process.env.NODE_ENV === 'production' 
        ? '/api/auth/refresh-token'
        : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth/refresh-token'), 
      { refreshToken }
    );
    
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); 
    throw err;
  }
};


// Import services
export const importService = {
  importChat: (relationshipId, formData) => {
    return api.post(`/relationships/${relationshipId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getImportStatus: (conversationId) => {
    return api.get(`/imports/${conversationId}/status`);
  },
  
  getImportAnalysis: (conversationId) => {
    return api.get(`/imports/${conversationId}/analysis`);
  }
};


// Relationship Services
export const relationshipService = {
  getAll: () => api.get('/relationships'),
  getById: (id) => api.get(`/relationships/${id}`),
  create: (data) => api.post('/relationships', data),
  update: (id, data) => api.put(`/relationships/${id}`, data),
  delete: (id) => api.delete(`/relationships/${id}`),
  importChat: (relationshipId, formData) => importService.importChat(relationshipId, formData),
  recalculateMetrics: (id) => api.post(`/relationships/${id}/recalculate-metrics`),
  getTypeAnalysis: (relationshipId) => api.get(`/relationships/${relationshipId}/type-analysis`),
  // In relationshipService.js
getProfileById :(id) => {
  return api.get(`/relationships/${id}/profile`);
},
  checkIfRelationshipHasConversations: async (id) => {
    try {
      const res = await api.get(`/relationships/${id}/conversations`);
      return Array.isArray(res.data) && res.data.length > 0;
    } catch (err) {
      console.error('Error checking conversations:', err);
      return false;
    }
  },
  

  getImportStatus: (conversationId) =>
    api.get(`/relationships/import/${conversationId}/status`),

  getImportAnalysis: (conversationId) =>
    api.get(`/relationships/import/${conversationId}/analysis`),

  analyzeTopics: (relationshipId) =>
    api.post(`/relationships/${relationshipId}/analyze-topics`),

  updateTopicDistribution: (relationshipId, topics) =>
    api.post(`/relationships/${relationshipId}/topics`, { topics }),

};

export const relationshipAnalysisService = {
  // Trigger a manual analysis of a relationship
  analyzeRelationship: (relationshipId) => 
    api.post(`/relationships/${relationshipId}/analyze`),
  
  // Get the detailed relationship profile including all analysis fields
  getDetailedProfile: (relationshipId) => 
    api.get(`/relationships/${relationshipId}/detailed-profile`),
  
  // Refresh relationship data after import
  refreshAfterImport: async (relationshipId) => {
    try {
      // Wait a moment to ensure backend processing has started
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Poll for analysis completion
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const response = await api.get(`/relationships/${relationshipId}`);
        
        // Check if analysis has populated the fields we need
        const relationship = response.data;
        
        if (relationship && 
            relationship.metrics && 
            relationship.metrics.depthScore &&
            relationship.metrics.emotionalVolatility &&
            relationship.topicDistribution && 
            relationship.topicDistribution.length > 0) {
          
          console.log('Relationship data successfully refreshed after import');
          return true;
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
      }
      
      console.log('Reached maximum polling attempts, triggering manual analysis');
      // If we've reached max attempts, try manual analysis
      await api.post(`/relationships/${relationshipId}/analyze`);
      
      return true;
    } catch (error) {
      console.error('Error refreshing relationship data:', error);
      return false;
    }
  }
};


// Add this to your frontend/src/services/api.js under a new questionService section

// Question Services
export const questionService = {
  askQuestion: (relationshipId, question) => 
    api.post('/relationships/question', { relationshipId, question }),
  
  getQuestionHistory: (relationshipId) => 
    api.get(`/relationships/${relationshipId}/questions`),
  
  askVoiceQuestion: (relationshipId, audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'question.webm');
    
    return api.post(`/relationships/${relationshipId}/voice-question`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }
};



// Conversation Services
export const conversationService = {
  getAll: (relationshipId) => api.get(`/relationships/${relationshipId}/conversations`),
  getById: (id) => api.get(`/conversations/${id}`),
  create: (relationshipId, data) => api.post(`/relationships/${relationshipId}/conversations`, data),
  addMessage: (conversationId, message) => api.post(`/conversations/${conversationId}/message`, { content: message.content, phase: message.phase }),
  getSummary: (conversationId) => api.get(`/conversations/${conversationId}/summary`),
  start: (relationshipId) => {
    return api.post(`/conversations/new/${relationshipId}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  },
 
 
};

// Voice Services
export const voiceService = {
  startRecording: (conversationId) => api.post(`/conversations/${conversationId}/record/start`),
  stopRecording: (conversationId, formData) => {
    // Add current phase to formData if not already present
    return api.post(`/conversations/${conversationId}/record/stop`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  getTranscript: (recordingId) => api.get(`/recordings/${recordingId}/transcript`),
  
};

// Set up request interceptor to attach token to EVERY request
api.interceptors.request.use(
  config => {
    // Get token from localStorage on EVERY request
    const token = localStorage.getItem('token');
    
   
    
    if (token) {
      // Set the Authorization header properly
      config.headers.Authorization = `Bearer ${token}`;
     
    } else {
      console.log('No token found in localStorage');
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);



api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshTokenRequest();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);



export default api;

