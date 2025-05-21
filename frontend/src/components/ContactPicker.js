// frontend/src/components/ContactPicker.js
import React, { useState } from 'react';
import ContactsIcon from '@mui/icons-material/Contacts';
import { IconButton, CircularProgress } from '@mui/material';

const ContactPicker = ({ onContactSelected, className }) => {
  const [loading, setLoading] = useState(false);

  const openContactPicker = async () => {
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
        onContactSelected(contactName);
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton 
      onClick={openContactPicker}
      className={className}
      disabled={loading}
      aria-label="select from contacts"
    >
      {loading ? <CircularProgress size={24} /> : <ContactsIcon />}
    </IconButton>
  );
};

export default ContactPicker;