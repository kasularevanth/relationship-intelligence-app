// scripts/updateRelationshipData.js
require("dotenv").config();
const mongoose = require("mongoose");
const Relationship = require("../models/Relationship");

/**
 * RELATIONSHIP TYPE MAPPING
 * Maps old relationship type values to new enum values
 */
const RELATIONSHIP_TYPE_MAPPING = {
  // Old values → New values
  Partner: "romantic",
  partner: "romantic",
  romantic: "romantic", // Already correct

  Friend: "friendship",
  friend: "friendship",
  friendship: "friendship", // Already correct

  Colleague: "professional",
  colleague: "professional",
  professional: "professional", // Already correct

  Family: "family",
  family: "family", // Already correct

  Mentor: "mentor",
  mentor: "mentor", // Already correct
  Mentee: "mentor", // Map mentee to mentor

  Acquaintance: "other",
  Other: "other",
  other: "other", // Already correct
};

/**
 * Convert old relationship type to new enum value
 */
const convertRelationshipType = (oldType) => {
  if (!oldType) {
    console.log(`⚠️ No relationship type found, defaulting to 'other'`);
    return "other";
  }

  const newType = RELATIONSHIP_TYPE_MAPPING[oldType] || "other";

  if (oldType !== newType) {
    console.log(`🔄 Converting: "${oldType}" → "${newType}"`);
  } else {
    console.log(`✅ Already correct: "${oldType}"`);
  }

  return newType;
};

/**
 * Fix emotionalVolatility enum values
 */
const convertVolatilityToEnum = (volatility) => {
  if (
    typeof volatility === "string" &&
    ["Stable", "Swingy", "Erratic"].includes(volatility)
  ) {
    return volatility; // Already valid
  }

  const numericLevel =
    typeof volatility === "number" ? volatility : parseFloat(volatility) || 0.1;

  if (numericLevel <= 0.2) {
    return "Stable";
  } else if (numericLevel <= 0.5) {
    return "Swingy";
  } else {
    return "Erratic";
  }
};

/**
 * Fix depthScore to be within 1-5 range
 */
const fixDepthScore = (depthScore) => {
  if (!depthScore || typeof depthScore !== "number") {
    return 1; // Default value
  }

  // Ensure it's within 1-5 range
  if (depthScore < 1) return 1;
  if (depthScore > 5) return 5;

  return Math.round(depthScore); // Round to nearest integer
};

/**
 * MAIN MIGRATION FUNCTION
 */
const updateRelationshipData = async () => {
  try {
    console.log("🚀 Starting relationship data migration...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔌 Connected to MongoDB");

    // Find all relationships
    const relationships = await Relationship.find({});
    console.log(`📋 Found ${relationships.length} relationships to update`);

    let updatedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;

    for (const relationship of relationships) {
      console.log(
        `\n👤 Processing: ${relationship.contactName} (ID: ${relationship._id})`
      );

      let needsUpdate = false;
      const updates = {};

      try {
        // 1. Fix relationship type
        const currentType = relationship.relationshipType;
        const newType = convertRelationshipType(currentType);

        if (currentType !== newType) {
          updates.relationshipType = newType;
          needsUpdate = true;
          console.log(
            `📝 Will update relationshipType: ${currentType} → ${newType}`
          );
        }

        // 2. Fix photo field (ensure it's either null or string)
        if (
          relationship.photo !== null &&
          relationship.photo !== undefined &&
          typeof relationship.photo !== "string"
        ) {
          updates.photo = null;
          needsUpdate = true;
          console.log(`📷 Will fix photo field`);
        }

        // 3. Fix metrics if they exist
        if (relationship.metrics) {
          const metricsUpdates = {};

          // Fix emotionalVolatility
          if (relationship.metrics.emotionalVolatility) {
            const currentVolatility = relationship.metrics.emotionalVolatility;
            const newVolatility = convertVolatilityToEnum(currentVolatility);

            if (currentVolatility !== newVolatility) {
              metricsUpdates.emotionalVolatility = newVolatility;
              needsUpdate = true;
              console.log(
                `📊 Will update volatility: ${currentVolatility} → ${newVolatility}`
              );
            }
          }

          // Fix depthScore
          if (relationship.metrics.depthScore) {
            const currentDepth = relationship.metrics.depthScore;
            const newDepth = fixDepthScore(currentDepth);

            if (currentDepth !== newDepth) {
              metricsUpdates.depthScore = newDepth;
              needsUpdate = true;
              console.log(
                `📈 Will update depthScore: ${currentDepth} → ${newDepth}`
              );
            }
          }

          // Fix reciprocityRatio (ensure 0-1 range)
          if (relationship.metrics.reciprocityRatio) {
            const currentRatio = relationship.metrics.reciprocityRatio;
            let newRatio = currentRatio;

            if (currentRatio < 0) newRatio = 0;
            if (currentRatio > 1) newRatio = 1;

            if (currentRatio !== newRatio) {
              metricsUpdates.reciprocityRatio = newRatio;
              needsUpdate = true;
              console.log(
                `⚖️ Will update reciprocityRatio: ${currentRatio} → ${newRatio}`
              );
            }
          }

          // Fix sentimentScore (ensure -1 to 1 range)
          if (relationship.metrics.sentimentScore) {
            const currentSentiment = relationship.metrics.sentimentScore;
            let newSentiment = currentSentiment;

            if (currentSentiment < -1) newSentiment = -1;
            if (currentSentiment > 1) newSentiment = 1;

            if (currentSentiment !== newSentiment) {
              metricsUpdates.sentimentScore = newSentiment;
              needsUpdate = true;
              console.log(
                `😊 Will update sentimentScore: ${currentSentiment} → ${newSentiment}`
              );
            }
          }

          // Apply metrics updates
          if (Object.keys(metricsUpdates).length > 0) {
            updates.metrics = {
              ...relationship.metrics.toObject(),
              ...metricsUpdates,
            };
          }
        }

        // 4. Remove interactionFrequency if it has invalid value
        if (relationship.interactionFrequency === "Not specified") {
          updates.interactionFrequency = undefined;
          needsUpdate = true;
          console.log(`🗑️ Will remove invalid interactionFrequency`);
        }

        // 5. Ensure required fields have defaults
        if (!relationship.connectionScore) {
          updates.connectionScore = 50;
          needsUpdate = true;
          console.log(`🔗 Will set default connectionScore: 50`);
        }

        if (!relationship.trustLevel) {
          updates.trustLevel = 5;
          needsUpdate = true;
          console.log(`🛡️ Will set default trustLevel: 5`);
        }

        if (!relationship.relationshipLevel) {
          updates.relationshipLevel = 1;
          needsUpdate = true;
          console.log(`📊 Will set default relationshipLevel: 1`);
        }

        // Apply updates if needed
        if (needsUpdate) {
          console.log(`🔧 Applying updates to ${relationship.contactName}...`);

          // Update using findByIdAndUpdate to avoid validation issues
          await Relationship.findByIdAndUpdate(
            relationship._id,
            { $set: updates },
            { runValidators: false } // Skip validation during migration
          );

          console.log(`✅ Updated ${relationship.contactName} successfully`);
          updatedCount++;
        } else {
          console.log(`✅ ${relationship.contactName} already up to date`);
          alreadyCorrectCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error updating ${relationship.contactName}:`,
          error.message
        );
        errorCount++;
      }
    }

    // Final summary
    console.log(`\n📊 MIGRATION SUMMARY:`);
    console.log(`Total relationships processed: ${relationships.length}`);
    console.log(`Updated relationships: ${updatedCount}`);
    console.log(`Already correct: ${alreadyCorrectCount}`);
    console.log(`Errors: ${errorCount}`);

    if (updatedCount > 0) {
      console.log(
        `🎉 Migration completed successfully! ${updatedCount} relationships updated.`
      );
    } else {
      console.log(`✨ All relationships were already up to date!`);
    }

    await mongoose.connection.close();
    console.log(`🔌 Database connection closed`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

/**
 * WHAT THIS SCRIPT DOES:
 *
 * 1. RELATIONSHIP TYPES:
 *    - Maps old values like "Partner", "Friend", "Colleague" to new enum values
 *    - Ensures all relationships have valid relationshipType
 *
 * 2. METRICS VALIDATION:
 *    - Converts numeric emotionalVolatility to enum strings
 *    - Ensures depthScore is within 1-5 range
 *    - Fixes reciprocityRatio to 0-1 range
 *    - Fixes sentimentScore to -1 to 1 range
 *
 * 3. DATA CLEANUP:
 *    - Removes invalid interactionFrequency values
 *    - Sets default values for missing required fields
 *    - Fixes photo field data types
 *
 * 4. SAFE EXECUTION:
 *    - Uses findByIdAndUpdate with runValidators: false
 *    - Handles errors gracefully
 *    - Provides detailed logging
 *    - Shows summary of changes
 */

// Run the migration
if (require.main === module) {
  updateRelationshipData();
}

module.exports = { updateRelationshipData };
