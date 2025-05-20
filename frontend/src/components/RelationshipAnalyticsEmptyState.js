import React, { useState, useEffect } from 'react';
import { Upload, PieChart, BarChart2, Heart, Users, Zap, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const RelationshipAnalyticsEmptyState = ({ relationshipType, contactName, onImportClick }) => {
  const { darkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);
  
  // Define colors based on relationship type
  const getTypeColors = () => {
    switch(relationshipType?.toLowerCase()) {
      case 'romantic':
      case 'partner':
        return {
          primary: 'from-rose-500 to-red-500',
          icon: 'text-rose-500',
          accent: 'bg-rose-100 dark:bg-rose-900/20'
        };
      case 'friendship':
      case 'friend':
        return {
          primary: 'from-blue-500 to-indigo-500',
          icon: 'text-blue-500',
          accent: 'bg-blue-100 dark:bg-blue-900/20'
        };
      case 'professional':
      case 'colleague':
        return {
          primary: 'from-teal-500 to-emerald-500',
          icon: 'text-teal-500',
          accent: 'bg-teal-100 dark:bg-teal-900/20'
        };
      case 'family':
        return {
          primary: 'from-amber-500 to-yellow-500',
          icon: 'text-amber-500',
          accent: 'bg-amber-100 dark:bg-amber-900/20'
        };
      default:
        return {
          primary: 'from-indigo-500 to-purple-500',
          icon: 'text-indigo-500',
          accent: 'bg-indigo-100 dark:bg-indigo-900/20'
        };
    }
  };
  
  const colors = getTypeColors();
  
  const getTypeIcon = () => {
    switch(relationshipType?.toLowerCase()) {
      case 'romantic':
      case 'partner':
        return <Heart size={32} className={colors.icon} />;
      case 'friendship':
      case 'friend':
        return <Users size={32} className={colors.icon} />;
      case 'professional':
      case 'colleague':
        return <BarChart2 size={32} className={colors.icon} />;
      case 'family':
        return <Users size={32} className={colors.icon} />;
      default:
        return <PieChart size={32} className={colors.icon} />;
    }
  };
  
  const getTypeSpecificText = () => {
    switch(relationshipType?.toLowerCase()) {
      case 'romantic':
      case 'partner':
        return {
          title: "Unlock Romantic Relationship Insights",
          subtitle: "Reveal emotional patterns, communication balance, attachment styles, and personalized recommendations."
        };
      case 'friendship':
      case 'friend':
        return {
          title: "Discover Friendship Analytics",
          subtitle: "Uncover interaction patterns, humor vs depth balance, shared interests, and friendship growth opportunities."
        };
      case 'professional':
      case 'colleague':
        return {
          title: "Analyze Professional Relationship Dynamics",
          subtitle: "Reveal communication effectiveness, response patterns, task focus, and professional development insights."
        };
      case 'family':
        return {
          title: "Understand Family Connection Patterns",
          subtitle: "Explore communication styles, emotional warmth, support networks, and family relationship insights."
        };
      default:
        return {
          title: `Unlock ${contactName} Relationship Analytics`,
          subtitle: "Import your chat history to reveal personalized insights, communication patterns, and recommendations."
        };
    }
  };

  // Animation effect for floating icons when hovered
  useEffect(() => {
    if (isHovered) {
      const icons = [
        { icon: <Heart size={16} />, style: { top: '20%', left: '10%', animationDelay: '0s' } },
        { icon: <BarChart2 size={16} />, style: { top: '70%', left: '80%', animationDelay: '0.5s' } },
        { icon: <PieChart size={16} />, style: { top: '80%', left: '30%', animationDelay: '1s' } },
        { icon: <Users size={16} />, style: { top: '30%', left: '85%', animationDelay: '1.5s' } },
        { icon: <Activity size={16} />, style: { top: '10%', left: '60%', animationDelay: '2s' } },
        { icon: <Zap size={16} />, style: { top: '50%', left: '15%', animationDelay: '2.5s' } }
      ];
      setFloatingIcons(icons);
    } else {
      setFloatingIcons([]);
    }
  }, [isHovered]);

  const text = getTypeSpecificText();
  
  const cardStyle = {
    padding: '2rem',
    borderRadius: '0.75rem',
    background: darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(249, 250, 251, 0.8)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'}`,
    boxShadow: darkMode ? 
      '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' : 
      '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 0
  };

  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
      <div 
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ 
          background: relationshipType?.toLowerCase() === 'romantic' || relationshipType?.toLowerCase() === 'partner' ? 'linear-gradient(to bottom right, #f43f5e, #ef4444)' : 
                    relationshipType?.toLowerCase() === 'friendship' || relationshipType?.toLowerCase() === 'friend' ? 'linear-gradient(to bottom right, #3b82f6, #6366f1)' : 
                    relationshipType?.toLowerCase() === 'professional' || relationshipType?.toLowerCase() === 'colleague' ? 'linear-gradient(to bottom right, #14b8a6, #10b981)' : 
                    relationshipType?.toLowerCase() === 'family' ? 'linear-gradient(to bottom right, #f59e0b, #eab308)' : 
                    'linear-gradient(to bottom right, #6366f1, #a855f7)',
          padding: '0.75rem 1.5rem',
          color: 'white'
        }}>
          <h3 style={{ fontWeight: 600, fontSize: '1.125rem'}}>{text.title}</h3>
        </div>
        
        <div style={{
          background: darkMode ? '#1f2937' : 'white',
          padding: '2.5rem 2rem',
          position: 'relative',
          minHeight: '20rem'
        }}>
          {/* Floating icons animation */}
          {floatingIcons.map((item, index) => (
            <div 
              key={index}
              style={{
                position: 'absolute',
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: relationshipType?.toLowerCase() === 'romantic' || relationshipType?.toLowerCase() === 'partner' ? (darkMode ? 'rgba(136, 19, 55, 0.2)' : '#ffe4e6') :
                          relationshipType?.toLowerCase() === 'friendship' || relationshipType?.toLowerCase() === 'friend' ? (darkMode ? 'rgba(30, 58, 138, 0.2)' : '#dbeafe') :
                          relationshipType?.toLowerCase() === 'professional' || relationshipType?.toLowerCase() === 'colleague' ? (darkMode ? 'rgba(19, 78, 74, 0.2)' : '#ccfbf1') :
                          relationshipType?.toLowerCase() === 'family' ? (darkMode ? 'rgba(120, 53, 15, 0.2)' : '#fef3c7') :
                          (darkMode ? 'rgba(49, 46, 129, 0.2)' : '#e0e7ff'),
                opacity: 0,
                animation: 'float 3s ease-in-out infinite',
                ...item.style,
                animationDelay: item.style.animationDelay
              }}
            >
              {item.icon}
            </div>
          ))}          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10
          }}>
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '9999px',
              background: relationshipType?.toLowerCase() === 'romantic' || relationshipType?.toLowerCase() === 'partner' ? (darkMode ? 'rgba(136, 19, 55, 0.2)' : '#ffe4e6') :
                        relationshipType?.toLowerCase() === 'friendship' || relationshipType?.toLowerCase() === 'friend' ? (darkMode ? 'rgba(30, 58, 138, 0.2)' : '#dbeafe') :
                        relationshipType?.toLowerCase() === 'professional' || relationshipType?.toLowerCase() === 'colleague' ? (darkMode ? 'rgba(19, 78, 74, 0.2)' : '#ccfbf1') :
                        relationshipType?.toLowerCase() === 'family' ? (darkMode ? 'rgba(120, 53, 15, 0.2)' : '#fef3c7') :
                        (darkMode ? 'rgba(49, 46, 129, 0.2)' : '#e0e7ff'),
            }}>
              {getTypeIcon()}
            </div>
            
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: 500,
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '0.75rem'
            }}>
              No in-depth analysis available yet
            </h4>
            
            <p style={{
              color: darkMode ? '#d1d5db' : '#4b5563',
              marginBottom: '1.5rem',
              maxWidth: '28rem'
            }}>
              {text.subtitle}
            </p>
            
            <button
              onClick={onImportClick}
              className="import-chat-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.85rem 1.75rem',
                background: 'linear-gradient(to right, #4f46e5, #8b5cf6)',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: darkMode ? 
                  '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' : 
                  '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              <Upload size={18} style={{ marginRight: '0.5rem' }} />
              <span>Import Chat History</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Add bouncing arrow animation pointing to the button */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-900 shadow-md`}>
          <Zap size={18} className={colors.icon} />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-20px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default RelationshipAnalyticsEmptyState;