import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Upload, Move, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';

// Styled components
const EnhancedAvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
  
  &:hover .upload-overlay {
    opacity: 1;
  }
`;

// Create a new container for actions
const PhotoActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
  gap: 4px;
`;
const AdjustButton = styled.button`
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const AvatarUploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  
  svg {
    margin-bottom: 0.25rem;
  }
`;

const PhotoAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  background-color: ${props => props.photoUrl ? 'transparent' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'};
  background-image: ${props => !props.photoUrl && 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'};
  background-size: cover;
  background-position: center;
  border: 3px solid #f9fafb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
`;

const FileInput = styled.input`
  display: none;
`;

const RemoveButton = styled.button`
  padding: 4px 8px;
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  margin-top: 4px;
  
  &:hover {
    background-color: #fee2e2;
  }
`;

// Add a new Upload Button component
const UploadLabel = styled.span`
  display: block;
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
`;


// Add these new styled components
const AdjustmentControls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 5px;
`;

const ControlButton = styled.button`
  background: transparent;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SaveCancelRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 2px;
`;

const AdjustablePhotoAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  
  img {
    position: absolute;
    transform-origin: center;
    transform: ${props => `scale(${props.zoom}) translate(${props.offsetX}px, ${props.offsetY}px) rotate(${props.rotation}deg)`};
    transition: transform 0.2s ease;
  }
`;

/**
 * ProfilePhotoUpload Component
 * 
 * Handles uploading, displaying, and deleting profile photos for relationships
 * 
 * @param {Object} relationship - The relationship object containing contact info and photo
 * @param {Function} onPhotoUpload - Callback function triggered after successful photo upload/removal
 */
const ProfilePhotoUpload = ({ relationship, onPhotoUpload }) => {
    const [photoUrl, setPhotoUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    // Add to the ProfilePhotoUpload component state
    const [isAdjusting, setIsAdjusting] = useState(false);
const [imageAdjustments, setImageAdjustments] = useState({
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0
});
const [originalAdjustments, setOriginalAdjustments] = useState(null);
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
const [tempFile, setTempFile] = useState(null);
const adjustmentRef = useRef(null);
  // Get API base URL
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


  
  // Effect to update local state when relationship prop changes
  useEffect(() => {
    if (relationship && relationship.photo) {
      // If photo is a relative path, construct full URL
      const fullPhotoUrl = relationship.photo.startsWith('http') 
        ? relationship.photo 
        : `${apiBaseUrl.endsWith('/api') ? apiBaseUrl.replace('/api', '') : apiBaseUrl}${relationship.photo}`;
      setPhotoUrl(fullPhotoUrl);
    } else {
      setPhotoUrl(null);
    }
  }, [relationship, apiBaseUrl]);


  // Add these new handler functions
  const handleStartAdjustment = () => {
    if (!photoUrl) return;
    
    setIsAdjusting(true);
    setOriginalAdjustments({...imageAdjustments});
  };
  
  const handleZoomIn = () => {
    setImageAdjustments(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.1, 2.0)
    }));
  };
  
  const handleZoomOut = () => {
    setImageAdjustments(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.1, 0.5)
    }));
  };
  
  const handleRotate = () => {
    setImageAdjustments(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };
  
  const handleMouseDown = (e) => {
    if (!isAdjusting) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    
    setImageAdjustments(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX / imageAdjustments.zoom,
      offsetY: prev.offsetY + deltaY / imageAdjustments.zoom
    }));
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleTouchStart = (e) => {
    if (!isAdjusting) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    
    setDragStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
    
    setImageAdjustments(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX / imageAdjustments.zoom,
      offsetY: prev.offsetY + deltaY / imageAdjustments.zoom
    }));
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const saveAdjustments = async () => {
    try {
      setIsUploading(true);
      
      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append('photo', tempFile);
      
      // Add adjustment data
      formData.append('adjustments', JSON.stringify(imageAdjustments));
      
      // Construct upload URL
      const uploadUrl = `${apiBaseUrl}/relationships/${relationship._id}/photo`;
      
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.photo) {
        // Revoke the temporary URL to prevent memory leaks
        if (photoUrl && photoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(photoUrl);
        }
        
        // Construct full URL if relative path is returned
        const fullPhotoUrl = data.photo.startsWith('http') 
          ? data.photo 
          : `${apiBaseUrl.endsWith('/api') ? apiBaseUrl.replace('/api', '') : apiBaseUrl}${data.photo}`;
        
        setPhotoUrl(fullPhotoUrl);
        
        // Notify parent component
        if (onPhotoUpload) {
          onPhotoUpload(data.photo); // Pass the path, not the full URL
        }
      }
      
      setIsAdjusting(false);
      setTempFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload photo: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const cancelAdjustments = () => {
    // If this is a new upload (we have a tempFile), revert to previous state
    if (tempFile) {
      // Revoke temporary object URL to prevent memory leaks
      if (photoUrl && photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoUrl);
      }
      
      // If there was a previous photo, restore it
      if (relationship && relationship.photo) {
        const fullPhotoUrl = relationship.photo.startsWith('http') 
          ? relationship.photo 
          : `${apiBaseUrl.endsWith('/api') ? apiBaseUrl.replace('/api', '') : apiBaseUrl}${relationship.photo}`;
        setPhotoUrl(fullPhotoUrl);
      } else {
        setPhotoUrl(null);
      }
      
      setTempFile(null);
    } else {
      // Just reset adjustments for existing photo
      setImageAdjustments(originalAdjustments || {
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0
      });
    }
    
    setIsAdjusting(false);
  };
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // File type validation
    if (!file.type.startsWith('image/')) {
      alert("Only image files are allowed.");
      return;
    }
    
    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('photo', file);
      
      // Construct upload URL
      const uploadUrl = `${apiBaseUrl}/relationships/${relationship._id}/photo`;
      
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.photo) {
        // Construct full URL if relative path is returned
        const fullPhotoUrl = data.photo.startsWith('http') 
          ? data.photo 
          : `${apiBaseUrl.endsWith('/api') ? apiBaseUrl.replace('/api', '') : apiBaseUrl}${data.photo}`;
        
        setPhotoUrl(fullPhotoUrl);
        
        // Notify parent component
        if (onPhotoUpload) {
          onPhotoUpload(data.photo); // Pass the path, not the full URL
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload photo: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleClickUpload = () => {
    fileInputRef.current.click();
  };
  
  const handleDeletePhoto = async () => {
    if (!photoUrl || !window.confirm('Are you sure you want to remove this photo?')) {
      return;
    }
    
    try {
      setIsUploading(true);
      
      const deleteUrl = `${apiBaseUrl}/relationships/${relationship._id}/photo`;
      const token = localStorage.getItem('token');
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete photo: ${response.status}`);
      }
      
      setPhotoUrl(null);
      
      if (onPhotoUpload) {
        onPhotoUpload(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete photo: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };
  
  return (
    <div>
      <EnhancedAvatarContainer onClick={isUploading ? null : handleClickUpload}>
      <PhotoAvatar photoUrl={photoUrl}>
  {!photoUrl ? (
    <span>{getInitial(relationship.contactName)}</span>
  ) : isAdjusting ? (
    <AdjustablePhotoAvatar
      ref={adjustmentRef}
      zoom={imageAdjustments.zoom}
      offsetX={imageAdjustments.offsetX}
      offsetY={imageAdjustments.offsetY}
      rotation={imageAdjustments.rotation}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img src={photoUrl} alt="Profile" style={{ maxWidth: 'none', width: '100%' }} />
    </AdjustablePhotoAvatar>
  ) : (
    <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  )}
  
  {isAdjusting && (
    <AdjustmentControls>
      <ControlsRow>
        <ControlButton onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </ControlButton>
        <ControlButton onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </ControlButton>
        <ControlButton onClick={handleRotate} title="Rotate">
          <RotateCw size={16} />
        </ControlButton>
      </ControlsRow>
      <div style={{ fontSize: '8px', marginBottom: '4px' }}>Drag to position</div>
      <SaveCancelRow>
        <ControlButton onClick={saveAdjustments}>
          <Check size={16} color="#4ade80" />
        </ControlButton>
        <ControlButton onClick={cancelAdjustments}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </ControlButton>
      </SaveCancelRow>
    </AdjustmentControls>
  )}
</PhotoAvatar>
        
        {isUploading && (
          <LoadingOverlay>
            Uploading...
          </LoadingOverlay>
        )}
        
        {!isUploading && (
          <AvatarUploadOverlay className="upload-overlay">
            <Upload size={24} />
            <span>{photoUrl ? 'Change Photo' : 'Add Photo'}</span>
          </AvatarUploadOverlay>
        )}
        
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={isUploading} 
        />
      </EnhancedAvatarContainer>

      <PhotoActionsContainer>
  {!isAdjusting && (
    <UploadLabel onClick={isUploading ? null : handleClickUpload}>
      Upload Photo
    </UploadLabel>
  )}
  
  {photoUrl && !isUploading && !isAdjusting && !tempFile && (
    <RemoveButton onClick={(e) => {
      e.stopPropagation();
      handleDeletePhoto();
    }}>
      Remove Photo
    </RemoveButton>
  )}
</PhotoActionsContainer>
    </div>
  );
};

export default ProfilePhotoUpload;