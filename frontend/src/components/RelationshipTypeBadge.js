// src/components/RelationshipTypeBadge.js
import React from "react";
import {
  Heart,
  Users,
  Briefcase,
  Home,
  GraduationCap,
  User,
} from "lucide-react";

const RelationshipTypeBadge = ({ type }) => {
  const getTypeConfig = (relationshipType) => {
    const normalizedType = relationshipType?.toLowerCase() || "";

    switch (normalizedType) {
      case "romantic":
      case "partner":
        return {
          label: "Romantic",
          icon: Heart,
          className: "romantic",
          gradient:
            "linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)",
        };

      case "friendship":
      case "friend":
        return {
          label: "Friends",
          icon: Users,
          className: "friends",
          gradient:
            "linear-gradient(275.48deg, #4C66E7 -5.24%, #A724DA 101.68%)",
        };

      case "professional":
      case "colleague":
      case "work":
        return {
          label: "Professional",
          icon: Briefcase,
          className: "professional",
          gradient:
            "linear-gradient(151.07deg, #FF806D 13.14%, #ED095F 85.75%)",
        };

      case "family":
        return {
          label: "Family",
          icon: Home,
          className: "family",
          gradient:
            "linear-gradient(140.29deg, #D02E31 14.25%, #FF9500 100.75%)",
        };

      case "mentor":
      case "mentee":
        return {
          label: "Mentor",
          icon: GraduationCap,
          className: "mentor",
          gradient: "linear-gradient(134.91deg, #0033FF 6.26%, #08CEED 94.99%)",
        };

      default:
        return {
          label: "Others",
          icon: User,
          className: "others",
          gradient: "linear-gradient(134.91deg, #6366f1 6.26%, #8b5cf6 94.99%)",
        };
    }
  };

  const config = getTypeConfig(type);
  const IconComponent = config.icon;

  return (
    <div
      className={`relationship-type-badge ${config.className}`}
      style={{ background: config.gradient }}
    >
      <IconComponent size={17} className="badge-icon" />
      <span className="badge-label">{config.label}</span>
    </div>
  );
};

export default RelationshipTypeBadge;
