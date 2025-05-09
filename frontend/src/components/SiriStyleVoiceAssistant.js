// SiriStyleVoiceAssistant.js - Enhanced version
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const SiriStyleVoiceAssistant = ({ 
  status = 'idle', 
  onActivate,
  size = 240, 
  speechVisualizerRef
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const orbRef = useRef(null);
  const glowRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);
  
  const [isHovered, setIsHovered] = useState(false);
  
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
    
    // Renderer setup with post-processing
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(size, size);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x111111, 0.2);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(1, 1, 2);
    scene.add(mainLight);
    
    // Create the Siri orb
    createSiriOrb();
    
    // Animation loop
    const animate = () => {
      timeRef.current += 0.016;
      
      if (orbRef.current) {
        updateSiriAnimation();
      }
      
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.setSize(size, size);
    };
    
    window.addEventListener('resize', handleResize);
    
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
  
  // Create the Siri-style orb with authentic Siri visual effects
  const createSiriOrb = () => {
    const orbGroup = new THREE.Group();
    sceneRef.current.add(orbGroup);
    orbRef.current = orbGroup;
    
    // Outer sphere (container)
    const outerGeometry = new THREE.SphereGeometry(1, 64, 64);
    const outerMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a0a1a,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
      specular: 0x1a1a2a,
      side: THREE.FrontSide
    });
    const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
    orbGroup.add(outerSphere);
    
    // Inner sphere for the colored lights
    const innerGeometry = new THREE.SphereGeometry(0.95, 64, 64);
    
    // Create shader material for the Siri effect
    const siriShaderMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        time: { value: 0.0 },
        intensity: { value: 0.8 },
        active: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform float active;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        // Authentic Siri colors
        vec3 siriBlue = vec3(0.1, 0.6, 1.0);     // Blue
        vec3 siriPink = vec3(1.0, 0.2, 0.6);     // Pink
        vec3 siriWhite = vec3(1.0, 1.0, 1.0);    // White for center
        vec3 siriTeal = vec3(0.0, 0.8, 0.8);     // Teal accent
        
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          // Create the Siri X-pattern
          float xPattern1 = abs(vPosition.x - vPosition.y) * 3.5;
          float xPattern2 = abs(vPosition.x + vPosition.y) * 3.5;
          float xMask = min(xPattern1, xPattern2);
          xMask = smoothstep(0.4, 0.0, xMask);
          
          // Dynamic wave effects
          float wave1 = sin(vPosition.x * 5.0 + time * 1.5) * 0.5 + 0.5;
          float wave2 = sin(vPosition.y * 4.0 - time * 1.2) * 0.5 + 0.5;
          float wave3 = sin(vPosition.z * 6.0 + time * 1.0) * 0.5 + 0.5;
          
          // Create central bright spot
          float centerDist = length(vPosition);
          float centralGlow = smoothstep(0.6, 0.0, centerDist);
          centralGlow = pow(centralGlow, 1.5) * 3.0;
          
          // Rim lighting effect
          float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
          rim = pow(rim, 2.0) * 1.5;
          
          // Create dynamic color shifts
          float colorShift = sin(time * 0.3) * 0.5 + 0.5;
          vec3 xColor1 = mix(siriBlue, siriPink, colorShift);
          vec3 xColor2 = mix(siriTeal, siriPink, 1.0 - colorShift);
          
          // X-pattern with color variation
          vec3 xPatternColor = mix(xColor1, xColor2, wave1);
          
          // Final color mixing
          vec3 baseColor = mix(siriBlue * 0.5, siriTeal * 0.5, wave2);
          vec3 finalColor = mix(baseColor, xPatternColor, xMask * intensity);
          
          // Add bright white center
          finalColor = mix(finalColor, siriWhite, centralGlow);
          
          // Dynamic opacity
          float baseOpacity = 0.2 + rim * 0.3;
          float xOpacity = xMask * intensity * (0.7 + active * 0.3);
          float finalOpacity = max(baseOpacity, xOpacity);
          
          // Add central glow opacity
          finalOpacity = max(finalOpacity, centralGlow * 0.9);
          
          // Add pulsing when active
          if (active > 0.5) {
            finalOpacity *= 0.8 + sin(time * 6.0) * 0.2;
            finalColor *= 0.9 + sin(time * 6.0) * 0.1;
          }
          
          gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `
    });
    
    const innerSphere = new THREE.Mesh(innerGeometry, siriShaderMaterial);
    orbGroup.add(innerSphere);
    
    // Outer glow effect
    const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4060ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    orbGroup.add(glow);
    glowRef.current = glow;
    
    // Add additional light rays for more authentic Siri look
    addSiriLightRays(orbGroup);
  };
  
  // Add the distinctive Siri light rays
  const addSiriLightRays = (parent) => {
    const raysGroup = new THREE.Group();
    parent.add(raysGroup);
    
    // Main X-cross light beams
    const rayShaderMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        time: { value: 0.0 },
        color1: { value: new THREE.Color(0x00a2ff) },
        color2: { value: new THREE.Color(0xff2d8a) },
        opacity: { value: 0.85 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
          // Calculate distance from center line
          float distFromCenter = abs(vUv.y - 0.5) * 2.0;
          
          // Create color gradient across the beam
          vec3 color = mix(color1, color2, vUv.x);
          
          // Fade out toward edges
          float alpha = (1.0 - distFromCenter) * opacity;
          
          // Add pulsing effect
          alpha *= 0.7 + sin(time * 3.0 + vUv.x * 8.0) * 0.3;
          
          // Create bright center
          color = mix(color, vec3(1.0), pow(1.0 - distFromCenter, 3.0) * 0.8);
          
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    
    // First diagonal beam (top-left to bottom-right)
    const beam1Geometry = new THREE.PlaneGeometry(2.8, 0.3);
    const beam1 = new THREE.Mesh(beam1Geometry, rayShaderMaterial.clone());
    beam1.rotation.z = Math.PI / 4; // 45 degrees
    beam1.position.z = 0.01;
    raysGroup.add(beam1);
    
    // Second diagonal beam (top-right to bottom-left)
    const beam2Geometry = new THREE.PlaneGeometry(2.8, 0.3);
    const beam2 = new THREE.Mesh(beam2Geometry, rayShaderMaterial.clone());
    beam2.rotation.z = -Math.PI / 4; // -45 degrees
    beam2.position.z = 0.01;
    raysGroup.add(beam2);
    
    // Store reference for animation
    parent.userData.rays = raysGroup;
  };
  
  // Update Siri animation
  const updateSiriAnimation = () => {
    const orb = orbRef.current;
    const time = timeRef.current;
    
    // Update all shader uniforms
    orb.children.forEach(child => {
      if (child.material && child.material.uniforms) {
        if (child.material.uniforms.time) {
          child.material.uniforms.time.value = time;
        }
        
        // Update active state based on status
        if (child.material.uniforms.active) {
          child.material.uniforms.active.value = 
            status === 'idle' ? 0.0 : 
            status === 'listening' ? 1.0 : 
            status === 'processing' ? 0.8 : 
            status === 'speaking' ? 0.9 : 0.0;
        }
      }
    });
    
    // Update ray group if it exists
    if (orb.userData.rays) {
      const rays = orb.userData.rays;
      
      rays.children.forEach(ray => {
        if (ray.material && ray.material.uniforms) {
          if (ray.material.uniforms.time) {
            ray.material.uniforms.time.value = time;
          }
          
          // Adjust opacity based on status
          if (ray.material.uniforms.opacity) {
            const baseOpacity = 
              status === 'idle' ? 0.6 : 
              status === 'listening' ? 0.9 : 
              status === 'processing' ? 0.85 : 
              status === 'speaking' ? 0.95 : 0.6;
            
            ray.material.uniforms.opacity.value = baseOpacity;
          }
        }
      });
      
      // Subtle rotation for rays
      rays.rotation.z = Math.sin(time * 0.2) * 0.05;
    }
    
    // Apply animated rotation
    orb.rotation.y += 0.001;
    if (status !== 'idle') {
      orb.rotation.x = Math.sin(time * 0.2) * 0.02;
    }
    
    // Update glow effect
    if (glowRef.current) {
      if (status === 'listening' || status === 'speaking') {
        const pulseIntensity = 0.2 + Math.sin(time * 5) * 0.1;
        glowRef.current.material.opacity = pulseIntensity;
        
        // Update glow color based on status
        if (status === 'listening') {
          glowRef.current.material.color.setHex(0x4080ff); // Blue for listening
        } else {
          glowRef.current.material.color.setHex(0xff4080); // Pink for speaking
        }
      } else if (status === 'processing') {
        const processIntensity = 0.15 + Math.sin(time * 10) * 0.1;
        glowRef.current.material.opacity = processIntensity;
        glowRef.current.material.color.setHex(0xffaa40); // Orange for processing
      } else {
        glowRef.current.material.opacity = 0.1;
        glowRef.current.material.color.setHex(0x4060ff); // Default blue
      }
    }
  };
  
  // Simulate word emphasis for speech visualization
  const simulateWordEmphasis = (emphasisLevel = 1.0) => {
    if (!orbRef.current) return;
    
    const targetScale = 1 + (0.05 * emphasisLevel);
    
    // Scale up quickly then back down
    gsap.to(orbRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 0.1,
      ease: "power1.out",
      onComplete: () => {
        gsap.to(orbRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.2,
          ease: "power1.in"
        });
      }
    });
    
    // Pulse the glow
    if (glowRef.current) {
      const currentOpacity = glowRef.current.material.opacity;
      gsap.to(glowRef.current.material, {
        opacity: currentOpacity * 1.5,
        duration: 0.1,
        ease: "power1.out",
        onComplete: () => {
          gsap.to(glowRef.current.material, {
            opacity: currentOpacity,
            duration: 0.2,
            ease: "power1.in"
          });
        }
      });
    }
  };
  
  // Expose simulateWordEmphasis to parent component
  useEffect(() => {
    if (speechVisualizerRef) {
      speechVisualizerRef.current = {
        simulateWordEmphasis
      };
    }
  }, [speechVisualizerRef]);
  
  // Handle status changes
  useEffect(() => {
    if (!orbRef.current) return;
    
    const orb = orbRef.current;
    
    // Apply different animations based on status
    switch (status) {
      case 'idle':
        gsap.to(orb.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.5,
          ease: "power2.out"
        });
        break;
        
      case 'listening':
        // Pulse animation when listening
        gsap.to(orb.scale, {
          x: 1.05, y: 1.05, z: 1.05,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)"
        });
        break;
        
      case 'processing':
        // Rotation animation when processing
        gsap.to(orb.rotation, {
          y: orb.rotation.y + Math.PI * 2,
          duration: 2,
          ease: "power2.inOut",
          repeat: -1
        });
        break;
        
      case 'speaking':
        // Subtle pulsing when speaking
        gsap.to(orb.scale, {
          x: 1.03, y: 1.03, z: 1.03,
          duration: 0.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
        break;
        
      default:
        break;
    }
  }, [status]);
  
  // Handle hover state
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!orbRef.current) return;
    
    gsap.to(orbRef.current.scale, {
      x: 1.05, y: 1.05, z: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
    
    if (glowRef.current) {
      gsap.to(glowRef.current.material, {
        opacity: 0.25,
        duration: 0.3
      });
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!orbRef.current || status !== 'idle') return;
    
    gsap.to(orbRef.current.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.3,
      ease: "power2.out"
    });
    
    if (glowRef.current && status === 'idle') {
      gsap.to(glowRef.current.material, {
        opacity: 0.1,
        duration: 0.3
      });
    }
  };
  
  return (
    <div 
      style={{
        width: `${size}px`,
        height: `${size}px`,
        margin: '0 auto',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(10,20,40,1) 0%, rgba(5,10,30,1) 100%)',
        boxShadow: isHovered || status !== 'idle' ? 
          `0 0 30px 5px rgba(68, 169, 255, 0.3)` : 'none',
        transition: 'box-shadow 0.3s ease'
      }}
      onClick={onActivate}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
      <div 
        className="status-label"
        style={{
          position: 'absolute',
          bottom: '-65px',
          left: '0',
          right: '0',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '500',
          color: '#5d9dff',
          opacity: isHovered || status !== 'idle' ? 1 : 0.7,
          transition: 'opacity 0.3s ease'
        }}
      >
        {status === 'idle' ? 'Tap to ask a question by voice' : 
         status === 'listening' ? 'Listening...' : 
         status === 'processing' ? 'Processing...' :
         status === 'speaking' ? 'Speaking...' : ''}
      </div>
    </div>
  );
};

export default SiriStyleVoiceAssistant;