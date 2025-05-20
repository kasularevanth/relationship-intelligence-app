import React from 'react';
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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
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
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ darkMode }) => darkMode ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const MetricValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ darkMode }) => darkMode ? '#fff' : '#111827'};
  display: flex;
  align-items: center;
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
`;

const InsightsCard = styled.div`
  background-color: ${({ darkMode }) => darkMode ? '#1e1e1e' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid ${({ darkMode }) => darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  animation: ${slideInLeft} 0.5s ease-out;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const RecommendationsCard = styled.div`
  background-color: ${({ darkMode }) => darkMode ? '#1e1e1e' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid ${({ darkMode }) => darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  animation: ${slideInRight} 0.5s ease-out;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const ListContainer = styled.ul`
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${({ darkMode }) => darkMode ? '#d1d5db' : '#4b5563'};
  list-style-type: disc;
`;

const ListItem = styled.li`
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
`;

const LastUpdated = styled.div`
  margin-top: 1.5rem;
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
`;

const RelationshipMetrics = ({ analysis, darkMode, relationshipColor }) => {
  return (
    <>
      {/* Metrics section */}
      <MetricsContainer>
        <MetricsGrid>
          {/* Message Count Metric */}
          <MetricCard darkMode={darkMode}>
            <div style={{ marginBottom: '0.5rem' }}>
              <MetricLabel darkMode={darkMode}>Total Messages</MetricLabel>
              <MetricValue darkMode={darkMode}>
                <span style={{ color: relationshipColor }}>{analysis.metrics.messageCount}</span>
              </MetricValue>
            </div>
            <MetricFooter darkMode={darkMode}>
              <span>Across {analysis.conversationCount || 'multiple'} conversations</span>
            </MetricFooter>
          </MetricCard>

          {/* Sentiment Score Metric */}
          <MetricCard darkMode={darkMode}>
            <div style={{ marginBottom: '0.5rem' }}>
              <MetricLabel darkMode={darkMode}>Sentiment</MetricLabel>
              <MetricValue darkMode={darkMode}>
                <span style={{ 
                  color: analysis.metrics.sentimentLabel.includes('positive') ? '#10b981' : 
                        analysis.metrics.sentimentLabel.includes('negative') ? '#ef4444' : 
                        '#f59e0b' 
                }}>
                  {analysis.metrics.sentimentLabel}
                </span>
              </MetricValue>
            </div>
            <MetricFooter darkMode={darkMode}>
              <span>Score: {Math.round(analysis.metrics.sentimentScore * 100)}%</span>
            </MetricFooter>
          </MetricCard>

          {/* Response Time Metric */}
          <MetricCard darkMode={darkMode}>
            <div style={{ marginBottom: '0.5rem' }}>
              <MetricLabel darkMode={darkMode}>Response Time</MetricLabel>
              <MetricValue darkMode={darkMode}>
                <span style={{ color: '#60a5fa' }}>{analysis.metrics?.averageResponseTime}</span>
              </MetricValue>
            </div>
            <MetricFooter darkMode={darkMode}>
              <span>Average response time</span>
            </MetricFooter>
          </MetricCard>
        </MetricsGrid>
      </MetricsContainer>
      
      {/* Topics section */}
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
      
      {/* Insights and Recommendations */}
      <InsightsGrid>
        {/* Insights */}
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
        
        {/* Recommendations */}
        <RecommendationsCard darkMode={darkMode}>
          <SectionTitle darkMode={darkMode}>
            <IconBadge bgColor="rgba(245, 158, 11, 0.2)" color="#fbbf24">
              !
            </IconBadge>
            Recommendations
          </SectionTitle>
          <ListContainer darkMode={darkMode}>
            {analysis.recommendations?.map((recommendation, index) => (
              <ListItem key={index}>{recommendation}</ListItem>
            ))}
          </ListContainer>
        </RecommendationsCard>
      </InsightsGrid>
      
      {/* Last Updated */}
      <LastUpdated>
        Last updated: {new Date(analysis.lastUpdated).toLocaleDateString()}
      </LastUpdated>
    </>
  );
};

export default RelationshipMetrics;
