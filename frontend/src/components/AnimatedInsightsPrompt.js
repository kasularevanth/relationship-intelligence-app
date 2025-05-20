import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Heart, 
  BarChart2, 
  PieChart, 
  MessageCircle, 
  Upload, 
  X, 
  Zap, 
  ChevronRight,
  Clock,
  ArrowRight
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

const slideRight = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// Master Container
const Container = styled.div`
  position: relative;
  margin: 2rem 0;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.5s ease, transform 0.5s ease;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${props => props.darkMode 
    ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
    : '0 10px 25px rgba(0, 0, 0, 0.05)'};
`;

// Card specific styles
const Card = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: ${props => props.darkMode ? '#141b2d' : '#ffffff'};
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.1)'};
`;

// Header section with patterned background
const Header = styled.div`
  position: relative;
  background: ${props => props.darkMode ? '#6366f1' : '#e0e7ff'};
  padding: 20px;
  overflow: hidden;
`;

const HeaderTitle = styled.h3`
  color: ${props => props.darkMode ? '#ffffff' : '#4338ca'};
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 12px;
    color: ${props => props.darkMode ? '#ffffff' : '#4338ca'};
  }
`;

const HeaderPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${props => props.darkMode 
    ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238b5cf6' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
    : `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
  };
  opacity: 0.5;
  z-index: 1;
`;

// Close button
const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(99, 102, 241, 0.1)'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  
  svg {
    color: ${props => props.darkMode ? '#ffffff' : '#6366f1'};
    transition: transform 0.2s ease;
  }
  
  &:hover {
    background: ${props => props.darkMode 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(99, 102, 241, 0.2)'};
  }
  
  &:hover svg {
    transform: rotate(90deg);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.darkMode 
      ? 'rgba(255, 255, 255, 0.3)' 
      : 'rgba(99, 102, 241, 0.3)'};
  }
`;

// Main content area
const Content = styled.div`
  padding: 24px;
  
  @media (min-width: 768px) {
    display: flex;
    flex-direction: row;
    gap: 32px;
  }
`;

// Left column for slides
const LeftColumn = styled.div`
  @media (min-width: 768px) {
    flex: 1.2;
  }
  
  @media (max-width: 767px) {
    margin-bottom: 24px;
  }
`;

// Right column for CTA
const RightColumn = styled.div`
  @media (min-width: 768px) {
    flex: 0.8;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

// Section titles
const SectionTitle = styled.h4`
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: ${props => props.darkMode ? '#e0e7ff' : '#4338ca'};
  
  svg {
    margin-right: 8px;
    color: ${props => props.darkMode ? '#818cf8' : '#6366f1'};
  }
`;

// Slide container
const SlideContainer = styled.div`
  position: relative;
  background: ${props => props.darkMode 
    ? 'rgba(30, 41, 59, 0.5)' 
    : 'rgba(243, 244, 246, 0.5)'};
  backdrop-filter: blur(4px);
  border-radius: 12px;
  padding: 20px;
  height: 200px;
  overflow: hidden;
  box-shadow: ${props => props.darkMode 
    ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)' 
    : 'inset 0 1px 1px 0 rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(99, 102, 241, 0.2)' 
    : 'rgba(99, 102, 241, 0.1)'};
`;

// Floating decorative bubbles
const Bubble = styled.div`
  position: absolute;
  width: ${props => props.size || '80px'};
  height: ${props => props.size || '80px'};
  background: ${props => props.darkMode 
    ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(165, 180, 252, 0.05))' 
    : 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(224, 231, 255, 0.2))'};
  border-radius: 50%;
  top: ${props => props.top || '0'};
  left: ${props => props.left || '0'};
  animation: ${float} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  z-index: 1;
`;

// Individual slide
const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  opacity: ${props => props.active ? 1 : 0};
  transform: ${props => props.active ? 'translateX(0)' : 'translateX(20px)'};
  transition: opacity 0.5s ease, transform 0.5s ease;
  pointer-events: ${props => props.active ? 'auto' : 'none'};
  z-index: 2;
`;

