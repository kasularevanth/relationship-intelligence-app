// frontend/src/pages/NewRelationship.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // Add this import
import {
  Box,
  Button,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Container,
  IconButton // Add IconButton import
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Add this import

// Import the VoiceInputField component
import VoiceInputField from '../components/VoiceInputField';

const relationshipTypes = [
  'Family',
  'Friend',
  'Partner',
  'Colleague',
  'Mentor',
  'Mentee',
  'Acquaintance',
  'Other'
];

const frequencyOptions = [
  'Daily',
  'Several times a week',
  'Weekly',
  'Monthly',
  'Occasionally',
  'Rarely'
];

const NewRelationship = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { currentUser } = useAuth();
  const { darkMode } = useTheme(); // Add this line to get dark mode state
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    relationshipType: '',
    contactInfo: '',
    frequency: '',
    howWeMet: '',
    notes: ''
  });

  // Function to handle back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Log to help debug
    console.log(`Field updated: ${name} = ${value}`);
    
    // Update the form data by preserving all other fields
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear any error for this field
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  // Validate current step fields
  const validateCurrentStep = () => {
    const errors = {};
    let isValid = true;
    
    if (activeStep === 0) {
      if (!formData.name.trim()) {
        errors.name = true;
        isValid = false;
      }
      if (!formData.relationshipType) {
        errors.relationshipType = true;
        isValid = false;
      }
    } else if (activeStep === 1) {
      if (!formData.frequency) {
        errors.frequency = true;
        isValid = false;
      }
      if (!formData.howWeMet.trim()) {
        errors.howWeMet = true;
        isValid = false;
      }
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(prevStep => prevStep + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
    setError('');
  };

  const validateBasicInfo = () => {
    return formData.name && formData.relationshipType;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBasicInfo()) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/relationships`,
        formData,
        {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Make sure this is set
            }
        }
      );
      
      // Navigate to the relationship profile page
      navigate(`/relationships/${response.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create relationship');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to determine if Next button should be disabled
  const isNextButtonDisabled = () => {
    if (activeStep === 0) {
      return !formData.name || !formData.relationshipType;
    } else if (activeStep === 1) {
      return !formData.frequency || !formData.howWeMet;
    }
    return false;
  };

  const steps = ['Basic Information', 'Relationship Details', 'Review'];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
          {/* Just use the VoiceInputField directly without the Box wrapper */}
          <VoiceInputField
            required
            fullWidth
            id="name"
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
            error={!!fieldErrors.name}
            helperText={fieldErrors.name ? "Name is required" : ""}
          />
        </Grid>
            
              
              <Grid item xs={12}>
              <FormControl fullWidth required error={!!fieldErrors.relationshipType}>
                  <InputLabel id="relationshipType-label">Relationship Type</InputLabel>
                  <Select
                    labelId="relationshipType-label"
                    id="relationshipType"
                    name="relationshipType"
                    value={formData.relationshipType}
                    onChange={handleChange}
                    label="Relationship Type"
                  >
                    {relationshipTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.relationshipType && (
                                      <FormHelperText>Relationship type is required</FormHelperText>
                                    )}
                </FormControl>
              </Grid>          
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
              <FormControl fullWidth required error={!!fieldErrors.frequency}>
                  <InputLabel id="frequency-label">How often do you interact?</InputLabel>
                  <Select
                    labelId="frequency-label"
                    id="frequency"
                    name="frequency"
                    value={formData.frequency || ''}
                    onChange={handleChange}
                    label="How often do you interact?"
                  >
                    {frequencyOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.frequency && (
                                      <FormHelperText>Please select how often you interact</FormHelperText>
                                    )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                {/* Replace TextField with VoiceInputField for howWeMet */}
                <VoiceInputField
                  required
                  fullWidth
                  id="howWeMet"
                  name="howWeMet"
                  label="How did you meet?"
                  multiline
                  rows={3}
                  value={formData.howWeMet}
                  onChange={handleChange}
                  placeholder="Enter or speak how you met"
                  error={!!fieldErrors.howWeMet}
                  helperText={fieldErrors.howWeMet ? "Please describe how you met" : ""}
                />
              </Grid>            
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Name:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{formData.name}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Relationship Type:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{formData.relationshipType}</Typography>
                </Grid>
                
                {formData.contactInfo && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Contact Info:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{formData.contactInfo}</Typography>
                    </Grid>
                  </>
                )}
                
                {formData.frequency && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Interaction Frequency:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{formData.frequency}</Typography>
                    </Grid>
                  </>
                )}
                
                {formData.howWeMet && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">How You Met:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{formData.howWeMet}</Typography>
                    </Grid>
                  </>
                )}
                
                {formData.notes && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Additional Notes:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{formData.notes}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ 
      pb: 4, // Add padding at the bottom
      px: { xs: 2, sm: 3 }, // Add responsive horizontal padding
    }}>
      {/* Add back button and header section */}
      <Box sx={{ 
        mt: { xs: 4, sm: 5 },
        mb: 4,
      }}>
        {/* Back Button Row */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}>
          <IconButton
            onClick={handleBackToDashboard}
            sx={{
              color: darkMode ? '#fff' : '#000',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              },
              borderRadius: 2,
              p: 1,
              mr: 2,
            }}
            aria-label="Back to dashboard"
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Back to Dashboard
          </Typography>
        </Box>

        {/* Header Section */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              color: darkMode ? '#fff' : '#000',
              fontWeight: 600,
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            Add New Relationship
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 1,
              color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              maxWidth: '90%',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Create a profile for someone important in your life
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Update Paper component styling */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, // Responsive padding
          bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
          color: darkMode ? '#ffffff' : 'inherit',
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 1px 8px rgba(0,0,0,0.1)',
          borderRadius: 2,
          mx: 'auto', // Center horizontally
          width: '100%', // Full width of container
          maxWidth: '100%', // Ensure it doesn't overflow
        }}
      >
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            pt: 3, 
            pb: 5,
            '& .MuiStepLabel-label': {
              color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit',
            },
            '& .MuiStepLabel-active': {
              color: darkMode ? '#fff' : 'primary.main',
            },
            '& .MuiStepIcon-root.Mui-active': {
              color: darkMode ? '#6366f1' : 'primary.main',
            },
            '& .MuiStepIcon-root.Mui-completed': {
              color: darkMode ? '#4ade80' : 'success.main',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box 
          component="form" 
          noValidate
          sx={{
            '& .MuiInputBase-root': {
              color: darkMode ? '#fff' : 'inherit',
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.23)',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
              },
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit',
            },
            '& .MuiSelect-icon': {
              color: darkMode ? 'rgba(255,255,255,0.5)' : 'inherit',
            },
          }}
        >
          {getStepContent(activeStep)}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mt: 3,
            mb: 1, // Add bottom margin
          }}>
            {activeStep !== 0 && (
              <Button 
                onClick={handleBack} 
                sx={{ 
                  mr: 1,
                  color: darkMode ? 'rgba(255,255,255,0.8)' : 'inherit'
                }}
              >
                Back
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!validateBasicInfo() || loading}
                sx={{
                  bgcolor: darkMode ? '#6366f1' : 'primary.main',
                  '&:hover': {
                    bgcolor: darkMode ? '#4f46e5' : 'primary.dark',
                  },
                  px: 3, // Wider button
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Relationship'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isNextButtonDisabled()}
                sx={{
                  bgcolor: darkMode ? '#6366f1' : 'primary.main',
                  '&:hover': {
                    bgcolor: darkMode ? '#4f46e5' : 'primary.dark',
                  },
                  px: 3, // Wider button
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewRelationship;