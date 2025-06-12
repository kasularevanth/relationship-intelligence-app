// src/utils/avatarUtils.js

/**
 * Utility functions for handling user and contact avatars
 * Consistent across the entire application
 */

/**
 * Get user initials from current user object
 * @param {Object} currentUser - The current user object
 * @returns {string} User initials (1-2 characters)
 */
export const getUserInitials = (currentUser) => {
  if (!currentUser) return "U";

  if (currentUser?.displayName) {
    return currentUser.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  } else if (currentUser?.name) {
    return currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  } else if (currentUser?.email) {
    return currentUser.email.charAt(0).toUpperCase();
  }
  return "U";
};

/**
 * Get user profile photo URL
 * @param {Object} currentUser - The current user object
 * @returns {string|null} Photo URL or null
 */
export const getUserPhoto = (currentUser) => {
  if (!currentUser) return null;
  return currentUser?.photoURL || currentUser?.avatar || null;
};

/**
 * Get contact/partner initials from name
 * @param {string} name - The contact's name
 * @returns {string} Contact initials (1-2 characters)
 */
export const getContactInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get contact/partner photo URL
 * @param {Object} relationship - The relationship object
 * @returns {string|null} Photo URL or null
 */
export const getContactPhoto = (relationship) => {
  if (!relationship) return null;
  return (
    relationship?.photoUrl ||
    relationship?.photo ||
    relationship?.contactAvatar ||
    null
  );
};

/**
 * Get the first name from a full name
 * @param {string} fullName - The full name
 * @returns {string} First name or "Friend" as fallback
 */
export const getFirstName = (fullName) => {
  return fullName ? fullName.split(" ")[0] : "Friend";
};

/**
 * Generate a consistent avatar color based on name or ID
 * @param {string} identifier - Name or ID to generate color from
 * @returns {string} Hex color code
 */
export const getAvatarColor = (identifier) => {
  if (!identifier) return "#4A90E2";

  const colors = [
    "#4A90E2", // Blue
    "#F5A623", // Orange
    "#7ED321", // Green
    "#D0021B", // Red
    "#9013FE", // Purple
    "#50E3C2", // Teal
    "#F8E71C", // Yellow
    "#BD10E0", // Magenta
  ];

  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Avatar data object for consistent usage
 * @param {Object} user - User object
 * @param {Object} relationship - Relationship object (optional)
 * @returns {Object} Avatar data with all necessary properties
 */
export const getAvatarData = (user, relationship = null) => {
  const userData = {
    photo: getUserPhoto(user),
    initials: getUserInitials(user),
    color: getAvatarColor(user?.email || user?.name || "user"),
  };

  if (relationship) {
    const contactData = {
      photo: getContactPhoto(relationship),
      initials: getContactInitials(relationship.contactName),
      color: getAvatarColor(relationship.contactName || relationship.id),
    };

    return {
      user: userData,
      contact: contactData,
      displayName: `You & ${getFirstName(relationship.contactName)}`,
    };
  }

  return {
    user: userData,
  };
};
