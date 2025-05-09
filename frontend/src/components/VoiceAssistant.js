// Updated VoiceAssistant.js with enhanced animations
import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { Canvas, useFrame } from '@react-three/fiber';

// Enhanced animation keyframes
const pulse = keyframes`
  0% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const SiriContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '180px',
  height: '180px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// More dynamic circles with varying opacities and animations
const AnimatedCircle = styled(Box)(({ theme, size, delay, duration, isAnimating }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: 'transparent',
  border: '2px solid #39FF14',
  boxShadow: '0 0 20px #39FF14',
  opacity: isAnimating ? 0.6 : 0.1,
  animation: isAnimating ? `${float} ${duration}s ease-in-out infinite` : 'none',
  animationDelay: `${delay}s`,
}));

// Core orb that pulses
const CoreOrb = styled(Box)(({ theme, isAnimating }) => ({
  position: 'absolute',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(57,255,20,1) 0%, rgba(57,255,20,0.3) 70%, rgba(57,255,20,0) 100%)',
  boxShadow: '0 0 30px #39FF14',
  opacity: isAnimating ? 1 : 0.3,
  animation: isAnimating ? `${pulse} 3s infinite ease-in-out` : 'none',
  zIndex: 2,
}));

// Energy particles that animate outward
const EnergyParticle = styled(Box)(({ theme, angle, distance, size, isAnimating, delay }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: '#39FF14',
  boxShadow: '0 0 8px #39FF14',
  transform: `rotate(${angle}deg) translateX(${distance}px)`,
  opacity: isAnimating ? 0.8 : 0,
  animation: isAnimating ? `${pulse} 2s infinite ease-in-out` : 'none',
  animationDelay: `${delay}s`,
}));



// 3D Visualization component using Three.js
const ThreeJSVisualization = ({ isAnimating }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.3;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.x = meshRef.current.scale.y = meshRef.current.scale.z = 
        1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  if (!isAnimating) return null;
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#39FF14"
        emissive="#39FF14"
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

const AudioWave = ({ isAnimating, waveCount = 20 }) => {
  const wavesRef = useRef([]);
  
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        wavesRef.current.forEach((wave, index) => {
          if (wave) {
            const height = 5 + Math.sin(Date.now() / 200 + index) * 15;
            wave.style.height = `${height}px`;
          }
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [isAnimating]);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '40px', 
      width: '100%',
      mt: 2
    }}>
      {Array.from({ length: waveCount }).map((_, i) => (
        <Box
          key={i}
          ref={el => wavesRef.current[i] = el}
          sx={{
            width: '3px',
            height: isAnimating ? `${5 + Math.sin(i) * 15}px` : '3px',
            mx: '2px',
            backgroundColor: '#39FF14',
            borderRadius: '2px',
            transition: 'height 0.2s ease',
            opacity: isAnimating ? 0.7 : 0.3
          }}
        />
      ))}
    </Box>
  );
};

const VoiceAssistant = ({ message, onComplete }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const speechSynthesisRef = useRef(null);
  
  // Initialize Text-to-Speech
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Preload voices
      speechSynthesisRef.current.onvoiceschanged = () => {
        speechSynthesisRef.current.getVoices();
      };
    }
    
    return () => {
      if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);
  
  // Speak the message when it changes
  useEffect(() => {
    if (message && !isSpeaking) {
      speakMessage();
    }
  }, [message]);
  
  const speakMessage = () => {
    if (speechSynthesisRef.current && message) {
      // Cancel any ongoing speech
      if (speechSynthesisRef.current.speaking) {
        speechSynthesisRef.current.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Select a voice that sounds more natural
      const voices = speechSynthesisRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google UK English Female') || 
        voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Set properties for more natural sound
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      
      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsAnimating(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        // Keep animation for a short moment after speech ends
        setTimeout(() => {
          setIsAnimating(false);
          if (onComplete) onComplete();
        }, 1500);
      };
      
      // Start speaking
      speechSynthesisRef.current.speak(utterance);
    }
  };
  
  // Create animated circles
  const renderCircles = () => {
    return [
      { size: '120px', delay: 0, duration: 6 },
      { size: '90px', delay: 0.5, duration: 5 },
      { size: '150px', delay: 1, duration: 7 },
    ].map((circle, index) => (
      <AnimatedCircle 
        key={index} 
        size={circle.size} 
        delay={circle.delay} 
        duration={circle.duration} 
        isAnimating={isAnimating} 
      />
    ));
  };
  
  // Create energy particles
  const renderParticles = () => {
    return Array.from({ length: 12 }).map((_, index) => {
      const angle = index * 30;
      const distance = 40 + Math.random() * 30;
      const size = 4 + Math.random() * 6 + 'px';
      const delay = Math.random() * 1;
      
      return (
        <EnergyParticle 
          key={index} 
          angle={angle} 
          distance={distance} 
          size={size} 
          delay={delay}
          isAnimating={isAnimating} 
        />
      );
    });
  };
  
  return (
    <Box sx={{ my: 3, textAlign: 'center' }}>
      <SiriContainer>
        {renderCircles()}
        <CoreOrb isAnimating={isAnimating} />
        {renderParticles()}
        
        <Box sx={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <ThreeJSVisualization isAnimating={isAnimating} />
          </Canvas>
        </Box>

          {/* VoiceButton has been removed */}
      </SiriContainer>
      
      <AudioWave isAnimating={isAnimating} />
    </Box>
  );
};

export default VoiceAssistant;