// frontend/src/contexts/GlobalContext.js
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

// Initial state
const initialState = {
  // Relationships
  relationships: [],

  // Contact system
  contactPermissionGranted: false,
  contactList: [],
  selectedContact: null,

  // Form data
  formData: {
    contactName: "",
    relationshipType: "",
    photoUrl: null,
  },

  // Modal states
  showContactPermission: false,
  showContactSelector: false,
  showDemoChat: false,
  showDemoAnalysis: false,

  // UI states
  loading: false,
  error: null,

  // Sidebar states (new)
  sidebarExpanded: false,
  sidebarHovered: false,
  sidebarPersistent: true, // For desktop persistent sidebar
};

// Action types
const actionTypes = {
  // Relationships
  ADD_RELATIONSHIP: "ADD_RELATIONSHIP",
  UPDATE_RELATIONSHIP: "UPDATE_RELATIONSHIP",
  DELETE_RELATIONSHIP: "DELETE_RELATIONSHIP",
  SET_RELATIONSHIPS: "SET_RELATIONSHIPS",

  // Contact system
  SET_CONTACT_PERMISSION: "SET_CONTACT_PERMISSION",
  SET_CONTACT_LIST: "SET_CONTACT_LIST",
  SET_SELECTED_CONTACT: "SET_SELECTED_CONTACT",
  CLEAR_SELECTED_CONTACT: "CLEAR_SELECTED_CONTACT",

  // Form data
  SET_FORM_DATA: "SET_FORM_DATA",
  UPDATE_FORM_DATA: "UPDATE_FORM_DATA",
  RESET_FORM_DATA: "RESET_FORM_DATA",

  // Modal controls
  SHOW_CONTACT_PERMISSION: "SHOW_CONTACT_PERMISSION",
  SHOW_CONTACT_SELECTOR: "SHOW_CONTACT_SELECTOR",
  SHOW_DEMO_CHAT: "SHOW_DEMO_CHAT",
  SHOW_DEMO_ANALYSIS: "SHOW_DEMO_ANALYSIS",
  HIDE_ALL_MODALS: "HIDE_ALL_MODALS",

  // UI states
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  // Sidebar controls (new)
  SET_SIDEBAR_EXPANDED: "SET_SIDEBAR_EXPANDED",
  SET_SIDEBAR_HOVERED: "SET_SIDEBAR_HOVERED",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  SET_SIDEBAR_PERSISTENT: "SET_SIDEBAR_PERSISTENT",
};

// Reducer
const globalReducer = (state, action) => {
  switch (action.type) {
    // Relationships
    case actionTypes.ADD_RELATIONSHIP:
      return {
        ...state,
        relationships: [...state.relationships, action.payload],
      };

    case actionTypes.UPDATE_RELATIONSHIP:
      return {
        ...state,
        relationships: state.relationships.map((rel) =>
          (rel.id || rel._id) === action.payload.id
            ? { ...rel, ...action.payload.data }
            : rel
        ),
      };

    case actionTypes.DELETE_RELATIONSHIP:
      return {
        ...state,
        relationships: state.relationships.filter(
          (rel) => (rel.id || rel._id) !== action.payload
        ),
      };

    case actionTypes.SET_RELATIONSHIPS:
      return {
        ...state,
        relationships: action.payload,
      };

    // Contact system
    case actionTypes.SET_CONTACT_PERMISSION:
      return {
        ...state,
        contactPermissionGranted: action.payload,
      };

    case actionTypes.SET_CONTACT_LIST:
      return {
        ...state,
        contactList: action.payload,
      };

    case actionTypes.SET_SELECTED_CONTACT:
      return {
        ...state,
        selectedContact: action.payload,
      };

    case actionTypes.CLEAR_SELECTED_CONTACT:
      return {
        ...state,
        selectedContact: null,
      };

    // Form data
    case actionTypes.SET_FORM_DATA:
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case actionTypes.UPDATE_FORM_DATA:
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case actionTypes.RESET_FORM_DATA:
      return {
        ...state,
        formData: {
          contactName: "",
          relationshipType: "",
          photoUrl: null,
        },
        selectedContact: null,
      };

    // Modal controls
    case actionTypes.SHOW_CONTACT_PERMISSION:
      return {
        ...state,
        showContactPermission: true,
        showContactSelector: false,
        showDemoChat: false,
        showDemoAnalysis: false,
      };

    case actionTypes.SHOW_CONTACT_SELECTOR:
      return {
        ...state,
        showContactPermission: false,
        showContactSelector: true,
        showDemoChat: false,
        showDemoAnalysis: false,
      };

    case actionTypes.SHOW_DEMO_CHAT:
      return {
        ...state,
        showContactPermission: false,
        showContactSelector: false,
        showDemoChat: true,
        showDemoAnalysis: false,
      };

    case actionTypes.SHOW_DEMO_ANALYSIS:
      return {
        ...state,
        showContactPermission: false,
        showContactSelector: false,
        showDemoChat: false,
        showDemoAnalysis: true,
      };

    case actionTypes.HIDE_ALL_MODALS:
      return {
        ...state,
        showContactPermission: false,
        showContactSelector: false,
        showDemoChat: false,
        showDemoAnalysis: false,
      };

    // UI states
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    // Sidebar controls (new)
    case actionTypes.SET_SIDEBAR_EXPANDED:
      return {
        ...state,
        sidebarExpanded: action.payload,
      };

    case actionTypes.SET_SIDEBAR_HOVERED:
      return {
        ...state,
        sidebarHovered: action.payload,
      };

    case actionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarExpanded: !state.sidebarExpanded,
      };

    case actionTypes.SET_SIDEBAR_PERSISTENT:
      return {
        ...state,
        sidebarPersistent: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const GlobalContext = createContext();

// Provider component
export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Action creators
  const actions = {
    // Relationships
    addRelationship: useCallback((relationship) => {
      dispatch({ type: actionTypes.ADD_RELATIONSHIP, payload: relationship });
    }, []),

    updateRelationship: useCallback((id, data) => {
      dispatch({
        type: actionTypes.UPDATE_RELATIONSHIP,
        payload: { id, data },
      });
    }, []),

    deleteRelationship: useCallback((id) => {
      dispatch({ type: actionTypes.DELETE_RELATIONSHIP, payload: id });
    }, []),

    setRelationships: useCallback((relationships) => {
      dispatch({ type: actionTypes.SET_RELATIONSHIPS, payload: relationships });
    }, []),

    // Contact system
    setContactPermission: useCallback((granted) => {
      dispatch({ type: actionTypes.SET_CONTACT_PERMISSION, payload: granted });
    }, []),

    setContactList: useCallback((contacts) => {
      dispatch({ type: actionTypes.SET_CONTACT_LIST, payload: contacts });
    }, []),

    setSelectedContact: useCallback((contact) => {
      dispatch({ type: actionTypes.SET_SELECTED_CONTACT, payload: contact });
    }, []),

    clearSelectedContact: useCallback(() => {
      dispatch({ type: actionTypes.CLEAR_SELECTED_CONTACT });
    }, []),

    // Form data
    setFormData: useCallback((data) => {
      dispatch({ type: actionTypes.SET_FORM_DATA, payload: data });
    }, []),

    updateFormData: useCallback((data) => {
      dispatch({ type: actionTypes.UPDATE_FORM_DATA, payload: data });
    }, []),

    resetFormData: useCallback(() => {
      dispatch({ type: actionTypes.RESET_FORM_DATA });
    }, []),

    // Modal controls
    showContactPermission: useCallback(() => {
      dispatch({ type: actionTypes.SHOW_CONTACT_PERMISSION });
    }, []),

    showContactSelector: useCallback(() => {
      dispatch({ type: actionTypes.SHOW_CONTACT_SELECTOR });
    }, []),

    showDemoChat: useCallback(() => {
      dispatch({ type: actionTypes.SHOW_DEMO_CHAT });
    }, []),

    showDemoAnalysis: useCallback(() => {
      dispatch({ type: actionTypes.SHOW_DEMO_ANALYSIS });
    }, []),

    hideAllModals: useCallback(() => {
      dispatch({ type: actionTypes.HIDE_ALL_MODALS });
    }, []),

    // UI states
    setLoading: useCallback((loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    }, []),

    // Sidebar controls (new)
    setSidebarExpanded: useCallback((expanded) => {
      dispatch({ type: actionTypes.SET_SIDEBAR_EXPANDED, payload: expanded });
    }, []),

    setSidebarHovered: useCallback((hovered) => {
      dispatch({ type: actionTypes.SET_SIDEBAR_HOVERED, payload: hovered });
    }, []),

    toggleSidebar: useCallback(() => {
      dispatch({ type: actionTypes.TOGGLE_SIDEBAR });
    }, []),

    setSidebarPersistent: useCallback((persistent) => {
      dispatch({
        type: actionTypes.SET_SIDEBAR_PERSISTENT,
        payload: persistent,
      });
    }, []),
  };

  // Enhanced actions for complex operations
  const enhancedActions = {
    ...actions,

    // Create relationship with photo handling
    createRelationshipWithPhoto: useCallback(
      async (relationshipData, photoFile) => {
        try {
          actions.setLoading(true);
          actions.clearError();

          let photoUrl = null;

          // Handle photo upload if provided
          if (photoFile) {
            // In a real app, you'd upload to a server/cloud storage
            // For now, we'll use a local object URL
            photoUrl = URL.createObjectURL(photoFile);
          }

          const newRelationship = {
            ...relationshipData,
            id: Date.now().toString(),
            photoUrl,
            createdAt: new Date().toISOString(),
            lastInteraction: new Date().toISOString(),
          };

          actions.addRelationship(newRelationship);
          actions.resetFormData();

          return newRelationship;
        } catch (error) {
          actions.setError(error.message);
          throw error;
        } finally {
          actions.setLoading(false);
        }
      },
      [actions]
    ),

    // Handle contact selection and navigation
    handleContactSelection: useCallback(
      (contact, navigate) => {
        actions.setSelectedContact(contact);
        actions.setFormData({
          contactName: contact.name,
          relationshipType: "",
        });
        actions.hideAllModals();
        navigate("/new-relationship");
      },
      [actions]
    ),

    // Initialize contact access flow
    initiateContactAccess: useCallback(
      (isMobile) => {
        const isMobileDevice =
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        if (
          isMobile &&
          isMobileDevice &&
          "contacts" in navigator &&
          "ContactsManager" in window
        ) {
          actions.showContactPermission();
        } else {
          // Show appropriate message for desktop or unsupported browsers
          const message = isMobile
            ? "Contact access is only available on mobile devices with supported browsers."
            : "Contact access is not available on desktop. Please use 'Manually enter Name' option.";

          actions.setError(message);
          setTimeout(() => actions.clearError(), 3000);
        }
      },
      [actions]
    ),

    // Enhanced sidebar management
    handleSidebarInteraction: useCallback(
      (action, isMobile = false) => {
        if (isMobile) {
          // Mobile: Use traditional toggle behavior
          if (action === "toggle") {
            actions.toggleSidebar();
          }
        } else {
          // Desktop: Use hover-based expansion
          switch (action) {
            case "hover_enter":
              actions.setSidebarHovered(true);
              actions.setSidebarExpanded(true);
              break;
            case "hover_leave":
              actions.setSidebarHovered(false);
              actions.setSidebarExpanded(false);
              break;
            case "click_toggle":
              // Optional: Allow clicking to pin/unpin sidebar
              actions.toggleSidebar();
              break;
            default:
              break;
          }
        }
      },
      [actions]
    ),

    // Initialize sidebar based on screen size
    initializeSidebar: useCallback(
      (isMobile) => {
        actions.setSidebarPersistent(!isMobile);
        if (isMobile) {
          actions.setSidebarExpanded(false);
          actions.setSidebarHovered(false);
        }
      },
      [actions]
    ),
  };

  const contextValue = {
    state,
    actions: enhancedActions,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the context
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};

export default GlobalContext;
