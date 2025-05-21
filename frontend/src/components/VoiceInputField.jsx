// frontend/src/components/VoiceInputField.js
import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import ContactsIcon from '@mui/icons-material/Contacts';

// Helper function to detect mobile devices
const isMobileDevice = () => {
  // Check both userAgent and screen dimensions
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isMobileViewport = window.innerWidth <= 768;
  
  return isMobileUserAgent || isMobileViewport;
};

const VoiceInputField = (props) => {
  const { 
    value, 
    onChange, 
    name,
    label,
    ...otherProps 
  } = props;

  const [loading, setLoading] = useState(false);

  const handleVoiceInput = () => {
    // Your existing voice input code
    console.log('Voice input activated');
  };

  const handleContactPicker = async () => {
    // Only proceed if the Contact Picker API is available
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      console.error('Contact Picker API not supported in this browser');
      alert('Contact selection is not supported in this browser. Please enter the name manually.');
      return;
    }

    setLoading(true);
    
    try {
      const contacts = await navigator.contacts.select(['name'], { multiple: false });
      
      if (contacts && contacts.length > 0) {
        // Get the first contact's name
        const contactName = contacts[0].name[0];
        // Create a synthetic event to match your onChange handler's expectations
        const event = {
          target: {
            name: name,
            value: contactName
          }
        };
        onChange(event);
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const isMobile = isMobileDevice();
  const isNameField = name === 'name';

  return (
    <TextField
      {...otherProps}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isMobile && isNameField ? (
              // Show contacts icon on mobile devices for name field
              <IconButton 
                edge="end"
                onClick={handleContactPicker}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : <ContactsIcon />}
              </IconButton>
            ) : (
              // Show mic icon in other cases
              <IconButton 
                edge="end"
                onClick={handleVoiceInput}
              >
                <MicIcon />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default VoiceInputField;