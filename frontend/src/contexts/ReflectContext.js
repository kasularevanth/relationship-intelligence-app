// frontend/src/contexts/ReflectContext.js
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

// Initial state for Reflect functionality
const initialState = {
  // Pagination state
  currentPage: 0,
  itemsPerPage: {
    mobile: 9, // 3x3 grid
    desktop: 6, // 2x3 grid
  },

  // UI state
  isLoading: false,
  error: null,

  // Selected relationships for reflection
  selectedRelationships: [],

  // Current reflection session
  currentReflectionSession: null,

  // Voice/Audio state
  isVoiceActive: false,
  isRecording: false,

  // Navigation state
  lastVisitedPage: null,

  // Filter and sort preferences
  sortBy: "lastInteraction", // 'lastInteraction', 'name', 'relationshipType'
  sortOrder: "desc", // 'asc', 'desc'
  filterByType: "all", // 'all', 'romantic', 'family', 'friend', 'professional'

  // User preferences
  preferences: {
    autoAdvancePage: true,
    showTimestamps: true,
    voiceActivation: false,
    animationsEnabled: true,
  },
};

// Action types
const actionTypes = {
  // Pagination actions
  SET_CURRENT_PAGE: "SET_CURRENT_PAGE",
  NEXT_PAGE: "NEXT_PAGE",
  PREVIOUS_PAGE: "PREVIOUS_PAGE",

  // UI actions
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  // Selection actions
  SELECT_RELATIONSHIP: "SELECT_RELATIONSHIP",
  DESELECT_RELATIONSHIP: "DESELECT_RELATIONSHIP",
  CLEAR_SELECTION: "CLEAR_SELECTION",

  // Reflection session actions
  START_REFLECTION_SESSION: "START_REFLECTION_SESSION",
  END_REFLECTION_SESSION: "END_REFLECTION_SESSION",
  UPDATE_REFLECTION_SESSION: "UPDATE_REFLECTION_SESSION",

  // Voice actions
  START_VOICE: "START_VOICE",
  STOP_VOICE: "STOP_VOICE",
  START_RECORDING: "START_RECORDING",
  STOP_RECORDING: "STOP_RECORDING",

  // Navigation actions
  SET_LAST_VISITED_PAGE: "SET_LAST_VISITED_PAGE",

  // Filter and sort actions
  SET_SORT_BY: "SET_SORT_BY",
  SET_SORT_ORDER: "SET_SORT_ORDER",
  SET_FILTER_BY_TYPE: "SET_FILTER_BY_TYPE",

  // Preference actions
  UPDATE_PREFERENCES: "UPDATE_PREFERENCES",
  RESET_PREFERENCES: "RESET_PREFERENCES",
};

// Reducer function
const reflectReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload,
      };

    case actionTypes.NEXT_PAGE:
      return {
        ...state,
        currentPage: state.currentPage + 1,
      };

    case actionTypes.PREVIOUS_PAGE:
      return {
        ...state,
        currentPage: Math.max(0, state.currentPage - 1),
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case actionTypes.SELECT_RELATIONSHIP:
      return {
        ...state,
        selectedRelationships: [...state.selectedRelationships, action.payload],
      };

    case actionTypes.DESELECT_RELATIONSHIP:
      return {
        ...state,
        selectedRelationships: state.selectedRelationships.filter(
          (id) => id !== action.payload
        ),
      };

    case actionTypes.CLEAR_SELECTION:
      return {
        ...state,
        selectedRelationships: [],
      };

    case actionTypes.START_REFLECTION_SESSION:
      return {
        ...state,
        currentReflectionSession: {
          id: action.payload.id,
          relationshipId: action.payload.relationshipId,
          startTime: new Date(),
          type: action.payload.type, // 'voice', 'text', 'guided'
          data: action.payload.data || {},
        },
      };

    case actionTypes.END_REFLECTION_SESSION:
      return {
        ...state,
        currentReflectionSession: null,
        isVoiceActive: false,
        isRecording: false,
      };

    case actionTypes.UPDATE_REFLECTION_SESSION:
      return {
        ...state,
        currentReflectionSession: {
          ...state.currentReflectionSession,
          ...action.payload,
        },
      };

    case actionTypes.START_VOICE:
      return {
        ...state,
        isVoiceActive: true,
      };

    case actionTypes.STOP_VOICE:
      return {
        ...state,
        isVoiceActive: false,
        isRecording: false,
      };

    case actionTypes.START_RECORDING:
      return {
        ...state,
        isRecording: true,
        isVoiceActive: true,
      };

    case actionTypes.STOP_RECORDING:
      return {
        ...state,
        isRecording: false,
      };

    case actionTypes.SET_LAST_VISITED_PAGE:
      return {
        ...state,
        lastVisitedPage: action.payload,
      };

    case actionTypes.SET_SORT_BY:
      return {
        ...state,
        sortBy: action.payload,
      };

    case actionTypes.SET_SORT_ORDER:
      return {
        ...state,
        sortOrder: action.payload,
      };

    case actionTypes.SET_FILTER_BY_TYPE:
      return {
        ...state,
        filterByType: action.payload,
        currentPage: 0, // Reset to first page when filtering
      };

    case actionTypes.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    case actionTypes.RESET_PREFERENCES:
      return {
        ...state,
        preferences: initialState.preferences,
      };

    default:
      return state;
  }
};