// Slide icon styles
const SlideIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: ${props => props.darkMode 
    ? 'rgba(99, 102, 241, 0.2)' 
    : 'rgba(99, 102, 241, 0.1)'};
  color: ${props => props.darkMode ? '#818cf8' : '#6366f1'};
  
  svg {
    stroke-width: 2;
  }
`;

// Slide text content
const SlideContent = styled.div`
  z-index: 2;
`;

const SlideTitle = styled.h5`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${props => props.darkMode ? '#ffffff' : '#1e293b'};
`;

const SlideDescription = styled.p`
  font-size: 0.875rem;
  margin: 0;
  color: ${props => props.darkMode ? '#cbd5e1' : '#475569'};
  line-height: 1.5;
`;

// Slide navigation dots
const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 3;
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background: ${props => props.active 
    ? (props.darkMode ? '#818cf8' : '#6366f1') 
    : (props.darkMode ? 'rgba(129, 140, 248, 0.3)' : 'rgba(99, 102, 241, 0.3)')};
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: ${props => props.active ? 'scale(1.3)' : 'scale(1)'};
  
  &:hover {
    background: ${props => props.active 
      ? (props.darkMode ? '#818cf8' : '#6366f1') 
      : (props.darkMode ? 'rgba(129, 140, 248, 0.5)' : 'rgba(99, 102, 241, 0.5)')};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.darkMode 
      ? 'rgba(129, 140, 248, 0.5)' 
      : 'rgba(99, 102, 241, 0.5)'};
  }
`;

// CTA section styles
const CtaSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const CtaIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: ${props => props.darkMode 
    ? 'rgba(99, 102, 241, 0.2)' 
    : 'rgba(224, 231, 255, 0.7)'};
  color: ${props => props.darkMode ? '#818cf8' : '#6366f1'};
  animation: ${pulse} 2s infinite;
`;

const CtaTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${props => props.darkMode ? '#ffffff' : '#1e293b'};
`;

const CtaDescription = styled.p`
  font-size: 0.875rem;
  margin: 0 0 24px 0;
  color: ${props => props.darkMode ? '#cbd5e1' : '#475569'};
  max-width: 300px;
`;

// Import button with animation
const ImportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 220px;
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 0.9375rem;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.25);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(99, 102, 241, 0.35);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  /* Shimmer effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.25) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateX(-100%);
    animation: ${shimmer} 2.5s infinite;
    background-size: 200% 100%;
  }
  
  /* Arrow animation */
  .arrow-icon {
    transition: transform 0.2s ease;
  }
  
  &:hover .arrow-icon {
    animation: ${slideRight} 0.6s infinite alternate;
  }
`;

// Security badges
const SecurityBadges = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: ${props => props.darkMode ? '#cbd5e1' : '#6b7280'};
  
  &:before {
    content: '${props => props.icon}';
    margin-right: 4px;
  }
`;

// Footer text
const FooterText = styled.p`
  font-size: 0.75rem;
  text-align: center;
  margin: 16px 0 0 0;
  color: ${props => props.darkMode ? 'rgba(203, 213, 225, 0.6)' : 'rgba(107, 114, 128, 0.7)'};
`;

