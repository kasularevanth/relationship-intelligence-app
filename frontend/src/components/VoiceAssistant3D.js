// VoiceAssistant3D.js
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const VoiceAssistant3D = ({ 
  status = 'idle', // idle, listening, processing, speaking
  onActivate,
  size = 200, 
  primaryColor = '#3f51b5',
  secondaryColor = '#7986cb',
  accentColor = '#ff4081',
  speechVisualizerRef
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const orbitRef = useRef(null);
  const particlesRef = useRef(null);
  const waveformRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const audioVisualizerRef = useRef(null);
  const speechAnalyzerRef = useRef(null);
  
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (speechVisualizerRef) {
      speechVisualizerRef.current = {
        simulateWordEmphasis
      };
    }
  }, [speechVisualizerRef]);
  
  // Initialize the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(size, size);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Create the orbital sphere (main body)
    createOrbitalSphere();
    
    // Create particle system
    createParticleSystem();
    
    // Create audio visualizer/waveform
    createAudioVisualizer();
    speechAnalyzerRef.current = createSpeechAnalyzer();
    
    // Animation loop
    const animate = () => {
      if (orbitRef.current) {
        orbitRef.current.rotation.y += 0.005;
        
        // Pulsing effect for the orb
        const pulseFactor = 1 + Math.sin(Date.now() * 0.002) * 0.05;
        orbitRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
      }
      
      if (particlesRef.current && status === 'speaking' && speechAnalyzerRef.current) {
        particlesRef.current.rotation.y -= 0.002;
        
        // Update particle positions with speech-reactive movement
        const positions = particlesRef.current.geometry.attributes.position;
        const count = positions.count;
        const audioData = speechAnalyzerRef.current.getAudioData();
        const amplitude = audioData.getOverallAmplitude();
        
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const x = positions.array[i3];
          const y = positions.array[i3 + 1];
          const z = positions.array[i3 + 2];
          
          // More energetic particle movement when speaking
          const speechFactor = status === 'speaking' ? (0.5 + amplitude * 1.5) : 1.0;
          
          // Apply enhanced sine wave movement to particles
          positions.array[i3] = x + Math.sin(Date.now() * 0.001 + i * 0.1) * 0.01 * speechFactor;
          positions.array[i3 + 1] = y + Math.cos(Date.now() * 0.001 + i * 0.1) * 0.01 * speechFactor;
          positions.array[i3 + 2] = z + Math.sin(Date.now() * 0.001 + i * 0.05) * 0.01 * speechFactor;
        }
        
        positions.needsUpdate = true;
      }
      
      // Animate audio visualizer based on status
      if (audioVisualizerRef.current) {
        if (status === 'speaking' || status === 'listening') {
          animateAudioVisualizer();
        }
      }
      
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = size;
      const height = size;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [size]);
  
  // Create the main orbital sphere
  const createOrbitalSphere = () => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Create materials for the layered look
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(primaryColor),
      transparent: true,
      opacity: 0.9,
      emissive: new THREE.Color(primaryColor),
      emissiveIntensity: 0.3,
      shininess: 80
    });
    
    const outerMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(secondaryColor),
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    // Create inner sphere
    const innerSphere = new THREE.Mesh(geometry, innerMaterial);
    
    // Create outer sphere (slightly larger)
    const outerGeometry = new THREE.SphereGeometry(1.2, 24, 24);
    const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
    
    // Create a group to hold both spheres
    const orbitalGroup = new THREE.Group();
    orbitalGroup.add(innerSphere);
    orbitalGroup.add(outerSphere);
    
    // Add rings around the sphere
    const ringGeometry = new THREE.TorusGeometry(1.4, 0.03, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(accentColor),
      transparent: true,
      opacity: 0.7,
      emissive: new THREE.Color(accentColor),
      emissiveIntensity: 0.5
    });
    
    // Add three rings with different orientations
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring2.rotation.x = Math.PI / 4;
    ring2.rotation.y = Math.PI / 4;
    
    const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring3.rotation.x = -Math.PI / 3;
    ring3.rotation.z = Math.PI / 3;
    
    orbitalGroup.add(ring1);
    orbitalGroup.add(ring2);
    orbitalGroup.add(ring3);
    
    sceneRef.current.add(orbitalGroup);
    orbitRef.current = orbitalGroup;
  };

  const simulateWordEmphasis = (emphasisLevel) => {
    if (!audioVisualizerRef.current) return;
    
    // Update the waveform based on the emphasis level
    const { waveform, waveSegments, waveRadius } = audioVisualizerRef.current;
    const positions = waveform.geometry.attributes.position;
    
    // Create a more pronounced wave pattern for emphasized words
    for (let i = 0; i < waveSegments; i++) {
      const angle = (i / waveSegments) * Math.PI * 2;
      
      // Create a dynamic waveform that responds to word emphasis
      const waveIntensity = 0.2 * emphasisLevel;
      const time = Date.now() * 0.001;
      
      // More energetic waves for emphasized words
      const wave = Math.sin(time * 3 + i * 0.1) * waveIntensity;
      const radiusModifier = 1 + wave;
      
      const x = Math.cos(angle) * waveRadius * radiusModifier;
      const y = Math.sin(angle) * waveRadius * radiusModifier;
      
      positions.array[i * 3] = x;
      positions.array[i * 3 + 1] = y;
    }
    
    positions.needsUpdate = true;
    
    // Also make the core orb pulse slightly with each word
    if (orbitRef.current) {
      const currentScale = orbitRef.current.scale.x;
      const targetScale = 1 + (0.05 * emphasisLevel);
      
      // Use GSAP for smooth animation
      gsap.to(orbitRef.current.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 0.15,
        ease: "power1.out",
        onComplete: () => {
          gsap.to(orbitRef.current.scale, {
            x: currentScale,
            y: currentScale,
            z: currentScale,
            duration: 0.25,
            ease: "power1.in"
          });
        }
      });
    }
  };
  
  // Create the particle system that surrounds the orb
  const createParticleSystem = () => {
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const primaryColorObj = new THREE.Color(primaryColor);
    const secondaryColorObj = new THREE.Color(secondaryColor);
    const accentColorObj = new THREE.Color(accentColor);
    
    for (let i = 0; i < particleCount; i++) {
      // Position particles in a spherical distribution
      const radius = 1.8 + Math.random() * 1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Create a color gradient based on position
      const mixRatio = Math.random();
      const color = new THREE.Color().lerpColors(
        primaryColorObj, 
        mixRatio > 0.7 ? accentColorObj : secondaryColorObj, 
        mixRatio
      );
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    sceneRef.current.add(particles);
    particlesRef.current = particles;
  };
  
  // Create the audio visualizer component
  const createAudioVisualizer = () => {
    const waveformGeometry = new THREE.BufferGeometry();
    const waveSegments = 60;
    const waveRadius = 2.2;
    
    const positions = new Float32Array(waveSegments * 3);
    
    for (let i = 0; i < waveSegments; i++) {
      const angle = (i / waveSegments) * Math.PI * 2;
      const x = Math.cos(angle) * waveRadius;
      const y = Math.sin(angle) * waveRadius;
      const z = 0;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    waveformGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const waveformMaterial = new THREE.LineBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    });
    
    waveformGeometry.setDrawRange(0, waveSegments);
    
    const waveform = new THREE.LineLoop(waveformGeometry, waveformMaterial);
    sceneRef.current.add(waveform);
    waveformRef.current = waveform;
    audioVisualizerRef.current = { waveform, waveSegments, waveRadius };
  };
  
  // Animate the audio visualize
  const animateAudioVisualizer = () => {
    if (!audioVisualizerRef.current) return;
    
    const { waveform, waveSegments, waveRadius } = audioVisualizerRef.current;
    const positions = waveform.geometry.attributes.position;
    
    const time = Date.now() * 0.001;
    const baseIntensity = status === 'speaking' ? 0.3 : 0.15;
    
    // Get audio amplitude if available
    let amplitude = 1.0;
    if (status === 'speaking' && speechAnalyzerRef.current) {
      const audioData = speechAnalyzerRef.current.getAudioData();
      amplitude = 0.7 + audioData.getOverallAmplitude() * 2.5; // Scale it to make effects more visible
    }
    
    // Create more reactive and dynamic waveform based on speech
    for (let i = 0; i < waveSegments; i++) {
      const angle = (i / waveSegments) * Math.PI * 2;
      
      // Enhanced waveform animation
      let waveIntensity = baseIntensity * amplitude;
      
      // Multiple sine waves at different frequencies to create a more dynamic waveform
      const wave1 = Math.sin(time * 2 + i * 0.1) * waveIntensity;
      const wave2 = Math.sin(time * 3 + i * 0.2) * waveIntensity * 0.5;
      const wave3 = Math.sin(time * 5 + i * 0.5) * waveIntensity * 0.25;
      
      // Add more high-frequency details when speaking to simulate voice vibration
      const speechDetail = status === 'speaking' 
        ? Math.sin(time * 15 + i * 0.8) * waveIntensity * 0.15 
        : 0;
      
      // Combine all waves for a complex, reactive pattern
      const totalAmplitude = wave1 + wave2 + wave3 + speechDetail;
      const radiusModifier = 1 + totalAmplitude;
      
      const x = Math.cos(angle) * waveRadius * radiusModifier;
      const y = Math.sin(angle) * waveRadius * radiusModifier;
      
      positions.array[i * 3] = x;
      positions.array[i * 3 + 1] = y;
    }
    
    positions.needsUpdate = true;
  };


  const createSpeechAnalyzer = () => {
    // Check if Web Audio API is supported
    if (!window.AudioContext && !window.webkitAudioContext) return null;
    
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create analyzer
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    analyzer.smoothingTimeConstant = 0.7;
    
    // Setup data arrays
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    return {
      audioContext,
      analyzer,
      dataArray,
      bufferLength,
      
      // Connect to speech synthesis
      connectToSpeech: (utterance) => {
        // Using a workaround since direct connection to SpeechSynthesis 
        // is not standardized across browsers
        
        // We'll simulate audio reactivity instead
        return {
          // Start monitoring when speech begins
          onstart: () => {
            if (isAnimatingRef.current) return;
            isAnimatingRef.current = true;
            
            // Simulate speech vibration pattern
            const simulateSpeechPattern = () => {
              if (!isAnimatingRef.current) return;
              
              // Generate values simulating speech amplitude patterns
              for (let i = 0; i < bufferLength; i++) {
                // Create natural speech pattern simulation
                // Speech tends to have patterns of intensity with pauses
                const time = Date.now() * 0.001;
                const baseFactor = 0.4 + 0.6 * Math.sin(time * 0.5 + i * 0.1);
                const pauseFactor = Math.max(0, Math.sin(time * 1.5) * 0.7 + 0.3);
                const wordFactor = Math.max(0, Math.sin(time * 4.0 + i * 0.2) * 0.5 + 0.5);
                
                // Combine factors for a natural speech pattern
                dataArray[i] = Math.floor(baseFactor * pauseFactor * wordFactor * 255);
              }
              
              requestAnimationFrame(simulateSpeechPattern);
            };
            
            simulateSpeechPattern();
          },
          
          // Stop monitoring when speech ends
          onend: () => {
            isAnimatingRef.current = false;
          },
          
          // Handle errors
          onerror: () => {
            isAnimatingRef.current = false;
          }
        };
      },
      
      // Get current audio data
      getAudioData: () => {
        return {
          dataArray,
          bufferLength,
          
          // Get average amplitude from low, mid, and high frequencies
          getLowFrequencyAmplitude: () => {
            let sum = 0;
            const limit = Math.floor(bufferLength * 0.33);
            for (let i = 0; i < limit; i++) {
              sum += dataArray[i];
            }
            return sum / limit / 255; // Normalize to 0-1
          },
          
          getMidFrequencyAmplitude: () => {
            let sum = 0;
            const start = Math.floor(bufferLength * 0.33);
            const end = Math.floor(bufferLength * 0.66);
            for (let i = start; i < end; i++) {
              sum += dataArray[i];
            }
            return sum / (end - start) / 255; // Normalize to 0-1
          },
          
          getHighFrequencyAmplitude: () => {
            let sum = 0;
            const start = Math.floor(bufferLength * 0.66);
            for (let i = start; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            return sum / (bufferLength - start) / 255; // Normalize to 0-1
          },
          
          // Overall amplitude
          getOverallAmplitude: () => {
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            return sum / bufferLength / 255; // Normalize to 0-1
          }
        };
      }
    };
  };
  
  // Handle status changes with animations
  useEffect(() => {
    if (!orbitRef.current || !particlesRef.current || !waveformRef.current) return;
    
    const orbit = orbitRef.current;
    const particles = particlesRef.current;
    const waveform = waveformRef.current;
    
    // Stop any ongoing animations
    gsap.killTweensOf(orbit.scale);
    gsap.killTweensOf(orbit.rotation);
    gsap.killTweensOf(particles.material);
    gsap.killTweensOf(waveform.material);
    
    // Create status-specific animations
    switch (status) {
      case 'idle':
        // Subtle pulsing effect for idle
        gsap.to(orbit.scale, {
          x: 1, y: 1, z: 1,
          duration: 1,
          ease: "power2.out"
        });
        
        gsap.to(waveform.material, {
          opacity: 0.3,
          duration: 0.5
        });
        
        gsap.to(particles.material, {
          opacity: 0.6,
          size: 0.05,
          duration: 0.8
        });
        break;
        
      case 'listening':
        // Expand and become more active when listening
        gsap.to(orbit.scale, {
          x: 1.1, y: 1.1, z: 1.1,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)"
        });
        
        gsap.to(waveform.material, {
          opacity: 0.8,
          duration: 0.3
        });
        
        gsap.to(particles.material, {
          opacity: 0.9,
          size: 0.08,
          duration: 0.5
        });
        break;
        
      case 'processing':
        // Rapid rotation and pulsing when processing
        gsap.to(orbit.rotation, {
          y: orbit.rotation.y + Math.PI * 2,
          duration: 2,
          ease: "power2.inOut",
          repeat: -1
        });
        
        gsap.to(orbit.scale, {
          x: 1.2, y: 1.2, z: 1.2,
          duration: 0.6,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1
        });
        
        gsap.to(particles.material, {
          opacity: 1,
          size: 0.1,
          duration: 0.5
        });
        
        gsap.to(waveform.material, {
          opacity: 0.2,
          duration: 0.3
        });
        break;
        
    case 'speaking':
        // More dynamic, reactive pulsing when speaking
        gsap.to(orbit.scale, {
            x: 1.15, y: 1.15, z: 1.15,
            duration: 0.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
        
        // Add a slight wobble to simulate voice vibration
        gsap.to(orbit.rotation, {
            x: "+=0.05",
            y: "+=0.1",
            z: "+=0.05",
            duration: 0.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
        
        // Brighter, more energetic waveform when speaking
        gsap.to(waveform.material, {
            opacity: 1,
            emissiveIntensity: 0.8,
            duration: 0.3
        });
        
        // More energetic particles
        gsap.to(particles.material, {
            opacity: 0.9,
            size: 0.07,
            duration: 0.5
        });
        break;
        
      default:
        break;
    }
  }, [status, primaryColor, secondaryColor, accentColor]);
  
  // Handle hover state
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!orbitRef.current) return;
    
    gsap.to(orbitRef.current.scale, {
      x: 1.15, y: 1.15, z: 1.15,
      duration: 0.5,
      ease: "power2.out"
    });
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!orbitRef.current || status !== 'idle') return;
    
    gsap.to(orbitRef.current.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.5,
      ease: "power2.out"
    });
  };
  
  return (
    <div 
      className="voice-assistant-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        margin: '0 auto',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '50%',
        boxShadow: isHovered || status !== 'idle' ? 
          `0 0 25px 5px ${primaryColor}66` : 'none',
        transition: 'box-shadow 0.3s ease'
      }}
      onClick={onActivate}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <div 
        className="status-label"
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '0',
          right: '0',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: '500',
          color: primaryColor,
          textTransform: 'capitalize',
          opacity: isHovered || status !== 'idle' ? 1 : 0.7,
          transition: 'opacity 0.3s ease'
        }}
      >
        {status === 'idle' ? 'Tap to speak' : status}
      </div>
    </div>
  );
};

export default VoiceAssistant3D;