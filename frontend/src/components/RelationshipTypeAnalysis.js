import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronDown,
  Upload
} from 'lucide-react';
import { relationshipService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import RelationshipAnalyticsEmptyState from './RelationshipAnalyticsEmptyState';
import RelationshipMetrics from './RelationshipMetrics';

const RelationshipTypeAnalysis = ({ relationship, refreshData, onImportClick, hideImportBanner }) => {
  const { darkMode } = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const [showImportAnimation, setShowImportAnimation] = useState(false);
  
  useEffect(() => {
    // Fetch relationship type-specific analysis if the relationship ID is available
    if (relationshipId && relationship?.relationshipType) {
      fetchAnalysis();
    }
    
    // Show the import animation after 3 seconds if no analysis data
    const timer = setTimeout(() => {
      if (!analysis || !analysis.metrics || Object.keys(analysis.metrics).length === 0) {
        setShowImportAnimation(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [relationshipId, relationship?.relationshipType]);
  
  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      
      // Call the API endpoint for relationship type analysis with timestamp to bust cache
      const timestamp = Date.now();
      
      const response = await relationshipService.getTypeAnalysis(relationshipId, {
        params: { timestamp },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log("topic-anlysis",response);
      
      if (response.data && response.data.success) {
        setAnalysis(response.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching relationship type analysis:', error);
      setLoading(false);
    }
  };
  
  const handleImportChat = () => {
    // Add a subtle animation or highlight effect before navigating
    setShowImportAnimation(false); // Hide any visible animations
    
    // Add a little delay for visual feedback
    setTimeout(() => {
      sessionStorage.setItem('refreshRelationshipData', 'true');
      sessionStorage.setItem('returnToRelationship', relationshipId);
      
      // Use provided onImportClick if available, otherwise navigate
      if (typeof onImportClick === 'function') {
        onImportClick();
      } else {
        navigate(`/relationships/${relationshipId}/import`);
      }
    }, 300);
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Normalize relationship type for styling consistency
  const normalizeRelationshipType = (type) => {
    if (!type) return 'other';
    
    type = type.toLowerCase();
    
    if (type === 'partner') return 'romantic';
    if (type === 'friend') return 'friendship';
    if (type === 'colleague') return 'professional';
    if (['mentor', 'mentee', 'acquaintance', 'other'].includes(type)) return 'mentor/other';
    
    return type;
  };
  
  const normalizedType = normalizeRelationshipType(relationship?.relationshipType);
  
  // Get color based on relationship type for styling
  const getRelationshipColor = (type, isDarkMode) => {
    switch (type?.toLowerCase()) {
      case 'romantic':
      case 'partner':
        return isDarkMode ? '#9f1239' : '#fb7185'; // Rose
      case 'friendship':
      case 'friend':
        return isDarkMode ? '#1d4ed8' : '#3b82f6'; // Blue
      case 'professional':
      case 'colleague':
        return isDarkMode ? '#0f766e' : '#14b8a6'; // Teal
      case 'family':
        return isDarkMode ? '#a16207' : '#eab308'; // Yellow
      case 'mentor':
      case 'mentee':
      case 'acquaintance':
      case 'other':
        return isDarkMode ? '#7e22ce' : '#a855f7'; // Purple
      default:
        return isDarkMode ? '#4f46e5' : '#6366f1'; // Indigo
    }
  };
  
  // Determine if we have any analysis data yet
  const hasAnalysisData = analysis && Object.keys(analysis).length > 0 && 
                          analysis.metrics && Object.keys(analysis.metrics).length > 0;
  
  // Get section title based on relationship type
  const getRelationshipTitle = (type) => {
    switch (type?.toLowerCase()) {
      case 'romantic':
      case 'partner':
        return 'Romantic Relationship Analytics';
      case 'friendship':
      case 'friend':
        return 'Friendship Analytics';
      case 'professional':
      case 'colleague':
        return 'Professional Relationship Analytics';
      case 'family':
        return 'Family Relationship Analytics';
      case 'mentor':
      case 'mentee':
      case 'acquaintance':
      case 'other':
        return 'Mentor/Mentee Relationship Analytics';
      default:
        return 'Relationship Type Analysis';
    }
  };

  const relationshipColor = getRelationshipColor(relationship?.relationshipType, darkMode);

  return (
    <div 
      style={{
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: darkMode ? 
          '0 4px 12px rgba(0, 0, 0, 0.2)' : 
          '0 4px 12px rgba(0, 0, 0, 0.08)',
        marginBottom: '16px',
        border: darkMode ? 
          '1px solid rgba(45, 45, 45, 0.2)' : 
          '1px solid rgba(226, 232, 240, 0.8)',
        backgroundColor: darkMode ? '#0d0d0d' : '#ffffff',
      }}
    >
      <div 
        style={{
          background: relationshipColor,
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '18px',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
        onClick={toggleExpanded}
      >
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {getRelationshipTitle(relationship?.relationshipType)}
        </span>
        <ChevronDown 
          size={24} 
          style={{ 
            transition: 'transform 0.3s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          }} 
        />
      </div>
      
      <div 
        style={{
          maxHeight: expanded ? '2000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.5s ease',
          background: darkMode ? '#121212' : '#ffffff',
          padding: expanded ? '0' : '0',
        }}
      >
        {!hasAnalysisData && relationship && !hideImportBanner && (
          <div style={{ padding: '24px 20px' }}>
            <RelationshipAnalyticsEmptyState 
              relationshipType={relationship?.relationshipType}
              contactName={relationship?.contactName || 'your contact'}
              onImportClick={handleImportChat}
            />
          </div>
        )}
        
        {hasAnalysisData && (
          <div style={{ padding: '24px 20px' }}>
            <RelationshipMetrics 
              analysis={analysis} 
              darkMode={darkMode} 
              relationshipColor={relationshipColor}
              relationshipType={relationship?.relationshipType} // Add this prop
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipTypeAnalysis;