// frontend/src/utils/navigationUtils.js

import { questionService, relationshipService } from "../services/api";

/**
 * Navigation utilities for the voice question flow
 */

/**
 * Check if a relationship has uploaded conversations
 * @param {string} relationshipId
 * @returns {Promise<boolean>}
 */
export const checkRelationshipHasConversations = async (relationshipId) => {
  try {
    const response =
      await relationshipService.checkIfRelationshipHasConversations(
        relationshipId
      );
    return response;
  } catch (error) {
    console.error("Error checking conversations:", error);
    return false;
  }
};

/**
 * Get the appropriate navigation path based on relationship state
 * @param {string} relationshipId
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export const getVoiceQuestionPath = async (relationshipId, options = {}) => {
  const { fromImport = false, importProgress = 0, forceMode = null } = options;

  try {
    // Check if relationship has conversations
    const hasConversations = await checkRelationshipHasConversations(
      relationshipId
    );

    // Determine the appropriate path and query parameters
    const basePath = `/relationships/${relationshipId}/voice-question`;
    const queryParams = new URLSearchParams();

    // Add import progress if coming from import
    if (fromImport || importProgress > 0) {
      queryParams.set("progress", importProgress.toString());
      queryParams.set("importing", (importProgress < 100).toString());
    }

    // Add mode override if specified
    if (forceMode) {
      queryParams.set("mode", forceMode);
    }

    // Add conversation status
    queryParams.set("hasConversations", hasConversations.toString());

    const fullPath = queryParams.toString()
      ? `${basePath}?${queryParams.toString()}`
      : basePath;

    return {
      path: fullPath,
      hasConversations,
      shouldShowQuestions: !hasConversations,
      importProgress,
      isImporting: importProgress > 0 && importProgress < 100,
    };
  } catch (error) {
    console.error("Error determining voice question path:", error);
    return {
      path: `/relationships/${relationshipId}/voice-question`,
      hasConversations: false,
      shouldShowQuestions: true,
      importProgress: 0,
      isImporting: false,
    };
  }
};

/**
 * Handle navigation to voice question page from different entry points
 * @param {Function} navigate - React Router navigate function
 * @param {string} relationshipId
 * @param {Object} options
 */
export const navigateToVoiceQuestion = async (
  navigate,
  relationshipId,
  options = {}
) => {
  const pathInfo = await getVoiceQuestionPath(relationshipId, options);
  navigate(pathInfo.path);
  return pathInfo;
};

/**
 * Handle navigation based on import status
 * @param {Function} navigate
 * @param {string} relationshipId
 * @param {number} progress
 */
export const handleImportNavigation = async (
  navigate,
  relationshipId,
  progress
) => {
  if (progress >= 100) {
    // Import complete - go to analysis
    navigate(`/relationships/${relationshipId}/analysis`);
  } else {
    // Import in progress - go to voice question with progress
    await navigateToVoiceQuestion(navigate, relationshipId, {
      fromImport: true,
      importProgress: progress,
    });
  }
};

/**
 * Get structured questions for a relationship
 * @param {string} relationshipId
 * @returns {Promise<Array>}
 */
export const getStructuredQuestions = async (relationshipId) => {
  try {
    const response = await questionService.getStructuredQuestions(
      relationshipId
    );
    if (response.data.success) {
      return response.data.questions;
    }
    return getDefaultStructuredQuestions();
  } catch (error) {
    console.error("Error fetching structured questions:", error);
    return getDefaultStructuredQuestions();
  }
};

/**
 * Default structured questions if backend doesn't provide them
 * @param {string} contactName
 * @returns {Array}
 */
export const getDefaultStructuredQuestions = (contactName = "them") => {
  return [
    `How do you know ${contactName}, and how long have you known them?`,
    `How would you describe your relationship with them right now?`,
    `How often do you talk or see each other, and how do you usually communicate?`,
    `What do you appreciate most about them?`,
    `What's something they do that bothers or frustrates you?`,
    `If they had to describe you, what do you think they'd say?`,
    `What's one thing you wish they understood about you?`,
  ];
};

/**
 * Save current question progress to localStorage
 * @param {string} relationshipId
 * @param {Object} progress
 */
