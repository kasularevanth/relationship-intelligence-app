import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Styled Components
const MetricsContainer = styled.div`
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1025px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const MetricCard = styled.div`
  padding: 1.25rem;
  background-color: ${({ darkMode }) => darkMode ? '#1e1e1e' : '#ffffff'};
  border-radius: 0.75rem;
  border: 1px solid ${({ darkMode }) => darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 100%;
  min-height: 140px;
  transition: all 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 120px;
  }
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ darkMode }) => darkMode ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ darkMode }) => darkMode ? '#fff' : '#111827'};
  display: flex;
  align-items: center;
  word-break: break-word;
  hyphens: auto;
  line-height: 1.3;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const MetricFooter = styled.div`
  font-size: 0.75rem;
  color: ${({ darkMode }) => darkMode ? '#6b7280' : '#9ca3af'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TopicsContainer = styled.div`
  margin-bottom: 2.5rem;
  background-color: ${({ darkMode }) => darkMode ? '#1e1e1e' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid ${({ darkMode }) => darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  animation: ${fadeIn} 0.7s ease-out;
`;

const SectionTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: ${({ darkMode }) => darkMode ? '#fff' : '#111827'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const IconBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background-color: ${props => props.bgColor || 'rgba(99, 102, 241, 0.2)'};
  color: ${props => props.color || '#818cf8'};
`;

const TopicsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const TopicTag = styled.div`
  padding: 0.5rem 1rem;
  background-color: ${({ darkMode }) => darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.8)'};
  border-radius: 9999px;
  font-size: 0.875rem;
  color: ${({ darkMode }) => darkMode ? '#e5e7eb' : '#4b5563'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid ${({ darkMode }) => darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PercentBadge = styled.span`
  background-color: ${({ darkMode }) => darkMode ? 'rgba(55, 65, 81, 0.7)' : 'rgba(209, 213, 219, 0.8)'};
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  color: ${({ darkMode }) => darkMode ? '#d1d5db' : '#4b5563'};
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    display: flex;
    flex-direction: column;
  }
`;

const InsightsCard = styled.div`
  background-color: ${({ darkMode }) => darkMode ? '#1e1e1e' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid ${({ darkMode }) => darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  animation: ${slideInLeft} 0.5s ease-out;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
`;

const RecommendationsCard = styled.div`
  background-color: ${({ darkMode }) => darkMode ? '#1e1e1e' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid ${({ darkMode }) => darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  animation: ${slideInRight} 0.5s ease-out;
  width: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
  
  /* Desktop styles */
  @media (min-width: 769px) {
    transition: all 0.3s ease;
  }
  
  /* Mobile styles - completely disable constraints */
  @media (max-width: 768px) {
    padding: 1.25rem !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
    flex: none !important;
    transition: none !important;
    
    /* Force expansion class when applied */
    &.mobile-expanded {
      height: auto !important;
      min-height: auto !important;
      max-height: none !important;
      overflow: visible !important;
    }
  }
`;

const ListContainer = styled.ul`
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${({ darkMode }) => darkMode ? '#d1d5db' : '#4b5563'};
  list-style-type: disc;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-grow: 1;
  
  @media (max-width: 768px) {
    padding-left: 1rem !important;
    margin-bottom: 0 !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    min-height: fit-content !important;
    display: block !important;
    width: 100% !important;
    padding-right: 0.5rem !important;
    line-height: 1.6 !important;
    flex: none !important;
    position: relative !important;
    
    /* Force expansion class when applied */
    &.mobile-expanded {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      min-height: fit-content !important;
    }
  }
`;

const ListItem = styled.li`
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: block;
  width: 100%;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    font-size: 0.875rem !important;
    margin-bottom: 1rem !important;
    line-height: 1.7 !important;
    white-space: normal !important;
    word-break: break-word !important;
    hyphens: auto !important;
    padding-right: 0.25rem !important;
    min-height: auto !important;
    display: block !important;
    
    &:last-child {
      margin-bottom: 0.5rem !important;
    }
  }
`;

const LastUpdated = styled.div`
  margin-top: 1.5rem;
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
`;

const RelationshipMetrics = ({ analysis, darkMode, relationshipColor, relationshipType }) => {
  const recommendationsSectionRef = useRef(null);
  const recommendationsListRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [forceExpansion, setForceExpansion] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force expansion on mobile using useLayoutEffect for synchronous execution
  useLayoutEffect(() => {
    if (isMobile && analysis.recommendations?.length > 0) {
      setForceExpansion(true);
      
      // Apply mobile expansion classes and styles
      const applyMobileExpansion = () => {
        if (recommendationsSectionRef.current) {
          const section = recommendationsSectionRef.current;
          section.classList.add('mobile-expanded');
          
          // Apply aggressive inline styles
          Object.assign(section.style, {
            height: 'auto',
            minHeight: 'auto',
            maxHeight: 'none',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            transition: 'none'
          });
        }
        
        if (recommendationsListRef.current) {
          const list = recommendationsListRef.current;
          list.classList.add('mobile-expanded');
          
          Object.assign(list.style, {
            height: 'auto',
            minHeight: 'fit-content',
            maxHeight: 'none',
            overflow: 'visible',
            display: 'block',
            width: '100%',
            flex: 'none'
          });
        }
      };
      
      // Apply immediately and after a small delay to handle race conditions
      applyMobileExpansion();
      setTimeout(applyMobileExpansion, 50);
      setTimeout(applyMobileExpansion, 200);
    }
  }, [isMobile, analysis.recommendations, forceExpansion]);

  // Additional effect to handle component updates
  useEffect(() => {
    if (isMobile && analysis.recommendations?.length > 0) {
      const interval = setInterval(() => {
        if (recommendationsSectionRef.current && recommendationsListRef.current) {
          const section = recommendationsSectionRef.current;
          const list = recommendationsListRef.current;
          
          // Check if elements are properly expanded
          const sectionHeight = section.offsetHeight;
          const listHeight = list.scrollHeight;
          
          if (sectionHeight < listHeight || list.style.maxHeight !== 'none') {
            // Force re-expansion
            Object.assign(section.style, {
              height: 'auto',
              minHeight: 'auto',
              maxHeight: 'none',
              overflow: 'visible'
            });
            
            Object.assign(list.style, {
              height: 'auto',
              maxHeight: 'none',
              overflow: 'visible'
            });
          }
        }
      }, 1000);
      
      // Clear interval after 10 seconds
      setTimeout(() => clearInterval(interval), 10000);
      
      return () => clearInterval(interval);
    }
  }, [isMobile, analysis.recommendations]);

  // Function to determine which metrics to display based on relationship type
  const renderTypeSpecificMetrics = () => {
    console.log("analysis", analysis);
    console.log("relationshipType", relationshipType);
    
    const type = relationshipType?.toLowerCase() || '';
    
    if (type.includes('romantic') || type.includes('partner')) {
      return renderRomanticMetrics();
    } else if (type.includes('friend') || type.includes('friendship')) {
      return renderFriendshipMetrics();
    } else if (type.includes('professional') || type.includes('colleague') || type.includes('work')) {
      return renderProfessionalMetrics();
    } else if (type.includes('family')) {
      return renderFamilyMetrics();
    } else if (type.includes('mentor') || type.includes('mentee')) {
      return renderMentorMetrics();
    }
    
    return renderDefaultMetrics();
  };
  
  // Render metrics for Romantic relationships
  const renderRomanticMetrics = () => {
    const romanticColors = ['#fb7185', '#f472b6', '#e879f9', '#c084fc', '#a78bfa', '#818cf8'];
    
    return (
      <MetricsGrid>
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Emotional Health</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: romanticColors[0] }}>{analysis.metrics?.emotionalHealthScore || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Overall relationship health indicator</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Conflict Frequency</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: romanticColors[1] }}>{analysis.metrics?.conflictFrequency || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>How often disagreements occur</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Attachment Style</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: romanticColors[2] }}>{analysis.metrics?.attachmentStyle || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Based on communication patterns</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Affection/Logistics</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: romanticColors[3] }}>{analysis.metrics?.affectionLogisticsRatio || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Balance between emotional and practical</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Intimacy Level</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: romanticColors[4] }}>{analysis.metrics?.intimacyLevel || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Depth of emotional connection</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Conflict Resolution</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: romanticColors[5] }}>{analysis.metrics?.conflictResolutionPattern || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>How conflicts are addressed</span>
          </MetricFooter>
        </MetricCard>
      </MetricsGrid>
    );
  };
  
  // Render metrics for Friendship relationships
  const renderFriendshipMetrics = () => {
    const friendshipColors = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8', '#1e40af'];
    
    return (
      <MetricsGrid>
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Initiation Balance</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: friendshipColors[0] }}>{analysis.metrics?.initiationBalance || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Who starts conversations</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Humor vs Depth</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: friendshipColors[1] }}>{analysis.metrics?.humorDepthRatio || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Light conversations vs serious topics</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Vulnerability</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: friendshipColors[2] }}>{analysis.metrics?.vulnerabilityIndex || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Level of personal sharing</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Longest Gap</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: friendshipColors[3] }}>{analysis.metrics?.longestGap || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Longest period without contact</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Topic Diversity</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: friendshipColors[4] }}>{analysis.metrics?.topicDiversity || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Variety in conversation subjects</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Engagement</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: friendshipColors[5] }}>{analysis.metrics?.engagementConsistency || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Consistency of communication</span>
          </MetricFooter>
        </MetricCard>
      </MetricsGrid>
    );
  };
  
  // Render metrics for Professional relationships
  const renderProfessionalMetrics = () => {
    const professionalColors = ['#14b8a6', '#20c997', '#10b981', '#059669', '#047857', '#065f46'];
    
    return (
      <MetricsGrid>
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Professional Tone</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: professionalColors[0] }}>{analysis.metrics?.professionalTone || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Level of formality</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Power Dynamic</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: professionalColors[1] }}>{analysis.metrics?.powerDynamic || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Directional pattern of leadership</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Response Time</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: professionalColors[2] }}>{analysis.metrics?.responseTime || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Average time to respond</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Task vs Social</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: professionalColors[3] }}>{analysis.metrics?.taskSocialRatio || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Work-focused vs relationship-building</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Clarity Index</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: professionalColors[4] }}>{analysis.metrics?.clarityIndex || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Clearness of communication</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Boundaries</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: professionalColors[5] }}>{analysis.metrics?.boundaryMaintenance || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Professional vs personal boundary</span>
          </MetricFooter>
        </MetricCard>
      </MetricsGrid>
    );
  };
  
  // Render metrics for Family relationships
  const renderFamilyMetrics = () => {
    const familyColors = ['#f97316', '#fb923c', '#fd7c3e', '#ff8c42', '#ff9844', '#ffa647'];
    
    return (
      <MetricsGrid>
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Family Pattern</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: familyColors[0] }}>{analysis.metrics?.familyPattern || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Primary interaction style</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Emotional Warmth</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: familyColors[1] }}>{analysis.metrics?.emotionalWarmth || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Level of affection expressed</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Family Role</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: familyColors[2] }}>{analysis.metrics?.familyRole || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Your primary role in the family</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Contact Frequency</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: familyColors[3] }}>{analysis.metrics?.interactionFrequency || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>How often you communicate</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Generation Gap</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: familyColors[4] }}>{analysis.metrics?.generationGap || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Generational differences detected</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Traditional vs. Modern</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: familyColors[5] }}>{analysis.metrics?.traditionAutonomyBalance || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Balance of values expressed</span>
          </MetricFooter>
        </MetricCard>
      </MetricsGrid>
    );
  };
  
  // Render metrics for Mentor/Mentee relationships
  const renderMentorMetrics = () => {
    const mentorColors = ['#a855f7', '#9333ea', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'];
    
    return (
      <MetricsGrid>
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Guidance Style</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: mentorColors[0] }}>{analysis.metrics?.guidanceStyle || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Direction vs collaborative approach</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Feedback Balance</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: mentorColors[1] }}>{analysis.metrics?.feedbackBalance || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Encouragement vs constructive criticism</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Growth Focus</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: mentorColors[2] }}>{analysis.metrics?.growthFocus || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Primary development area</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Follow Through</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: mentorColors[3] }}>{analysis.metrics?.followThrough || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Completion of commitments</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Knowledge Transfer</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: mentorColors[4] }}>{analysis.metrics?.knowledgeTransfer || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Teaching effectiveness</span>
          </MetricFooter>
        </MetricCard>
        
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Goal Setting</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: mentorColors[5] }}>{analysis.metrics?.goalSetting || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Structure of objectives</span>
          </MetricFooter>
        </MetricCard>
      </MetricsGrid>
    );
  };
  
  // Default metrics for any relationship type
  const renderDefaultMetrics = () => {
    return (
      <MetricsGrid>
        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Total Messages</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: relationshipColor }}>{analysis.metrics?.messageCount || 0}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Across {analysis.conversationCount || 'multiple'} conversations</span>
          </MetricFooter>
        </MetricCard>

        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Sentiment</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ 
                color: analysis.metrics?.sentimentLabel?.includes('positive') ? '#10b981' : 
                      analysis.metrics?.sentimentLabel?.includes('negative') ? '#ef4444' : 
                      '#f59e0b' 
              }}>
                {analysis.metrics?.sentimentLabel || 'N/A'}
              </span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Score: {Math.round((analysis.metrics?.sentimentScore || 0) * 100)}%</span>
          </MetricFooter>
        </MetricCard>

        <MetricCard darkMode={darkMode}>
          <div style={{ marginBottom: '0.5rem' }}>
            <MetricLabel darkMode={darkMode}>Response Time</MetricLabel>
            <MetricValue darkMode={darkMode}>
              <span style={{ color: '#60a5fa' }}>{analysis.metrics?.averageResponseTime || 'N/A'}</span>
            </MetricValue>
          </div>
          <MetricFooter darkMode={darkMode}>
            <span>Average response time</span>
          </MetricFooter>
        </MetricCard>
      </MetricsGrid>
    );
  };

  return (
    <>
      {/* Type-specific metrics section */}
      <MetricsContainer>
        {renderTypeSpecificMetrics()}
      </MetricsContainer>
      
      {/* Topics section */}
      {analysis.metrics?.topTopics && analysis.metrics.topTopics.length > 0 && (
        <TopicsContainer darkMode={darkMode}>
          <SectionTitle darkMode={darkMode}>
            <IconBadge bgColor="rgba(99, 102, 241, 0.2)" color="#818cf8">
              #
            </IconBadge>
            Top Discussion Topics
          </SectionTitle>
          <TopicsGrid>
            {analysis.metrics.topTopics?.map((topic, index) => (
              <TopicTag key={index} darkMode={darkMode}>
                <span>{topic.name}</span>
                <PercentBadge darkMode={darkMode}>
                  {topic.percentage}%
                </PercentBadge>
              </TopicTag>
            ))}
          </TopicsGrid>
        </TopicsContainer>
      )}
      
      {/* Insights and Recommendations section */}
      <InsightsGrid>
        {/* Insights */}
        {analysis.insights && analysis.insights.length > 0 && (
          <InsightsCard darkMode={darkMode}>
            <SectionTitle darkMode={darkMode}>
              <IconBadge bgColor="rgba(16, 185, 129, 0.2)" color="#34d399">
                ✓
              </IconBadge>
              Key Insights
            </SectionTitle>
            <ListContainer darkMode={darkMode}>
              {analysis.insights?.map((insight, index) => (
                <ListItem key={index}>{insight}</ListItem>
              ))}
            </ListContainer>
          </InsightsCard>
        )}
        
        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <RecommendationsCard 
            darkMode={darkMode} 
            ref={recommendationsSectionRef}
            className={isMobile ? 'mobile-expanded' : ''}
          >
            <SectionTitle darkMode={darkMode}>
              <IconBadge bgColor="rgba(245, 158, 11, 0.2)" color="#fbbf24">
                !
              </IconBadge>
              Recommendations
            </SectionTitle>
            <ListContainer 
              darkMode={darkMode} 
              ref={recommendationsListRef}
              className={isMobile ? 'mobile-expanded' : ''}
            >
              {analysis.recommendations?.map((recommendation, index) => (
                <ListItem key={index}>{recommendation}</ListItem>
              ))}
            </ListContainer>
          </RecommendationsCard>
        )}
      </InsightsGrid>
      
      {/* Last Updated */}
      {analysis.lastUpdated && (
        <LastUpdated>
          Last updated: {new Date(analysis.lastUpdated).toLocaleDateString()}
        </LastUpdated>
      )}
    </>
  );
};

export default RelationshipMetrics;