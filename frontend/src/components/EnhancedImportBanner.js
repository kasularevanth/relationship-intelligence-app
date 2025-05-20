import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Upload, 
  MessageCircle, 
  Heart, 
  PieChart, 
  BarChart2, 
  Activity, 
  ArrowRight, 
  X, 
  Zap 
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Keyframe animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const highlightText = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const progressAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const slideRight = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(3px); }
`;

// Styled components
const Container = styled.div`
  position: relative;
  margin: 2rem 0;
  width: 100%;
  animation: ${props => props.isVisible ? css`${fadeIn} 0.8s ease-out` : css`${fadeOut} 0.5s ease-out forwards`};
  border-radius: 1rem;
  overflow: hidden;
  z-index: 10;
`;

const GradientBorder = styled.div`
  background: linear-gradient(to right, #4f46e5, #9333ea, #db2777);
  padding: 2px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: ${props => props.darkMode 
    ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' 
    : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'};
`;

const BannerContent = styled.div`
  position: relative;
  background: ${props => props.darkMode ? '#1a1d2d' : '#ffffff'};
  border-radius: calc(1rem - 2px);
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 20;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${props => props.darkMode 
    ? 'rgba(31, 41, 55, 0.7)' 
    : 'rgba(249, 250, 251, 0.8)'};
  backdrop-filter: blur(4px);
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.7)'};
  color: ${props => props.darkMode ? '#9ca3af' : '#4b5563'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.darkMode 
      ? 'rgba(55, 65, 81, 0.9)' 
      : 'rgba(243, 244, 246, 0.9)'};
    color: ${props => props.darkMode ? '#f9fafb' : '#111827'};
    transform: rotate(90deg);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
  }
`;

const BackgroundBubbles = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: ${props => props.darkMode ? 0.1 : 0.3};
`;

const Bubble = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${props => {
    const gradients = [
      'linear-gradient(135deg, #4f46e5, #6366f1)',
      'linear-gradient(135deg, #9333ea, #a855f7)',
      'linear-gradient(135deg, #db2777, #ec4899)'
    ];
    return gradients[props.colorIndex % 3];
  }};
  opacity: ${props => props.opacity || 0.5};
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  animation: ${float} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const ContentWrapper = styled.div`
  position: relative;
  padding: 2rem;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const HighlightTextWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  height: 2.5rem;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 3.5rem;
  }
`;

const HighlightText = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  opacity: ${props => props.active ? 1 : 0};
  transform: ${props => props.active ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  background: linear-gradient(90deg, #4f46e5, #9333ea, #db2777);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: ${highlightText} 6s linear infinite;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
    line-height: 1.4;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const BannerTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: ${props => props.darkMode ? '#ffffff' : '#111827'};
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const FeaturesGrid = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  transform: ${props => props.active ? 'scale(1.1)' : 'scale(1)'};
  opacity: ${props => props.active ? 1 : 0.7};
`;

const FeatureIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  background: ${props => props.darkMode ? 'rgba(31, 41, 55, 0.4)' : 'rgba(243, 244, 246, 0.7)'};
  color: ${props => props.color};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${props => props.active ? css`${pulse} 2s infinite ease-in-out` : 'none'};
  border: 1px solid ${props => props.darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  
  ${FeatureItem}:hover & {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureTitle = styled.span`
  font-size: 0.813rem;
  font-weight: 500;
  color: ${props => props.darkMode ? '#e5e7eb' : '#4b5563'};
  text-align: center;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  
  @media (min-width: 768px) {
    width: 250px;
    margin-top: 0;
  }
`;

const ImportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 220px;
  padding: 0.875rem 1.5rem;
  font-size: 0.938rem;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  background: linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .arrow-icon {
    transition: transform 0.3s ease;
  }
  
  &:hover .arrow-icon {
    animation: ${slideRight} 0.6s infinite alternate;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    transform: skewX(-15deg);
    transition: transform 0.6s ease;
  }
  
  &:hover::after {
    transform: skewX(-15deg) translateX(200%);
  }
`;

const SecurityText = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: ${props => props.darkMode ? '#9ca3af' : '#6b7280'};
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '⏱️';
  }
  
  &::after {
    content: '🔒';
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 3px;
  background: ${props => props.darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'};
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  margin-top: 1.5rem;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 30%;
    background: linear-gradient(to right, #4f46e5, #9333ea, #db2777);
    animation: ${progressAnimation} 3s ease-in-out infinite;
  }
`;

// Main component
const EnhancedImportBanner = ({ relationshipName, onImportClick, onClose }) => {
  // Get theme
  const themeContext = useTheme();
  const darkMode = themeContext ? themeContext.darkMode : false;
  
  // Component state
  const [isVisible, setIsVisible] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const [highlightedText, setHighlightedText] = useState(0);
  const bannerRef = useRef(null);
  
  // Bubbles for background animation
  const bubbles = [
    { size: 120, top: -10, left: -5, opacity: 0.3, duration: 15, delay: 0, colorIndex: 0 },
    { size: 180, top: 60, left: 80, opacity: 0.2, duration: 22, delay: 2, colorIndex: 1 },
    { size: 100, top: 70, left: 40, opacity: 0.4, duration: 18, delay: 1, colorIndex: 2 },
    { size: 60, top: 20, left: 70, opacity: 0.3, duration: 12, delay: 0.5, colorIndex: 0 },
    { size: 40, top: 50, left: 10, opacity: 0.2, duration: 20, delay: 3, colorIndex: 1 },
  ];
  
  // Features to showcase with animations
  const features = [
    { 
      icon: <Heart size={20} />, 
      title: "Emotional Patterns",
      color: "#ec4899"
    },
    { 
      icon: <BarChart2 size={20} />, 
      title: "Communication Style",
      color: "#3b82f6"
    },
    { 
      icon: <PieChart size={20} />, 
      title: "Topic Analysis",
      color: "#8b5cf6"
    },
    { 
      icon: <Activity size={20} />, 
      title: "Relationship Health",
      color: "#10b981"
    }
  ];
  
  // Compelling text snippets that highlight across the banner
  const highlightTexts = [
    "Transform your relationship understanding with AI-powered insights",
    "One chat import reveals patterns you might never have noticed",
    "See your relationship from a whole new perspective",
    "Get personalized recommendations to strengthen your connection"
  ];
  
  // Cycle through features
  useEffect(() => {
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(featureInterval);
  }, [features.length]);
  
  // Cycle through highlight texts
  useEffect(() => {
    const textInterval = setInterval(() => {
      setHighlightedText(prev => (prev + 1) % highlightTexts.length);
    }, 5000);
    
    return () => clearInterval(textInterval);
  }, [highlightTexts.length]);
  
  // Animate in with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }
    
    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current);
      }
    };
  }, []);
  
  // Handle close button click
  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    
    // Call parent's onClose after animation completes
    setTimeout(() => {
      if (onClose) onClose();
    }, 500);
  };
  
  if (!isVisible) return null;
  
  return (
    <Container ref={bannerRef} isVisible={isVisible}>
      <GradientBorder darkMode={darkMode}>
        <BannerContent darkMode={darkMode}>
          {/* Close button */}
          <CloseButton 
            onClick={handleClose} 
            darkMode={darkMode}
            aria-label="Close banner"
          >
            <X size={16} />
          </CloseButton>
          
          {/* Animated background */}
          <BackgroundBubbles darkMode={darkMode}>
            {bubbles.map((bubble, index) => (
              <Bubble
                key={index}
                size={bubble.size}
                top={bubble.top}
                left={bubble.left}
                opacity={bubble.opacity}
                duration={bubble.duration}
                delay={bubble.delay}
                colorIndex={bubble.colorIndex}
              />
            ))}
          </BackgroundBubbles>
          
          <ContentWrapper>
            {/* Animated highlight text ticker */}
            <HighlightTextWrapper>
              {highlightTexts.map((text, index) => (
                <HighlightText 
                  key={index}
                  active={index === highlightedText}
                >
                  {text}
                </HighlightText>
              ))}
            </HighlightTextWrapper>
            
            <MainContent>
              {/* Left section */}
              <LeftSection>
                <BannerTitle darkMode={darkMode}>
                  Unlock the full potential of your relationship with {relationshipName}
                </BannerTitle>
                
                <FeaturesGrid>
                  {features.map((feature, index) => (
                    <FeatureItem 
                      key={index}
                      active={index === activeFeature}
                    >
                      <FeatureIconWrapper 
                        color={feature.color}
                        darkMode={darkMode}
                        active={index === activeFeature}
                      >
                        {feature.icon}
                      </FeatureIconWrapper>
                      <FeatureTitle darkMode={darkMode}>
                        {feature.title}
                      </FeatureTitle>
                    </FeatureItem>
                  ))}
                </FeaturesGrid>
              </LeftSection>
              
              {/* Right section */}
              <RightSection>
                <ImportButton onClick={onImportClick}>
                  <Upload size={18} />
                  <span>Import Chat History</span>
                  <ArrowRight size={16} className="arrow-icon" />
                </ImportButton>
                
                <SecurityText darkMode={darkMode}>
                  Takes just a minute • Privacy protected
                </SecurityText>
              </RightSection>
            </MainContent>
            
            {/* Animated progress bar */}
            <ProgressBar darkMode={darkMode} />
          </ContentWrapper>
        </BannerContent>
      </GradientBorder>
    </Container>
  );
};

export default EnhancedImportBanner;