// Create contexts
const ReflectContext = createContext();
const ReflectDispatchContext = createContext();

// Provider component
export const ReflectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reflectReducer, initialState);

  return (
    <ReflectContext.Provider value={state}>
      <ReflectDispatchContext.Provider value={dispatch}>
        {children}
      </ReflectDispatchContext.Provider>
    </ReflectContext.Provider>
  );
};

// Custom hooks for using the context
export const useReflect = () => {
  const context = useContext(ReflectContext);
  if (!context) {
    throw new Error("useReflect must be used within a ReflectProvider");
  }
  return context;
};

export const useReflectDispatch = () => {
  const context = useContext(ReflectDispatchContext);
  if (!context) {
    throw new Error("useReflectDispatch must be used within a ReflectProvider");
  }
  return context;
};

// Action creators
export const useReflectActions = () => {
  const dispatch = useReflectDispatch();

  return {
    // Pagination actions
    setCurrentPage: useCallback(
      (page) => {
        dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page });
      },
      [dispatch]
    ),

    nextPage: useCallback(() => {
      dispatch({ type: actionTypes.NEXT_PAGE });
    }, [dispatch]),

    previousPage: useCallback(() => {
      dispatch({ type: actionTypes.PREVIOUS_PAGE });
    }, [dispatch]),

    // UI actions
    setLoading: useCallback(
      (loading) => {
        dispatch({ type: actionTypes.SET_LOADING, payload: loading });
      },
      [dispatch]
    ),

    setError: useCallback(
      (error) => {
        dispatch({ type: actionTypes.SET_ERROR, payload: error });
      },
      [dispatch]
    ),

    clearError: useCallback(() => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    }, [dispatch]),

    // Selection actions
    selectRelationship: useCallback(
      (relationshipId) => {
        dispatch({
          type: actionTypes.SELECT_RELATIONSHIP,
          payload: relationshipId,
        });
      },
      [dispatch]
    ),

    deselectRelationship: useCallback(
      (relationshipId) => {
        dispatch({
          type: actionTypes.DESELECT_RELATIONSHIP,
          payload: relationshipId,
        });
      },
      [dispatch]
    ),

    clearSelection: useCallback(() => {
      dispatch({ type: actionTypes.CLEAR_SELECTION });
    }, [dispatch]),

    // Reflection session actions
    startReflectionSession: useCallback(
      (sessionData) => {
        dispatch({
          type: actionTypes.START_REFLECTION_SESSION,
          payload: sessionData,
        });
      },
      [dispatch]
    ),

    endReflectionSession: useCallback(() => {
      dispatch({ type: actionTypes.END_REFLECTION_SESSION });
    }, [dispatch]),

    updateReflectionSession: useCallback(
      (updates) => {
        dispatch({
          type: actionTypes.UPDATE_REFLECTION_SESSION,
          payload: updates,
        });
      },
      [dispatch]
    ),

    // Voice actions
    startVoice: useCallback(() => {
      dispatch({ type: actionTypes.START_VOICE });
    }, [dispatch]),

    stopVoice: useCallback(() => {
      dispatch({ type: actionTypes.STOP_VOICE });
    }, [dispatch]),

    startRecording: useCallback(() => {
      dispatch({ type: actionTypes.START_RECORDING });
    }, [dispatch]),

    stopRecording: useCallback(() => {
      dispatch({ type: actionTypes.STOP_RECORDING });
    }, [dispatch]),

    // Navigation actions
    setLastVisitedPage: useCallback(
      (page) => {
        dispatch({ type: actionTypes.SET_LAST_VISITED_PAGE, payload: page });
      },
      [dispatch]
    ),

    // Filter and sort actions
    setSortBy: useCallback(
      (sortBy) => {
        dispatch({ type: actionTypes.SET_SORT_BY, payload: sortBy });
      },
      [dispatch]
    ),

    setSortOrder: useCallback(
      (sortOrder) => {
        dispatch({ type: actionTypes.SET_SORT_ORDER, payload: sortOrder });
      },
      [dispatch]
    ),

    setFilterByType: useCallback(
      (filterType) => {
        dispatch({ type: actionTypes.SET_FILTER_BY_TYPE, payload: filterType });
      },
      [dispatch]
    ),

    // Preference actions
    updatePreferences: useCallback(
      (preferences) => {
        dispatch({
          type: actionTypes.UPDATE_PREFERENCES,
          payload: preferences,
        });
      },
      [dispatch]
    ),

    resetPreferences: useCallback(() => {
      dispatch({ type: actionTypes.RESET_PREFERENCES });
    }, [dispatch]),
  };
};

// Combined hook for easier usage
export const useReflectState = () => {
  const state = useReflect();
  const actions = useReflectActions();

  return { state, actions };
};
