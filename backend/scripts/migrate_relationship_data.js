// scripts/fixVolatilityData.js
require("dotenv").config();
const mongoose = require("mongoose");
const Relationship = require("../models/Relationship");

/**
 * CONVERT VOLATILITY TO ENUM - Detailed Explanation
 *
 * This function converts numeric emotionalVolatility values to enum strings
 * because MongoDB schema expects specific enum values, not numbers.
 *
 * @param {number|string} conflictLevel - The volatility value to convert
 * @returns {string} - One of: "Stable", "Swingy", or "Erratic"
 */
const convertVolatilityToEnum = (conflictLevel) => {
  console.log(
    `Converting volatility: ${conflictLevel} (type: ${typeof conflictLevel})`
  );

  // STEP 1: Check if it's already a valid enum string
  if (
    typeof conflictLevel === "string" &&
    ["Stable", "Swingy", "Erratic"].includes(conflictLevel)
  ) {
    console.log(`✅ Already valid enum: ${conflictLevel}`);
    return conflictLevel;
  }

  // STEP 2: Convert to number if it's not already
  const numericLevel =
    typeof conflictLevel === "number"
      ? conflictLevel
      : parseFloat(conflictLevel) || 0.1;
  console.log(`📊 Numeric level: ${numericLevel}`);

  // STEP 3: Map numeric ranges to enum values
  let result;
  if (numericLevel <= 0.2) {
    result = "Stable"; // Low conflict = Stable relationship
    console.log(`🟢 Low volatility (${numericLevel}) → ${result}`);
  } else if (numericLevel <= 0.5) {
    result = "Swingy"; // Medium conflict = Swingy relationship
    console.log(`🟡 Medium volatility (${numericLevel}) → ${result}`);
  } else {
    result = "Erratic"; // High conflict = Erratic relationship
    console.log(`🔴 High volatility (${numericLevel}) → ${result}`);
  }

  return result;
};

/**
 * MIGRATION FUNCTION
 * Fixes all relationships with invalid emotionalVolatility values
 */
const fixVolatilityData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔌 Connected to MongoDB");

    // Find all relationships
    const relationships = await Relationship.find({});
    console.log(`📋 Found ${relationships.length} relationships to check`);

    let fixedCount = 0;
    let alreadyValidCount = 0;
    let noMetricsCount = 0;

    for (const relationship of relationships) {
      console.log(
        `\n👤 Checking relationship: ${relationship.contactName} (ID: ${relationship._id})`
      );

      // Check if relationship has metrics
      if (!relationship.metrics) {
        console.log(`⚠️ No metrics object found`);
        noMetricsCount++;
        continue;
      }

      const currentVolatility = relationship.metrics.emotionalVolatility;
      console.log(
        `📈 Current emotionalVolatility: ${currentVolatility} (type: ${typeof currentVolatility})`
      );

      // Check if it needs fixing
      if (
        typeof currentVolatility === "number" ||
        (typeof currentVolatility === "string" &&
          !["Stable", "Swingy", "Erratic"].includes(currentVolatility))
      ) {
        console.log(`🔧 FIXING: Invalid volatility detected`);

        // Convert using our function
        const newVolatility = convertVolatilityToEnum(currentVolatility);

        // Update the relationship
        relationship.metrics.emotionalVolatility = newVolatility;

        // Also fix depthScore if it's out of bounds
        if (relationship.metrics.depthScore > 5) {
          const oldDepthScore = relationship.metrics.depthScore;
          relationship.metrics.depthScore = Math.min(
            5,
            Math.max(1, Math.floor(oldDepthScore / 2) + 1)
          );
          console.log(
            `📊 Also fixed depthScore: ${oldDepthScore} → ${relationship.metrics.depthScore}`
          );
        }

        try {
          await relationship.save();
          console.log(
            `✅ FIXED: ${relationship.contactName} - ${currentVolatility} → ${newVolatility}`
          );
          fixedCount++;
        } catch (saveError) {
          console.error(
            `❌ Error saving ${relationship.contactName}:`,
            saveError.message
          );
        }
      } else {
        console.log(`✅ Already valid: ${currentVolatility}`);
        alreadyValidCount++;
      }
    }

    // Summary
    console.log(`\n📊 MIGRATION SUMMARY:`);
    console.log(`Total relationships checked: ${relationships.length}`);
    console.log(`Fixed relationships: ${fixedCount}`);
    console.log(`Already valid: ${alreadyValidCount}`);
    console.log(`No metrics: ${noMetricsCount}`);
    console.log(`🎉 Migration completed successfully!`);

    await mongoose.connection.close();
    console.log(`🔌 Database connection closed`);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

/**
 * DETAILED EXPLANATION OF THE CONVERSION LOGIC:
 *
 * WHY WE NEED THIS:
 * - Your MongoDB schema defines emotionalVolatility as an enum: ["Stable", "Swingy", "Erratic"]
 * - But your analyzer was setting it to numeric values like 0.1, 0.3, etc.
 * - MongoDB rejects numeric values for enum fields, causing validation errors
 *
 * HOW THE CONVERSION WORKS:
 *
 * 1. CONFLICT LEVEL RANGES:
 *    • 0.0 - 0.2 = "Stable"   (Little to no conflict in conversations)
 *    • 0.2 - 0.5 = "Swingy"   (Some ups and downs, moderate conflict)
 *    • 0.5 - 1.0 = "Erratic"  (High conflict, unpredictable emotions)
 *
 * 2. REAL-WORLD EXAMPLES:
 *    • 0.1 → "Stable"   (Couple who rarely argues)
 *    • 0.3 → "Swingy"   (Friends who sometimes disagree but make up)
 *    • 0.7 → "Erratic"  (Relationship with frequent emotional swings)
 *
 * 3. SAFETY CHECKS:
 *    • Handles both numbers and strings
 *    • Returns existing valid enums unchanged
 *    • Provides fallback for invalid inputs
 *    • Logs each conversion for debugging
 */

// Run the migration
fixVolatilityData();