const AnimatedInsightsPrompt = ({ relationshipId, contactName, relationshipType, onImportClick }) => {
  // Get theme context safely
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode || false;
  
  // State hooks
  const [isVisible, setIsVisible] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  // Refs
  const containerRef = useRef(null);
  const slideIntervalRef = useRef(null);
  
  // Define slides based on relationship type
  const getSlides = () => {
    const defaults = [
      {
        title: "Communication Analysis",
        description: "Uncover your unique conversation patterns and communication style",
        icon: <MessageCircle size={24} />
      },
      {
        title: "Topic Distribution",
        description: "See what you talk about most and why it matters to your relationship",
        icon: <PieChart size={24} />
      },
      {
        title: "Relationship Health",
        description: "Track the evolution of your connection over time with AI insights",
        icon: <BarChart2 size={24} />
      }
    ];
    
    // You can customize slides based on relationship type if needed
    return defaults;
  };
  
  const slides = getSlides();
  
  // Handle auto-rotation of slides
  useEffect(() => {
    // Clear any existing interval
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }
    
    // Only run auto-rotation if not hovering and component is visible
    if (!isHovering && isVisible) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 4000);
    }
    
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [isHovering, isVisible, slides.length]);
  
  // Handle visibility with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Handle close button
  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    
    // Store in localStorage
    setTimeout(() => {
      localStorage.setItem(`hideInsightPrompt_${relationshipId}`, Date.now());
    }, 500);
  };
  
  if (!isVisible) return null;
  
  return (
    <Container 
      ref={containerRef} 
      isVisible={isVisible} 
      darkMode={darkMode}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Card darkMode={darkMode}>
        {/* Close button */}
        <CloseButton 
          onClick={handleClose} 
          darkMode={darkMode}
          aria-label="Close"
        >
          <X size={18} />
        </CloseButton>
        
        {/* Header */}
        <Header darkMode={darkMode}>
          <HeaderPattern darkMode={darkMode} />
          <HeaderTitle darkMode={darkMode}>
            <Clock size={24} />
            Unlock {contactName}'s Relationship Insights
          </HeaderTitle>
        </Header>
        
        {/* Content */}
        <Content>
          {/* Left column with slides */}
          <LeftColumn>
            <SectionTitle darkMode={darkMode}>
              <Zap size={20} />
              Discover Personalized Insights
            </SectionTitle>
            
            <SlideContainer darkMode={darkMode}>
              {/* Decorative bubbles */}
              <Bubble 
                darkMode={darkMode} 
                size="60px" 
                top="10%" 
                left="5%" 
                duration="7s"
              />
              <Bubble 
                darkMode={darkMode}
                size="100px" 
                top="60%" 
                left="70%" 
                duration="9s" 
                delay="1s"
              />
              <Bubble 
                darkMode={darkMode}
                size="40px" 
                top="40%" 
                left="20%" 
                duration="8s" 
                delay="0.5s"
              />
              
              {/* Slides */}
              {slides.map((slide, index) => (
                <Slide 
                  key={index} 
                  active={currentSlide === index}
                >
                  <SlideIcon darkMode={darkMode}>
                    {slide.icon}
                  </SlideIcon>
                  <SlideContent>
                    <SlideTitle darkMode={darkMode}>{slide.title}</SlideTitle>
                    <SlideDescription darkMode={darkMode}>
                      {slide.description}
                    </SlideDescription>
                  </SlideContent>
                </Slide>
              ))}
              
              {/* Navigation dots */}
              <DotsContainer>
                {slides.map((_, index) => (
                  <Dot 
                    key={index} 
                    active={currentSlide === index} 
                    onClick={() => setCurrentSlide(index)}
                    darkMode={darkMode}
                  />
                ))}
              </DotsContainer>
            </SlideContainer>
            
            <FooterText darkMode={darkMode}>
              Chat analysis reveals patterns that enhance understanding and strengthen your connection.
            </FooterText>
          </LeftColumn>
          
          {/* Right column with CTA */}
          <RightColumn>
            <CtaSection>
              <CtaIconWrapper darkMode={darkMode}>
                <Upload size={28} />
              </CtaIconWrapper>
              
              <CtaTitle darkMode={darkMode}>Get Started in One Step</CtaTitle>
              <CtaDescription darkMode={darkMode}>
                Import your chat history to unlock all insights about {contactName}
              </CtaDescription>
              
              <ImportButton onClick={onImportClick}>
                <Upload size={18} />
                <span>Import Chat History</span>
                <ChevronRight size={16} className="arrow-icon" />
              </ImportButton>
              
              <SecurityBadges>
                <Badge darkMode={darkMode} icon="🔒">Private</Badge>
                <Badge darkMode={darkMode} icon="⚡">Fast</Badge>
                <Badge darkMode={darkMode} icon="🧠">Intelligent</Badge>
              </SecurityBadges>
            </CtaSection>
          </RightColumn>
        </Content>
      </Card>
    </Container>
  );
};

export default AnimatedInsightsPrompt;