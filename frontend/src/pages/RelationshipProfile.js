import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  Calendar, 
  Heart, 
  AlertTriangle, 
 
  MessageCircle, 
  
  ChevronUp,
  User,
  Clock,
  BarChart2,
  PieChart,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';  // Add this import
import { useParams, useNavigate } from 'react-router-dom';
import { relationshipService, conversationService } from '../services/api';
import { Upload } from 'lucide-react';
import {Button} from '@mui/material';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload'; // Import from separate file
import RelationshipQA from '../components/RelationshipQA';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useTheme } from '../contexts/ThemeContext';
import RelationshipTypeAnalysis from '../components/RelationshipTypeAnalysis';
import EnhancedImportBanner from '../components/EnhancedImportBanner';
import AnimatedInsightsPrompt from '../components/AnimatedInsightsPrompt'


// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -80px 0; }
  100% { background-position: 80px 0; }
`;

// Styled Components
const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem; /* Increased from 1rem for more breathing room */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${props => props.darkMode ? '#ffffff' : '#1a202c'};
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 640px) {
    padding: 1.25rem; /* Ensure adequate padding even on small screens */
  }

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.5rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
    text-align: left;
    margin-bottom: 2.5rem;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-bottom: 1.25rem;
  
  @media (min-width: 640px) {
    margin-right: 2.5rem; /* Increased spacing between photo and name */
    margin-bottom: 0;
  }
`;

const AvatarDot = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  background-color: #10b981;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 10px 25px -5px rgba(99, 102, 241, 0.5),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 15px 30px -5px rgba(99, 102, 241, 0.5),
      0 0 0 1px rgba(99, 102, 241, 0.1);
  }
  
  span {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
     
  @media (min-width: 640px) {
    width: 120px;
    height: 120px;
    
    span {
      font-size: 3rem;
    }
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  
  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    color: ${props => props.darkMode ? '#ffffff' : '#1a202c'}; /* Dynamic color based on theme */
    letter-spacing: -0.025em;
    
     @media (min-width: 640px) {
      font-size: 2rem;
    }
  }
  
  .relationship-type {
    font-size: 1rem;
    color: ${props => props.darkMode ? '#e0e0e0' : '#4b5563'}; /* Dynamic color based on theme */
    margin: 0.5rem 0;
    
    @media (min-width: 640px) {
      font-size: 1.125rem;
    }
  }
  
  .stats {
    font-size: 0.813rem;
    color: ${props => props.darkMode ? '#cccccc' : '#6b7280'}; /* Dynamic color based on theme */
    display: flex;
    align-items: center;
    margin-top: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    
    svg {
      margin-right: 0.375rem;
      color: ${props => props.darkMode ? '#cccccc' : 'inherit'}; /* Dynamic color for icons */
    }
    
    @media (min-width: 640px) {
      font-size: 0.875rem;
      justify-content: flex-start;
    }
  }
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 640px) {
    gap: 1.25rem;
    grid-template-columns: repeat(2, 1fr);
    margin-bottom: 2rem;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    margin-bottom: 2.5rem;
  }
`;

// Updated MetricCard component to support dark mode
const MetricCard = styled.div`
  background: ${props => props.darkMode 
    ? 'linear-gradient(145deg, #1f2937, #111827)' 
    : 'linear-gradient(145deg, #ffffff, #f9fafb)'};
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  box-shadow: ${props => props.darkMode
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.03)'};
  position: relative;
  overflow: hidden;
  border: ${props => props.darkMode ? '1px solid rgba(75, 85, 99, 0.3)' : 'none'};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.darkMode
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03)'};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.accentColor || '#6366f1'};
  }
  
  .metric-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .metric-icon {
    color: ${props => props.accentColor || '#6366f1'};
    margin-right: 0.75rem;
  }
  
  .metric-label {
    font-size: 0.813rem;
    font-weight: 600;
    color: ${props => props.darkMode ? '#9ca3af' : '#4b5563'};
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }
  
  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.darkMode ? '#ffffff' : '#111827'};
    margin: 0.5rem 0;
    letter-spacing: -0.025em;
    word-break: break-word;
    
    @media (min-width: 768px) {
      font-size: 1.75rem;
    }
  }
  
  .metric-description {
    font-size: 0.813rem;
    color: ${props => props.darkMode ? '#9ca3af' : '#6b7280'};
    line-height: 1.5;
    
    @media (min-width: 768px) {
      font-size: 0.875rem;
    }
  }
  
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionCard = styled.div`
  background-color: ${props => props.darkMode ? '#1e1e1e' : 'white'};
  border-radius: 16px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, ${props => props.darkMode ? '0.3' : '0.05'}),
    0 2px 4px -1px rgba(0, 0, 0, ${props => props.darkMode ? '0.2' : '0.03'}),
    0 0 0 1px rgba(${props => props.darkMode ? '255, 255, 255, 0.05' : '0, 0, 0, 0.03'});
  margin-bottom: 1.25rem;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, ${props => props.darkMode ? '0.4' : '0.08'}),
      0 4px 6px -2px rgba(0, 0, 0, ${props => props.darkMode ? '0.3' : '0.05'}),
      0 0 0 1px rgba(${props => props.darkMode ? '255, 255, 255, 0.1' : '0, 0, 0, 0.03'});
  }
        
  @media (min-width: 768px) {
    margin-bottom: 1.75rem;
  }
`;

const SectionHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.25rem 1rem;
  border: none;
  background-color: ${props => props.darkMode ? '#1e1e1e' : 'white'};
  cursor: pointer;
  text-align: left;
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.darkMode ? '#ffffff' : '#111827'};
  transition: background-color 0.2s ease;
  
  &:focus {
    outline: none;
  }
  
  &:hover {
    background-color: ${props => props.darkMode ? '#2d2d2d' : '#f9fafb'};
  }
  
  .section-title {
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 0.75rem;
      color: ${props => props.darkMode ? '#818cf8' : '#6366f1'};
    }
  }
  
  .toggle-icon {
    transition: transform 0.3s ease;
    transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
    color: ${props => props.darkMode ? '#818cf8' : '#6366f1'};
  }
  
  @media (min-width: 768px) {
    padding: 1.5rem;
    font-size: 1.125rem;
  }
`;

const SectionContent = styled.div`
  padding: 0;
  max-height: ${props => props.isExpanded ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.5s ease-in-out;
`;

const SectionContentInner = styled.div`
  padding: 1.25rem 1rem;
  border-top: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6'};
  color: ${props => props.darkMode ? '#e5e7eb' : 'inherit'};
  
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;


const FieldGroup = styled.div`
  margin-bottom: 1.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .field-label {
    font-size: 0.813rem;
    color: ${props => props.darkMode ? '#9ca3af' : '#6b7280'};
    margin-bottom: 0.375rem;
    font-weight: 500;
    
    @media (min-width: 768px) {
      font-size: 0.875rem;
    }
  }
  
  .field-value {
    font-weight: 500;
    color: ${props => props.darkMode ? '#e5e7eb' : '#111827'};
    line-height: 1.5;
    font-size: 0.938rem;
    word-break: break-word;
  }
  
  @media (min-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const MemoryList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 1rem 0 0;
  
  @media (min-width: 768px) {
    margin: 1.25rem 0 0;
  }
`;

const MemoryItem = styled.li`
  display: flex;
  align-items: flex-start;
  padding: 0.875rem;
  margin-bottom: 0.875rem;
  background-color: ${props => props.bgColor || '#f9fafb'};
  border-radius: 10px;
  border-left: 4px solid ${props => props.borderColor || '#6366f1'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .memory-icon {
    color: ${props => props.iconColor || '#6366f1'};
    margin-right: 0.75rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
  
  p {
    margin: 0;
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  
  @media (min-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
    
    p {
      font-size: 0.938rem;
    }
  }
`;

const TopicChartContainer = styled.div`
  margin-top: 1.25rem;
  
  @media (min-width: 768px) {
    margin-top: 1.5rem;
  }
`;

const TopicBar = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .topic-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-size: 0.813rem;
    color: #4b5563;
    
    @media (min-width: 768px) {
      margin-bottom: 0.375rem;
      font-size: 0.875rem;
    }
  }
  
  .topic-name {
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .topic-percentage {
    font-weight: 600;
  }
  
  .topic-bar-bg {
    height: 8px;
    width: 100%;
    background-color: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .topic-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    border-radius: 4px;
    transition: width 1s ease-out;
  }
  
  @media (min-width: 768px) {
    margin-bottom: 1.25rem;
  }
`;

const InsightCard = styled.div`
  padding: 1.25rem;
  margin-top: 1.5rem;
  background-color: #eff6ff;
  border-radius: 12px;
  border-left: 5px solid #3b82f6;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
  }
  
  h4 {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #1e3a8a;
    font-size: 0.938rem;
    
    svg {
      margin-right: 0.5rem;
    }
    
    @media (min-width: 768px) {
      margin-bottom: 1rem;
      font-size: 1rem;
    }
  }
  
  p {
    color: #1e40af;
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0;
    
    @media (min-width: 768px) {
      font-size: 0.938rem;
    }
  }
  
  @media (min-width: 768px) {
    padding: 1.5rem;
    margin-top: 1.75rem;
  }
`;

const ConversationList = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 0.5rem;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ConversationItem = styled.div`
  padding: 1rem;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #f9fafb;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .conversation-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .conversation-title {
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.25rem;
    line-height: 1.3;
    font-size: 0.938rem;
    word-break: break-word;
  }
  
  .conversation-date {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
    
    svg {
      margin-right: 0.25rem;
      width: 14px;
      height: 14px;
    }
  }
  
  .conversation-status {
    font-size: 0.75rem;
    background-color: #e0e7ff;
    color: #4f46e5;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    text-transform: capitalize;
    font-weight: 500;
    white-space: nowrap;
    margin-left: 0.5rem;
  }
  
  .conversation-tone {
    font-size: 0.813rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    
    span {
      font-weight: 500;
      margin-left: 0.25rem;
      word-break: break-word;
    }
    
    @media (min-width: 768px) {
      font-size: 0.875rem;
    }
  }
  
  .view-details {
    display: flex;
    align-items: center;
    font-size: 0.813rem;
    color: #6366f1;
    font-weight: 500;
    margin-top: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s ease;
    
    svg {
      width: 16px;
      height: 16px;
      margin-left: 0.25rem;
      transition: transform 0.2s ease;
    }
  }
  
  &:hover .view-details {
    opacity: 1;
  }
  
  &:hover .view-details svg {
    transform: translateX(3px);
  }
  
  @media (min-width: 768px) {
    padding: 1.25rem;
    
    .conversation-title {
      font-size: 1rem;
    }
  }
`;

const ActionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.75rem 0 1.25rem;
  
  @media (min-width: 768px) {
    margin: 2.5rem 0 1.5rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
  width: 100%;
  max-width: 320px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(79, 70, 229, 0.4);
    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(79, 70, 229, 0.3);
  }
  
  svg {
    margin-right: 0.75rem;
  }
  
  @media (min-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1.063rem;
  }
`;