export const saveQuestionProgress = (relationshipId, progress) => {
  try {
    const key = `voice_question_progress_${relationshipId}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        ...progress,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Error saving question progress:", error);
  }
};

/**
 * Load question progress from localStorage
 * @param {string} relationshipId
 * @returns {Object|null}
 */
export const loadQuestionProgress = (relationshipId) => {
  try {
    const key = `voice_question_progress_${relationshipId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const progress = JSON.parse(saved);
      // Check if progress is less than 24 hours old
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - progress.timestamp < twentyFourHours) {
        return progress;
      }
      // Remove old progress
      localStorage.removeItem(key);
    }
    return null;
  } catch (error) {
    console.error("Error loading question progress:", error);
    return null;
  }
};

/**
 * Clear question progress from localStorage
 * @param {string} relationshipId
 */
export const clearQuestionProgress = (relationshipId) => {
  try {
    const key = `voice_question_progress_${relationshipId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing question progress:", error);
  }
};

/**
 * Check if user should be redirected to analysis page
 * @param {string} relationshipId
 * @returns {Promise<boolean>}
 */
export const shouldRedirectToAnalysis = async (relationshipId) => {
  try {
    const response = await questionService.getAnalysisStatus(relationshipId);
    return response.data.ready || false;
  } catch (error) {
    console.error("Error checking analysis status:", error);
    return false;
  }
};

/**
 * Handle completion of structured questions flow
 * @param {string} relationshipId
 * @returns {Promise<boolean>}
 */
export const completeStructuredQuestions = async (relationshipId) => {
  try {
    const response = await questionService.completeStructuredQuestions(
      relationshipId
    );
    if (response.data.success) {
      clearQuestionProgress(relationshipId);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error completing structured questions:", error);
    return false;
  }
};

/**
 * Get import progress from URL or localStorage
 * @param {URLSearchParams} searchParams
 * @param {string} relationshipId
 * @returns {Object}
 */
export const getImportProgressFromUrl = (searchParams, relationshipId) => {
  const urlProgress = searchParams.get("progress");
  const urlImporting = searchParams.get("importing");

  if (urlProgress) {
    return {
      progress: parseInt(urlProgress),
      isImporting: urlImporting === "true",
    };
  }

  // Fallback to localStorage for persistent progress
  const saved = loadQuestionProgress(relationshipId);
  if (saved && saved.importProgress !== undefined) {
    return {
      progress: saved.importProgress,
      isImporting: saved.importProgress < 100,
    };
  }

  return {
    progress: 0,
    isImporting: false,
  };
};

/**
 * Update import progress and save to localStorage
 * @param {string} relationshipId
 * @param {number} progress
 * @param {Function} setProgress
 * @param {Function} setIsImporting
 */
export const updateImportProgress = (
  relationshipId,
  progress,
  setProgress,
  setIsImporting
) => {
  setProgress(progress);
  setIsImporting(progress < 100);

  saveQuestionProgress(relationshipId, {
    importProgress: progress,
    isImporting: progress < 100,
  });

  // Update URL without causing navigation
  const url = new URL(window.location);
  url.searchParams.set("progress", progress.toString());
  url.searchParams.set("importing", (progress < 100).toString());
  window.history.replaceState({}, "", url);
};

/**
 * Handle reflect button click from import page
 * @param {Function} navigate
 * @param {string} relationshipId
 * @param {number} currentProgress
 */
export const handleReflectFromImport = async (
  navigate,
  relationshipId,
  currentProgress
) => {
  // Save current progress
  saveQuestionProgress(relationshipId, {
    importProgress: currentProgress,
    isImporting: currentProgress < 100,
    fromImport: true,
  });

  // Navigate to voice question page
  await navigateToVoiceQuestion(navigate, relationshipId, {
    fromImport: true,
    importProgress: currentProgress,
  });
};

/**
 * Poll for import completion and update progress
 * @param {string} relationshipId
 * @param {Function} onProgress
 * @param {Function} onComplete
 * @param {number} interval
 * @returns {Function} cleanup function
 */
export const pollImportProgress = (
  relationshipId,
  onProgress,
  onComplete,
  interval = 2000
) => {
  let timeoutId;
  let isPolling = true;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const response = await relationshipService.getImportStatus(
        relationshipId
      );
      if (response.data.success) {
        const progress = response.data.progress || 0;
        onProgress(progress);

        if (progress >= 100) {
          onComplete();
          isPolling = false;
          return;
        }
      }
    } catch (error) {
      console.error("Error polling import progress:", error);
    }

    if (isPolling) {
      timeoutId = setTimeout(poll, interval);
    }
  };

  // Start polling
  poll();

  // Return cleanup function
  return () => {
    isPolling = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};
