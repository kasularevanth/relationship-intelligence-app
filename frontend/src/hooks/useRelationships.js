// frontend/src/hooks/useRelationships.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { relationshipService } from "../services/api";

// Enhanced cache with loading state to prevent race conditions
let cachedData = {
  relationships: null,
  timestamp: null,
  isLoading: false, // NEW: Prevents multiple simultaneous requests
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Global promise to ensure only one request at a time
let fetchPromise = null;

export const useRelationships = () => {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if cache is valid
  const isCacheValid = () => {
    return (
      cachedData.relationships &&
      cachedData.timestamp &&
      Date.now() - cachedData.timestamp < cachedData.CACHE_DURATION
    );
  };

  // Enhanced fetch function with race condition prevention
  const fetchRelationships = useCallback(async (useCache = true) => {
    try {
      // Use cache if valid and requested
      if (useCache && isCacheValid()) {
        console.log("📋 Using cached relationships data");
        setRelationships(cachedData.relationships);
        setLoading(false);
        setError(null);
        return;
      }

      // If already fetching, wait for existing promise
      if (cachedData.isLoading && fetchPromise) {
        console.log("⏳ Waiting for existing fetch request");
        await fetchPromise;

        // After waiting, check cache again
        if (isCacheValid()) {
          setRelationships(cachedData.relationships);
          setLoading(false);
          setError(null);
          return;
        }
      }

      // Set loading state to prevent race conditions
      cachedData.isLoading = true;
      setLoading(true);
      setError(null);

      // Create the fetch promise
      fetchPromise = relationshipService.getAll();

      // Make API call
      const response = await fetchPromise;

      // Extract data from response
      const relationshipsData = response.data || response || [];

      // Ensure it's an array
      const validData = Array.isArray(relationshipsData)
        ? relationshipsData
        : [];

      // Update cache
      cachedData.relationships = validData;
      cachedData.timestamp = Date.now();
      cachedData.isLoading = false;

      // Clear the promise
      fetchPromise = null;

      // Update state
      setRelationships(validData);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching relationships:", err);

      // Reset loading state
      cachedData.isLoading = false;
      fetchPromise = null;

      // Try to use cached data as fallback
      if (cachedData.relationships) {
        console.log("🔄 Using cached data as fallback");
        setRelationships(cachedData.relationships);
      } else {
        setRelationships([]);
      }

      setLoading(false);
      setError(err);
    }
  }, []);

  // Process relationships with photos
  const processedRelationships = useMemo(() => {
    if (!relationships || !Array.isArray(relationships)) {
      return [];
    }

    const baseApiUrl =
      process.env.NODE_ENV === "production" ? "" : "http://localhost:5000";

    // const sampleImages = {
    //   test: "https://randomuser.me/api/portraits/men/32.jpg",
    //   vineeth: "https://randomuser.me/api/portraits/men/33.jpg",
    //   Revanth: "https://randomuser.me/api/portraits/men/34.jpg",
    //   "MASA MALLIK": "https://randomuser.me/api/portraits/men/35.jpg",
    //   divya: "https://randomuser.me/api/portraits/women/32.jpg",
    //   test1: "https://randomuser.me/api/portraits/women/33.jpg",
    // };

    return relationships.map((relationship) => {
      // Handle photo URL
      if (relationship.photo && relationship.photo.startsWith("/uploads")) {
        return {
          ...relationship,
          photoUrl: `${baseApiUrl}${relationship.photo}`,
        };
      }

      if (relationship.photoUrl) {
        return relationship;
      }

      // const photoUrl = sampleImages[relationship.contactName] || null;
      return { ...relationship };
    });
  }, [relationships]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalRelationships = processedRelationships.length;
    const totalConversations = processedRelationships.reduce(
      (acc, rel) => acc + (rel.conversations?.length || 0),
      0
    );
    const totalMessages = processedRelationships.reduce(
      (acc, rel) => acc + (rel.metrics?.totalMessages || 25),
      0
    );

    return {
      totalRelationships,
      totalConversations: totalConversations || totalRelationships * 2,
      totalMessages,
    };
  }, [processedRelationships]);

  // Get relationship types
  const relationshipTypes = useMemo(() => {
    if (!processedRelationships.length) return [];

    const uniqueTypes = [
      ...new Set(
        processedRelationships
          .map((rel) => rel.relationshipType || rel.type || rel.category)
          .filter(Boolean)
          .map((type) => type.toLowerCase().trim())
      ),
    ];

    return uniqueTypes;
  }, [processedRelationships]);

  // Filter by type
  const getRelationshipsByType = useCallback(
    (type) => {
      if (!processedRelationships.length) return [];
      if (type === "all") return processedRelationships;

      return processedRelationships.filter((rel) => {
        const relationshipType =
          rel.relationshipType || rel.type || rel.category;
        if (!relationshipType) return false;
        return (
          relationshipType.toLowerCase().trim() === type.toLowerCase().trim()
        );
      });
    },
    [processedRelationships]
  );

  // Search relationships
  const searchRelationships = useCallback(
    (query, type = "all") => {
      const filteredByType = getRelationshipsByType(type);

      if (!query.trim()) {
        return filteredByType;
      }

      return filteredByType.filter((relationship) =>
        relationship.contactName
          .toLowerCase()
          .includes(query.toLowerCase().trim())
      );
    },
    [getRelationshipsByType]
  );

  // Refresh function
  const refresh = useCallback(() => {
    // Clear cache and force fresh fetch
    cachedData.relationships = null;
    cachedData.timestamp = null;
    cachedData.isLoading = false;
    fetchPromise = null;
    fetchRelationships(false);
  }, [fetchRelationships]);

  // Initial load - Only fetch if not already cached or loading
  useEffect(() => {
    // Prevent effect from running multiple times in React Strict Mode
    if (isCacheValid()) {
      setRelationships(cachedData.relationships);
      setLoading(false);
      return;
    }

    if (cachedData.isLoading) {
      return;
    }

    fetchRelationships();
  }, [fetchRelationships]);

  return {
    relationships: processedRelationships,
    loading,
    error,
    statistics,
    relationshipTypes,
    getRelationshipsByType,
    searchRelationships,
    refresh,
    isCached: isCacheValid(),
  };
};

export default useRelationships;