const UpdateInfo = styled.p`
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.75rem;
  
  @media (min-width: 768px) {
    font-size: 0.875rem;
    margin-top: 1rem;
  }
`;

const ViewMoreLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #6366f1;
  font-weight: 500;
  font-size: 0.813rem;
  margin: 1rem auto 0;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e0e7ff;
    color: #4f46e5;
  }
  
  svg {
    width: 16px;
    height: 16px;
    margin-left: 0.375rem;
    transition: transform 0.2s ease;
  }
  
  &:hover svg {
    transform: translateX(3px);
  }
  
  @media (min-width: 768px) {
    font-size: 0.875rem;
    margin: 1.25rem auto 0;
  }
`;

const LoadingShimmer = styled.div`
  background: #f6f7f8;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 800px 104px;
  animation: ${shimmer} 1.5s infinite linear;
  height: ${props => props.height || '16px'};
  width: ${props => props.width || '100%'};
  border-radius: ${props => props.rounded ? '50%' : '4px'};
  margin-bottom: ${props => props.mb || '0'};
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
  
  .loading-text {
    color: #6b7280;
    margin-top: 1.5rem;
    font-size: 1rem;
  }
  
  @media (min-width: 768px) {
    padding: 3rem 0;
    
    .loading-text {
      margin-top: 2rem;
      font-size: 1.063rem;
    }
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
  
  .error-icon {
    font-size: 2.5rem;
    color: #ef4444;
    margin-bottom: 1rem;
    
    @media (min-width: 768px) {
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }
  }
  
  .error-message {
    color: #ef4444;
    font-weight: 500;
    margin-bottom: 1.25rem;
    
    @media (min-width: 768px) {
      margin-bottom: 1.5rem;
    }
  }
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #4f46e5;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin: 0 auto;
    
    svg {
      margin-right: 0.5rem;
    }
    
    &:hover {
      background-color: #4338ca;
    }
  }
  
  @media (min-width: 768px) {
    padding: 3rem 0;
  }
`;

const BadgeTag = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.bgColor || '#e0e7ff'};
  color: ${props => props.textColor || '#4f46e5'};
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.688rem;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  @media (min-width: 768px) {
    font-size: 0.75rem;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0.75rem 0;
  
  @media (min-width: 768px) {
    margin: 1rem 0;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.75rem 0.75rem;
  text-align: center;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
  
  svg {
    color: #9ca3af;
    margin-bottom: 0.75rem;
  }
  
  h4 {
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.375rem;
    font-size: 0.938rem;
  }
  
  p {
    font-size: 0.813rem;
    max-width: 250px;
    margin: 0 auto;
  }
  
  @media (min-width: 768px) {
    padding: 2.5rem 1rem;
    
    svg {
      margin-bottom: 1rem;
    }
    
    h4 {
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }
    
    p {
      font-size: 0.875rem;
      max-width: 300px;
    }
  }
`;

