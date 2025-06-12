// frontend/src/components/NewRelationship.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Avatar,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import PersonIcon from "@mui/icons-material/Person";
import { useGlobal } from "../contexts/GlobalContext";
import { relationshipService } from "../services/api";
import { processImageFile } from "../utils/imageCompression"; // Import our compression utility

// Fixed relationship types
const RELATIONSHIP_TYPES = [
  { label: "Romantic", value: "romantic" },
  { label: "Friendship", value: "friendship" },
  { label: "Professional", value: "professional" },
  { label: "Family", value: "family" },
  { label: "Mentor", value: "mentor" },
  { label: "Other", value: "other" },
];

// Styled components (keeping the same as before)
const PageContainer = styled(Box)({
  backgroundColor: "var(--primary-bg)",
  minHeight: "100vh",
  color: "var(--text-primary)",
  padding: 0,
  width: "100%",
});

const HeaderContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "20px",
  position: "relative",
  "@media (max-width: 768px)": {
    padding: "16px",
  },
});

const BackButton = styled(IconButton)({
  color: "var(--text-primary)",
  marginRight: "12px",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

const HeaderTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "24px",
  lineHeight: "32px",
  color: "var(--text-primary)",
  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "28px",
  },
});

const FormContainer = styled(Container)({
  maxWidth: "500px",
  padding: "0 20px",
  "@media (max-width: 768px)": {
    padding: "0 16px",
  },
});

const PhotoSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "40px",
  "@media (max-width: 768px)": {
    marginBottom: "32px",
  },
});

const PhotoContainer = styled(Box)({
  position: "relative",
  marginBottom: "16px",
});

const ProfileAvatar = styled(Avatar)({
  width: "120px",
  height: "120px",
  backgroundColor: "rgba(54, 110, 255, 0.2)",
  border: "3px solid rgba(255, 255, 255, 0.1)",
  "@media (max-width: 768px)": {
    width: "100px",
    height: "100px",
  },
});

const PhotoUploadButton = styled(IconButton)({
  position: "absolute",
  bottom: "0px",
  right: "0px",
  backgroundColor: "#366EFF",
  color: "#FFFFFF",
  width: "36px",
  height: "36px",
  border: "3px solid var(--primary-bg)",
  "&:hover": {
    backgroundColor: "#2557E5",
    transform: "scale(1.05)",
  },
  transition: "all 0.2s ease",
  "@media (max-width: 768px)": {
    width: "32px",
    height: "32px",
  },
});

const PhotoText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontSize: "14px",
  color: "rgba(255, 255, 255, 0.7)",
  textAlign: "center",
});

const FormSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  marginBottom: "40px",
});

const FieldContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const FieldLabel = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "16px",
  color: "var(--text-primary)",
  marginBottom: "4px",
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    height: "50px",
    fontSize: "16px",
    fontFamily: "var(--font-family-secondary)",
    color: "var(--text-primary)",
    "& fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    "&:hover fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.3)",
    },
    "&.Mui-focused fieldset": {
      border: "2px solid #366EFF",
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "12px 16px",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
      opacity: 1,
    },
  },
  "& .MuiInputLabel-root": {
    display: "none",
  },
});

const StyledSelect = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    height: "50px",
    fontSize: "16px",
    fontFamily: "var(--font-family-secondary)",
    color: "var(--text-primary)",
    "& fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    "&:hover fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.3)",
    },
    "&.Mui-focused fieldset": {
      border: "2px solid #366EFF",
    },
  },
  "& .MuiSelect-select": {
    padding: "12px 16px",
  },
  "& .MuiInputLabel-root": {
    display: "none",
  },
  "& .MuiSvgIcon-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
});

const ButtonContainer = styled(Box)({
  display: "flex",
  gap: "16px",
  paddingTop: "20px",
  paddingBottom: "40px",
});

const BackButtonStyled = styled(Button)({
  flex: 1,
  height: "52px",
  backgroundColor: "transparent",
  border: "1.5px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "16px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1.5px solid rgba(255, 255, 255, 0.5)",
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "rgba(255, 255, 255, 0.3)",
    border: "1.5px solid rgba(255, 255, 255, 0.1)",
  },
  transition: "all 0.3s ease",
});

const NextButton = styled(Button)({
  flex: 2,
  height: "52px",
  background: "linear-gradient(135deg, #366EFF 0%, #4E7FFF 100%)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "16px",
  textTransform: "none",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  "&:hover": {
    background: "linear-gradient(135deg, #2557E5 0%, #366EFF 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(54, 110, 255, 0.4)",
  },
  "&:disabled": {
    background: "rgba(54, 110, 255, 0.3)",
    color: "rgba(255, 255, 255, 0.5)",
    transform: "none",
    boxShadow: "none",
  },
  transition: "all 0.3s ease",
});

const HiddenFileInput = styled("input")({
  display: "none",
});

const NewRelationship = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { state, actions } = useGlobal();

  const [formData, setFormData] = useState({
    contactName: "",
    relationshipType: "",
    photoUrl: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false); // New state for image compression
  const fileInputRef = useRef();

  // Fill name from selected contact
  useEffect(() => {
    if (state.selectedContact?.name) {
      setFormData((prev) => ({
        ...prev,
        contactName: state.selectedContact.name,
      }));
    }
  }, [state.selectedContact]);

  // Fill form data from global state
  useEffect(() => {
    if (state.formData) {
      setFormData((prev) => ({
        ...prev,
        ...state.formData,
      }));
    }
  }, [state.formData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // UPDATED: Enhanced photo handling with compression
  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageProcessing(true);
    setError("");

    try {
      console.log(
        `Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      );

      // Process and compress the image
      const compressedBase64 = await processImageFile(file);

      console.log(
        `Compressed size: ${(
          (compressedBase64.length * 0.75) /
          1024 /
          1024
        ).toFixed(2)}MB`
      );

      setFormData((prev) => ({
        ...prev,
        photoUrl: compressedBase64,
      }));
    } catch (err) {
      console.error("Image processing error:", err);
      setError(
        err.message || "Failed to process image. Please try a different image."
      );
    } finally {
      setImageProcessing(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.contactName.trim()) {
      setError("Please enter a name");
      return;
    }

    if (!formData.relationshipType) {
      setError("Please select a relationship type");
      return;
    }

    if (imageProcessing) {
      setError("Please wait for image processing to complete");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create relationship data for API
      const relationshipData = {
        contactName: formData.contactName.trim(),
        relationshipType: formData.relationshipType,
        photoUrl: formData.photoUrl, // Send compressed base64
      };

      console.log("Creating relationship with data:", {
        ...relationshipData,
        photoUrl: relationshipData.photoUrl
          ? "Compressed image included"
          : null,
      });

      // Call the backend API
      const response = await relationshipService.create(relationshipData);

      console.log("Relationship created successfully:", response.data);

      // Update global state with the new relationship from backend
      if (actions.addRelationship) {
        actions.addRelationship(response.data);
      }

      // Refresh relationships list if available
      if (actions.fetchRelationships) {
        await actions.fetchRelationships();
      }

      // Reset form
      setFormData({
        contactName: "",
        relationshipType: "",
        photoUrl: null,
      });

      // Clear selected contact from global state
      if (actions.clearSelectedContact) {
        actions.clearSelectedContact();
      }

      // Navigate to the new relationship's profile or dashboard
      const relationshipId = response.data.id || response.data._id;
      if (relationshipId) {
        navigate(`/relationship-circle/${relationshipId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error creating relationship:", err);

      // Handle specific error messages from backend
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to create relationship. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isFormValid =
    formData.contactName.trim() &&
    formData.relationshipType &&
    !loading &&
    !imageProcessing; // Also check image processing state

  return (
    <PageContainer>
      <HeaderContainer>
        <BackButton onClick={handleBack} disabled={loading || imageProcessing}>
          <ArrowBackIcon />
        </BackButton>
        <HeaderTitle>New Relationship</HeaderTitle>
      </HeaderContainer>

      <FormContainer>
        {/* Photo Section */}
        <PhotoSection>
          <PhotoContainer>
            <ProfileAvatar src={formData.photoUrl}>
              {!formData.photoUrl &&
                (formData.contactName ? (
                  getInitials(formData.contactName)
                ) : (
                  <PersonIcon sx={{ fontSize: 40 }} />
                ))}
            </ProfileAvatar>
            <PhotoUploadButton
              onClick={handlePhotoClick}
              disabled={loading || imageProcessing}
            >
              {imageProcessing ? (
                <CircularProgress size={isMobile ? 16 : 18} color="inherit" />
              ) : (
                <AddAPhotoIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
              )}
            </PhotoUploadButton>
          </PhotoContainer>
          <PhotoText>
            {imageProcessing ? "Processing image..." : "Add photo (optional)"}
          </PhotoText>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={loading || imageProcessing}
          />
        </PhotoSection>

        {/* Form Section */}
        <FormSection>
          <FieldContainer>
            <FieldLabel>Name *</FieldLabel>
            <StyledTextField
              placeholder="Enter person's name"
              value={formData.contactName}
              onChange={(e) => handleInputChange("contactName", e.target.value)}
              variant="outlined"
              fullWidth
              disabled={loading || imageProcessing}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Relationship Type *</FieldLabel>
            <StyledSelect
              select
              value={formData.relationshipType}
              onChange={(e) =>
                handleInputChange("relationshipType", e.target.value)
              }
              placeholder="Select relationship type"
              variant="outlined"
              fullWidth
              disabled={loading || imageProcessing}
            >
              {RELATIONSHIP_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </StyledSelect>
          </FieldContainer>
        </FormSection>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              marginBottom: "20px",
              backgroundColor: "var(--alert-error-bg)",
              color: "var(--alert-error-text)",
              "& .MuiAlert-icon": {
                color: "var(--alert-error-text)",
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Buttons */}
        <ButtonContainer>
          <BackButtonStyled
            onClick={handleBack}
            disabled={loading || imageProcessing}
          >
            Back
          </BackButtonStyled>
          <NextButton onClick={handleSubmit} disabled={!isFormValid}>
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" />
                Creating...
              </>
            ) : imageProcessing ? (
              <>
                <CircularProgress size={20} color="inherit" />
                Processing...
              </>
            ) : (
              "Create Relationship"
            )}
          </NextButton>
        </ButtonContainer>
      </FormContainer>
    </PageContainer>
  );
};

export default NewRelationship;