const TabGroup = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 0.5rem;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (min-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Tab = styled.button`
  padding: 0.625rem 0.875rem;
  border: none;
  background: none;
  font-weight: 500;
  font-size: 0.813rem;
  color: ${props => props.active ? '#4f46e5' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#4f46e5' : 'transparent'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.active ? '#4f46e5' : '#4b5563'};
  }
  
  @media (min-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1.25rem 0;
  width: 100%;
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
  }
  
  button {
    flex: 1;
    width: 100%;
  }
`;

const PhotoAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  background-image: ${props => props.photoUrl ? `url(${props.photoUrl})` : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'};
  background-size: cover;
  background-position: center;
  border: 3px solid #f9fafb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 640px) {
    width: 120px;
    height: 120px;
    font-size: 3rem;
  }
`;


// Main Component
const RelationshipProfile = () => {
  const { darkMode } = useTheme(); // Import useTheme at the top
  const [relationship, setRelationship] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    history: true,
    emotional: false,
    dynamics: false,
    perspective: false,
    conversations: false
  });
  const [animateMetrics, setAnimateMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showImportBanner, setShowImportBanner] = useState(false);
  const [hasImportedData, setHasImportedData] = useState(false);

  useEffect(() => {
    // Determine if we have any analysis data yet
    const hasAnalysisData = relationship?.topicDistribution && 
                          relationship.topicDistribution.length > 0;
    
    // Show banner if no data exists (after a delay for better UX)
    if (!hasAnalysisData) {
      const timer = setTimeout(() => {
        setShowImportBanner(true);
      }, 1500); // Show after 1.5 seconds
      
      return () => clearTimeout(timer);
    }
    
    setHasImportedData(hasAnalysisData);
  }, [relationship]);

  useEffect(() => {
    // Check if there's a refresh parameter in the URL
    const refreshParam = searchParams.get('refresh');
    
    if (refreshParam) {
      console.log("Refresh parameter detected, reloading data");
      refreshRelationshipData();
      
      // Optionally, clean up the URL to remove the query parameter
      // This prevents refreshing if the user manually refreshes the page
      navigate(`/relationships/${relationshipId}`, { replace: true });
    }
  }, [searchParams, relationshipId, navigate]);

  useEffect(() => {
    const fetchRelationshipData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch relationship data
        const relationshipRes = await relationshipService.getProfileById(relationshipId);
        console.log("frontend relation",relationshipRes);
        setRelationship(relationshipRes.data);
        console.log("Topic distribution data:", relationshipRes.data.topicDistribution);
        
        // Fetch conversations
        const conversationsRes = await conversationService.getAll(relationshipId);
        setConversations(conversationsRes.data);
        
        // Fetch memories
        try {
          const memoriesUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/relationships/${relationshipId}/memories`;
          const token = localStorage.getItem('token');
          console.log("memories...",memoriesUrl);

          const memoriesRes = await fetch(memoriesUrl, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (memoriesRes.ok) {
            const data = await memoriesRes.json();
            console.log("memoryres",data);
            setMemories(data);
          } else {
            console.warn(`Memories endpoint returned status: ${memoriesRes.status}`);
            setMemories([]);
          }
        } catch (memoryErr) {
          console.warn('Could not fetch memories:', memoryErr);
          setMemories([]);
        }
      } catch (err) {
        console.error('Error details:', err.response ? err.response.data : err.message);
        setError(`Failed to load relationship data: ${err.message}`);
      } finally {
        setLoading(false);
        // Animate metrics after data loads
        setTimeout(() => setAnimateMetrics(true), 300);
      }
    };
    
    if (relationshipId) {
      fetchRelationshipData();
    }
  }, [relationshipId]);

  useEffect(() => {
    // Check if we need to refresh data (when returning from import page)
    const needsRefresh = sessionStorage.getItem('refreshRelationshipData');
    if (needsRefresh === 'true') {
      sessionStorage.removeItem('refreshRelationshipData');
      refreshRelationshipData();
    }
  }, []);

  useEffect(() => {
    // Check for refresh signal from localStorage (set by ImportChat)
    const updatedRelationshipId = localStorage.getItem('relationship_data_updated');
    if (updatedRelationshipId === relationshipId) {
      console.log('Import detected, refreshing relationship data');
      localStorage.removeItem('relationship_data_updated');
      refreshRelationshipData();
    }
  
    // Set up interval to periodically check for updates
    const checkIntervalId = setInterval(() => {
      const updatedId = localStorage.getItem('relationship_data_updated');
      if (updatedId === relationshipId) {
        console.log('Import detected during interval check, refreshing relationship data');
        localStorage.removeItem('relationship_data_updated');
        refreshRelationshipData();
      }
    }, 3000); // Check every 3 seconds
    
    return () => clearInterval(checkIntervalId);
  }, [relationshipId]);

  const refreshRelationshipData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Refreshing relationship data with forced cache busting');
      
      // Add timestamp to bust cache
      const timestamp = Date.now();
      
      const relationshipRes = await relationshipService.getById(relationshipId, { 
        params: { timestamp },
        cache: 'no-store', 
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      });
      console.log('Received fresh relationship data:', relationshipRes.data);
      setRelationship(relationshipRes.data);
      
      // Fetch updated conversations with cache busting
      const conversationsRes = await conversationService.getAll(relationshipId, {
        params: { timestamp },
        headers: { 'Cache-Control': 'no-cache' }
      });
      console.log(`Fetched ${conversationsRes.data.length} conversations`);
      setConversations(conversationsRes.data);
      
      // Fetch updated memories
      try {
        const memoriesUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/relationships/${relationshipId}/memories`;
        const token = localStorage.getItem('token');
  
        const memoriesRes = await fetch(memoriesUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (memoriesRes.ok) {
          const data = await memoriesRes.json();
          setMemories(data);
        } else {
          console.warn(`Memories endpoint returned status: ${memoriesRes.status}`);
          setMemories([]);
        }
      } catch (memoryErr) {
        console.warn('Could not fetch memories:', memoryErr);
        setMemories([]);
      }

    setAnimateMetrics(false);
    setTimeout(() => setAnimateMetrics(true), 300);
    } catch (err) {
      console.error('Error details:', err.response ? err.response.data : err.message);
      setError(`Failed to refresh relationship data: ${err.message}`);
    } finally {
      setLoading(false); 
    }
  };

  const handlePhotoUpload = (photoPath) => {
    if (relationship) {
      // Update local state with new photo path
      setRelationship({
        ...relationship,
        photo: photoPath
      });
    }
  };

  const handleImportChat = () => {
    sessionStorage.setItem('refreshRelationshipData', 'true');
    sessionStorage.setItem('returnToRelationship', relationshipId);
    navigate(`/relationships/${relationshipId}/import`);
  };
  
  const handleCloseBanner = () => {
    setShowImportBanner(false);
    // Store in localStorage to not show again for some time
    localStorage.setItem(`hideBanner_${relationshipId}`, Date.now());
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const startNewSession = () => {
    navigate(`/conversations/new/${relationshipId}`);
  };

  const viewConversation = (conversationId) => {
    navigate(`/conversations/${conversationId}`);
  };

  // Field component for consistent styling
  const Field = ({ label, value }) => (
    <FieldGroup darkMode={darkMode}>
      <div className="field-label">{label}</div>
      <div className="field-value">{value || "Not specified yet"}</div>
    </FieldGroup>
  );

 // Topic Distribution Chart
const TopicChart = ({ distribution }) => {
  if (!distribution || distribution.length === 0) {
    return <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No topic data available yet.</p>;
  }
  
  return (
    <TopicChartContainer>
      <h4 style={{ fontSize: '0.938rem', fontWeight: '600', marginBottom: '1rem' }}>Conversation Topics</h4>
      {distribution.map((topic) => (
        <TopicBar key={topic.name}>
          <div className="topic-header">
            <span className="topic-name">{topic.name}</span>
            <span className="topic-percentage">{topic.percentage?.toFixed(0)}%</span>
          </div>
          <div className="topic-bar-bg">
            <div 
              className="topic-bar-fill" 
              style={{ width: `${topic.percentage}%` }}
            />
          </div>
        </TopicBar>
      ))}
    </TopicChartContainer>
  );
};

  // Function to extract memories by emotion
  const getMemoriesByEmotion = (emotion) => {
  // Check if memories are available
  if (!memories || memories.length === 0) {
    return [];
  }
  
  let filteredMemories = [];
  
  // Based on the data in your console, we need to filter differently
  if (emotion === 'growth') {
    // Filter growth-related memories by content keywords
    filteredMemories = memories.filter(memory => 
      memory.content.toLowerCase().includes('health') || 
      memory.content.toLowerCase().includes('education') ||
      memory.content.toLowerCase().includes('hobbies')
    );
  } else if (emotion === 'positive') {
    // Filter positive memories by content
    filteredMemories = memories.filter(memory => 
      memory.content.toLowerCase().includes('hobbies') || 
      memory.content.toLowerCase().includes('emotions')
    );
  } else if (emotion === 'negative') {
    // Filter potentially challenging memories
    filteredMemories = memories.filter(memory => 
      memory.content.toLowerCase().includes('financial') || 
      memory.content.toLowerCase().includes('work')
    );
  }
  
  return filteredMemories.map(memory => memory.content).slice(0, 3);
};

  // Function to get insights by type
  const getInsightsByType = (type) => {
    if (!relationship?.insights) return [];
    return relationship.insights
      .filter(insight => insight.type === type)
      .slice(0, 3);
  };

  // Calculate sentiment display text
  const getSentimentText = (score) => {
    if (score >= 0.7) return "Very Positive";
    if (score >= 0.3) return "Positive";
    if (score >= -0.3) return "Neutral";
    if (score >= -0.7) return "Challenging";
    return "Very Challenging";
  };

  // Calculate reciprocity display text
  const getReciprocityText = (ratio) => {
    if (ratio === undefined || ratio === null) return "Unknown";
    const percentage = Math.round(ratio * 100);
    if (percentage >= 45 && percentage <= 55) return "Balanced (50/50)";
    if (percentage > 55) return `You give more (${percentage}/${100-percentage})`;
    return `They give more (${percentage}/${100-percentage})`;
  };

  // Get accent colors for metrics
  const getMetricColor = (type) => {
    switch(type) {
      case 'sentiment':
        return '#10b981';  // green
      case 'depth':
        return '#6366f1';  // indigo
      case 'balance':
        return '#8b5cf6';  // purple
      default:
        return '#6366f1';  // default indigo
    }
  };

  const getMemoryStyling = (emotion) => {
    switch(emotion) {
      case 'positive':
        return {
          bgColor: '#f0fdf4',
          borderColor: '#10b981',
          iconColor: '#10b981'
        };
      case 'negative':
        return {
          bgColor: '#fff7ed',
          borderColor: '#f59e0b',
          iconColor: '#f59e0b'
        };
      case 'insight':
        return {
          bgColor: '#f5f3ff',
          borderColor: '#8b5cf6',
          iconColor: '#8b5cf6'
        };
      case 'growth':
        return {
          bgColor: '#ecfdf5',
          borderColor: '#059669',
          iconColor: '#059669'
        };
      default:
        return {
          bgColor: '#f9fafb',
          borderColor: '#6366f1',
          iconColor: '#6366f1'
        };
    }
  };

  // Filter conversations based on active tab
  const filteredConversations = Array.isArray(conversations) 
  ? conversations.filter(conversation => {
      if (activeTab === 'all') return true;
      return conversation.status === activeTab;
    })
  : [];

  // Get first initial for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Function to determine emoji for sentiment
  const getSentimentEmoji = (score) => {
    if (score >= 0.7) return '😍';
    if (score >= 0.3) return '😊';
    if (score >= -0.3) return '😐';
    if (score >= -0.7) return '😕';
    return '😞';
  };

  if (loading) {
    return (
      <LoadingContainer>
        {/* Your loading UI */}
        <div className="loading-text">Loading relationship profile...</div>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        {/* Your error UI */}
        <div className="error-message">{error}</div>
        <button onClick={refreshRelationshipData}>
          Try Again
        </button>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      {/* Show enhanced banner if we have no imported data */}
      {showImportBanner && !hasImportedData && (
        <EnhancedImportBanner 
          relationshipName={relationship?.contactName || 'this relationship'} 
          onImportClick={handleImportChat}
          onClose={handleCloseBanner}
        />
      )}
      {relationship && (
        <>
          <ProfileHeader>
            <AvatarContainer>
              <ProfilePhotoUpload 
                relationship={relationship} 
                onPhotoUpload={handlePhotoUpload} 
              />
            </AvatarContainer>
            
            <ProfileInfo darkMode={darkMode}>
              <h1>{relationship.contactName || 'Unnamed Relationship'}</h1>
              <div className="relationship-type">
                {relationship.type || 'Personal Connection'}
                {relationship.status && (
                  <BadgeTag 
                    bgColor={relationship.status === 'active' ? 
                      (darkMode ? '#0d5b42' : '#dcfce7') : 
                      (darkMode ? '#2d3748' : '#f3f4f6')
                    } 
                    textColor={relationship.status === 'active' ? 
                      (darkMode ? '#34d399' : '#059669') : 
                      (darkMode ? '#e2e8f0' : '#6b7280')
                    }
                  >
                    {relationship.status}
                  </BadgeTag>
                )}
              </div>
              
              {relationship.tags && relationship.tags.length > 0 && (
                <TagsContainer>
                  {relationship.tags.map((tag, index) => (
                    <BadgeTag 
                      key={index} 
                      bgColor={darkMode ? '#2d3748' : '#f3f4f6'} 
                      textColor={darkMode ? '#e2e8f0' : '#4b5563'}
                    >
                      {tag}
                    </BadgeTag>
                  ))}
                </TagsContainer>
              )}
              
              <div className="stats">
                <Calendar size={14} />
                <span>Connected since {formatDate(relationship.createdAt)}</span>
                
                {conversations.length > 0 && (
                  <>
                    <span style={{ margin: '0 0.75rem' }}>•</span>
                    <MessageCircle size={14} />
                    <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </ProfileInfo>
          </ProfileHeader>

          {!hasImportedData && relationship && (
            <AnimatedInsightsPrompt
              relationshipId={relationshipId}
              contactName={relationship.contactName}
              relationshipType={relationship.type}
              onImportClick={handleImportChat}
            />
          )}

        
          {/* Metrics Section */}
          <MetricsContainer>
          <MetricCard 
              accentColor={getMetricColor('sentiment')}
              darkMode={darkMode}
              style={{
                transform: animateMetrics ? 'translateY(0)' : 'translateY(20px)',
                opacity: animateMetrics ? 1 : 0,
                transition: 'all 0.5s ease 0.1s',
                
              }}
            >
              <div className="metric-header">
                <Heart size={20} className="metric-icon" />
                <div className="metric-label">Emotional Tone</div>
              </div>
              <div className="metric-value">
              {relationship.metrics?.emotionalVolatility !== undefined ? 
                  `${getSentimentEmoji(relationship.metrics.emotionalVolatility)} ${getSentimentText(relationship.metrics.emotionalVolatility)}` : 
                  'Not enough data'}
              </div>
              <div className="metric-description">
              {relationship.metrics?.emotionalVolatility !== undefined ? 
                  `Based on ${conversations.length} conversations` : 
                  'Need more conversations to analyze'}
              </div>
            </MetricCard>
            
            <MetricCard 
              accentColor={getMetricColor('depth')}
              darkMode={darkMode}
              style={{
                transform: animateMetrics ? 'translateY(0)' : 'translateY(20px)',
                opacity: animateMetrics ? 1 : 0,
                transition: 'all 0.5s ease 0.2s',
                
              }}
            >
              <div className="metric-header">
                <BarChart2 size={20} className="metric-icon" />
                <div className="metric-label">Connection Depth</div>
              </div>
              <div className="metric-value">
              {relationship.metrics?.depthScore !== undefined ? 
                  `${relationship.metrics.depthScore.toFixed(1)}/10` : 
                  'Not enough data'}
              </div>
              <div className="metric-description">
              {relationship.metrics?.depthScore !== undefined ?
                  relationship.metrics.depthScore >= 7 ? 'Deep meaningful connection' : 
                  relationship.metrics.depthScore >= 4 ? 'Developing connection' : 
                  'Surface-level connection' : 
                  'Need more interactions to assess'}
              </div>
            </MetricCard>
            
            <MetricCard 
              accentColor={getMetricColor('balance')}
              darkMode={darkMode}
              style={{
                transform: animateMetrics ? 'translateY(0)' : 'translateY(20px)',
                opacity: animateMetrics ? 1 : 0,
                transition: 'all 0.5s ease 0.3s',
                
              }}
            >
              <div className="metric-header">
                <PieChart size={20} className="metric-icon" />
                <div className="metric-label">Reciprocity Balance</div>
              </div>
              <div className="metric-value">
                {relationship.metrics?.reciprocityRatio !== undefined ? 
                  getReciprocityText(relationship.metrics.reciprocityRatio) : 
                  'Not enough data'}
              </div>
              <div className="metric-description">
                {relationship.metrics?.reciprocityRatio !== undefined ? 
                  'Based on conversation patterns and support exchange' : 
                  'Need more interactions to assess balance'}
              </div>
            </MetricCard>
          </MetricsContainer>


          {/* Relationship Type-Specific Analysis */}
          <RelationshipTypeAnalysis 
            relationship={relationship}
            refreshData={refreshRelationshipData}
            // Pass onImportClick but don't show the import banner inside the component
            onImportClick={handleImportChat}
            hideImportBanner={true}
            darkMode={darkMode}
          />
          
          {/* Relationship History Section */}
          <SectionCard darkMode={darkMode}>
          <SectionHeader 
              onClick={() => toggleSection('history')}
              isExpanded={expandedSections.history}
              darkMode={darkMode}
            >
              <div className="section-title">
                <Calendar size={20} />
                <span>Relationship History</span>
              </div>
              <ChevronUp size={20} className="toggle-icon" />
            </SectionHeader>
            
            <SectionContent isExpanded={expandedSections.history}>
            <SectionContentInner darkMode={darkMode}>
                <Field label="First Met" value={formatDate(relationship.createdAt)} />
                <Field label="Connection Type" value={relationship.relationshipType} />
                <Field label="Background" value={relationship.howWeMet} />
                
                {relationship.events && relationship.events.length > 0 && (
                  <FieldGroup>
                    <div className="field-label">Key Events</div>
                    <MemoryList>
                      {relationship.events.map((event, index) => (
                        <MemoryItem key={index} {...getMemoryStyling('insight')}>
                          <Calendar size={18} className="memory-icon" />
                          <p>{typeof event === 'object' ? (event.description + ' - ' + formatDate(event.date)) : event}</p>
                        </MemoryItem>
                      ))}
                    </MemoryList>
                  </FieldGroup>
                )}
              </SectionContentInner>
            </SectionContent>
          </SectionCard>
          
          {/* Emotional Intelligence Section */}
          <SectionCard darkMode={darkMode}>
            <SectionHeader 
              onClick={() => toggleSection('emotional')}
              isExpanded={expandedSections.emotional}
              darkMode={darkMode}
            >
              <div className="section-title">
                <Heart size={20} />
                <span>Emotional Intelligence</span>
              </div>
              <ChevronUp size={20} className="toggle-icon" />
            </SectionHeader>
            
            <SectionContent isExpanded={expandedSections.emotional}>
              <SectionContentInner darkMode={darkMode}>
                <Field label="Love Language" value={relationship.loveLanguage} />
                <Field label="Communication Style" value={
                  typeof relationship.communicationStyle === 'object' ? 
                  JSON.stringify(relationship.communicationStyle) : 
                  relationship.communicationStyle
                } />
                
                {/* Positive Memories */}
                <FieldGroup>
                  <div className="field-label">Positive Moments</div>
                  {getMemoriesByEmotion('positive').length > 0 ? (
                    <MemoryList>
                      {getMemoriesByEmotion('positive').map((memory, index) => (
                        <MemoryItem key={index} {...getMemoryStyling('positive')}>
                          <Heart size={18} className="memory-icon" />
                          <p>{memory}</p>
                        </MemoryItem>
                      ))}
                    </MemoryList>
                  ) : (
                    <EmptyState>
                      <Heart size={24} />
                      <h4>No positive memories yet</h4>
                      <p>Positive memories will appear here as you record more conversations</p>
                    </EmptyState>
                  )}
                </FieldGroup>
                
                {/* Challenges */}
                <FieldGroup>
                  <div className="field-label">Challenges</div>
                  {getMemoriesByEmotion('negative').length > 0 ? (
                    <MemoryList>
                      {getMemoriesByEmotion('negative').map((memory, index) => (
                        <MemoryItem key={index} {...getMemoryStyling('negative')}>
                          <AlertTriangle size={18} className="memory-icon" />
                          <p>{memory}</p>
                        </MemoryItem>
                      ))}
                    </MemoryList>
                  ) : (
                    <EmptyState>
                      <AlertTriangle size={24} />
                      <h4>No challenges recorded</h4>
                      <p>Challenges and pain points will appear here as they're identified</p>
                    </EmptyState>
                  )}
                </FieldGroup>
                
                {/* Emotional Insights */}
                {getInsightsByType('emotional').length > 0 && (
                  <InsightCard>
                    <h4>
                      <Zap size={18} />
                      Emotional Intelligence Insight
                    </h4>
                    <p>{getInsightsByType('emotional')[0]?.content || "No insight content available"}</p>
                  </InsightCard>
                )}
              </SectionContentInner>
            </SectionContent>
          </SectionCard>
          
          {/* Relationship Dynamics Section */}
          <SectionCard darkMode={darkMode}>
            <SectionHeader 
              onClick={() => toggleSection('dynamics')}
              isExpanded={expandedSections.dynamics}
              darkMode={darkMode}
            >
              <div className="section-title">
                <Award size={20} />
                <span>Relationship Dynamics</span>
              </div>
              <ChevronUp size={20} className="toggle-icon" />
            </SectionHeader>
            
            <SectionContent isExpanded={expandedSections.dynamics}>
              <SectionContentInner darkMode={darkMode}>
                <Field label="Communication Frequency" value={relationship.interactionFrequency} />
                <Field label="Trust Level" value={
                  relationship.metrics?.trust !== undefined ? 
                  `${(relationship.metrics.trust * 10).toFixed(1)}/10` : 
                  'Not enough data'
                } />
                
                {/* Topic Distribution */}
                {relationship && relationship.topicDistribution && Array.isArray(relationship.topicDistribution) && (
                  <FieldGroup>
                    <div className="field-label">Conversation Topics</div>
                    <TopicChart distribution={relationship.topicDistribution} />
                  </FieldGroup>
                )}
                
                {/* Growth Areas */}
                <FieldGroup>
                  <div className="field-label">Growth Areas</div>
                  {getMemoriesByEmotion('growth').length > 0 ? (
                    <MemoryList>
                      {getMemoriesByEmotion('growth').map((memory, index) => (
                        <MemoryItem key={index} {...getMemoryStyling('growth')}>
                          <Zap size={18} className="memory-icon" />
                          <p>{memory}</p>
                        </MemoryItem>
                      ))}
                    </MemoryList>
                  ) : (
                    <EmptyState>
                      <Zap size={24} />
                      <h4>No growth areas identified yet</h4>
                      <p>Growth opportunities will appear here as you have more conversations</p>
                    </EmptyState>
                  )}
                </FieldGroup>
                
                {/* Dynamic Insights */}
                {getInsightsByType('dynamic').length > 0 && (
                  <InsightCard>
                    <h4>
                      <Award size={18} />
                      Relationship Dynamic Insight
                    </h4>
                    <p>{getInsightsByType('dynamic')[0]?.content || "No insight content available"}</p>
                  </InsightCard>
                )}
              </SectionContentInner>
            </SectionContent>
          </SectionCard>
          
          {/* Other's Perspective */}
          <SectionCard darkMode={darkMode}>
            <SectionHeader 
              onClick={() => toggleSection('perspective')}
              isExpanded={expandedSections.perspective}
              darkMode={darkMode}
            >
              <div className="section-title">
                <User size={20} />
                <span>{relationship.contactName}'s Perspective</span>
              </div>
              <ChevronUp size={20} className="toggle-icon" />
            </SectionHeader>
            
            <SectionContent isExpanded={expandedSections.perspective}>
              <SectionContentInner darkMode={darkMode}>
                <Field label="Values" value={relationship.theirValues} />
                <Field label="Interests" value={relationship.theirInterests} />
                <Field label="Communication Preferences" value={
                  typeof relationship.theirCommunicationPreferences === 'object' ? 
                  JSON.stringify(relationship.theirCommunicationPreferences) : 
                  relationship.theirCommunicationPreferences
                } />
                <Field label="Important Dates" value={
                  relationship.importantDates && Array.isArray(relationship.importantDates) && relationship.importantDates.length > 0 ?
                  relationship.importantDates.map(date => 
                    typeof date === 'object' ? 
                    `${date.occasion}: ${formatDate(date.date)}` : 
                    String(date)
                  ).join(', ') :
                  'No important dates recorded'
                } />
                
                {/* Perspective Insights */}
                {getInsightsByType('perspective').length > 0 && (
                  <InsightCard>
                    <h4>
                      <User size={18} />
                      Perspective Insight
                    </h4>
                    <p>{getInsightsByType('perspective')[0]?.content || "No insight content available"}</p>
                  </InsightCard>
                )}
              </SectionContentInner>
            </SectionContent>
          </SectionCard>
          
          {/* Conversations Section */}
          <SectionCard darkMode={darkMode}>
            <SectionHeader 
              onClick={() => toggleSection('conversations')}
              isExpanded={expandedSections.conversations}
              darkMode={darkMode}
            >
              <div className="section-title">
                <MessageCircle size={20} />
                <span>Conversations</span>
                {conversations.length > 0 && (
                  <span style={{ 
                    fontSize: '0.75rem',
                    marginLeft: '0.5rem',
                    backgroundColor: '#e0e7ff',
                    color: '#4f46e5',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px'
                  }}>
                    {conversations.length}
                  </span>
                )}
              </div>
              <ChevronUp size={20} className="toggle-icon" />
            </SectionHeader>
            
            <SectionContent isExpanded={expandedSections.conversations}>
              <SectionContentInner darkMode={darkMode}>
                {conversations.length > 0 ? (
                  <>
                    <TabGroup>
                      <Tab 
                        active={activeTab === 'all'} 
                        onClick={() => setActiveTab('all')}
                      >
                        All Conversations
                      </Tab>
                      <Tab 
                        active={activeTab === 'completed'} 
                        onClick={() => setActiveTab('completed')}
                      >
                        Completed
                      </Tab>
                      <Tab 
                        active={activeTab === 'in-progress'} 
                        onClick={() => setActiveTab('in-progress')}
                      >
                        In Progress
                      </Tab>
                    </TabGroup>
                    
                    <ConversationList>
                      {filteredConversations.length > 0 ? (
                        filteredConversations.map((conversation, index) => (
                          <ConversationItem 
                            key={index}
                            onClick={() => viewConversation(conversation.id)}
                          >
                            <div className="conversation-header">
                              <div>
                                <div className="conversation-title">{conversation.title || `Conversation #${index + 1}`}</div>
                                <div className="conversation-date">
                                  <Clock size={14} />
                                  {formatDate(conversation.createdAt)}
                                </div>
                              </div>
                              <div className="conversation-status">
                                {conversation.status || 'completed'}
                              </div>
                            </div>
                            
                            {conversation.tone && (
                              <div className="conversation-tone">
                                Tone: <span>{typeof conversation.tone === 'object' ? JSON.stringify(conversation.tone) : conversation.tone}</span>
                              </div>
                            )}
                            
                            <div className="view-details">
                              View details <ArrowRight size={16} />
                            </div>
                          </ConversationItem>
                        ))
                      ) : (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <EmptyState>
                            <MessageCircle size={24} />
                            <h4>No {activeTab !== 'all' ? activeTab : ''} conversations found</h4>
                            <p>Try changing your filter or start a new conversation</p>
                          </EmptyState>
                        </div>
                      )}
                    </ConversationList>
                    
                    {filteredConversations.length > 4 && (
                      <ViewMoreLink>
                        View all conversations <ArrowRight size={16} />
                      </ViewMoreLink>
                    )}
                  </>
                ) : (
                  <EmptyState>
                    <MessageCircle size={24} />
                    <h4>No conversations yet</h4>
                    <p>Start your first conversation to build this relationship</p>
                  </EmptyState>
                )}
              </SectionContentInner>
            </SectionContent>
          </SectionCard>

          {/* Add the Relationship QA component */}
            {/* <RelationshipQA 
              relationshipId={relationshipId}
              relationshipName={relationship?.contactName}
            /> */}

            {/* Action Buttons (Import and Ask Questions) */}
          <ButtonGroup>
          <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => {
                sessionStorage.setItem('refreshRelationshipData', 'true');
                sessionStorage.setItem('returnToRelationship', relationshipId);
                navigate(`/relationships/${relationshipId}/import`);
              }}
              sx={{ 
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
              fullWidth
            >
            Import Chat History
          </Button>

          <Button
              variant="outlined"
              startIcon={<QuestionAnswerIcon />}
              onClick={() => navigate(`/relationships/${relationshipId}/questions`)}
              sx={{ 
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
              fullWidth
            >
            Ask Questions
          </Button>
          </ButtonGroup>
                    
          {/* Start Conversation Button */}
          <ActionButtonContainer>
            {/* Keep just the new conversation button */}
            <ActionButton onClick={startNewSession}>
              <MessageCircle size={20} />
              Start a New Conversation
            </ActionButton>
            
            {/* Only show this import button if we haven't already shown the banners */}
            
            
            <UpdateInfo>Profile last updated {formatDate(relationship.updatedAt)}</UpdateInfo>
          </ActionButtonContainer>
        </>
      )}
    </PageContainer>
  );
};

export default RelationshipProfile;