// frontend/src/utils/imageCompression.js
// Utility functions to compress images before sending

/**
 * Compress an image file to reduce size before converting to base64
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Base64 string of compressed image
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    // Default compression options
    const {
      maxWidth = 800, // Max width in pixels
      maxHeight = 800, // Max height in pixels
      quality = 0.8, // JPEG quality (0.1 to 1.0)
      outputFormat = "jpeg", // Output format: 'jpeg' or 'png'
    } = options;

    // Create canvas and context
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL(
          `image/${outputFormat}`,
          quality
        );

        console.log(
          `Image compressed: ${file.size} bytes → ${Math.round(compressedBase64.length * 0.75)} bytes`
        );
        resolve(compressedBase64);
      } catch (error) {
        reject(new Error(`Image compression failed: ${error.message}`));
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for compression"));
    };

    // Start loading the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file before processing
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please select a JPEG, PNG, or WebP image.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Image is too large. Please select an image smaller than 10MB.",
    };
  }

  return { valid: true };
};

/**
 * Get optimal compression settings based on file size
 * @param {number} fileSize - File size in bytes
 * @returns {Object} - Compression options
 */
export const getCompressionOptions = (fileSize) => {
  const MB = 1024 * 1024;

  if (fileSize > 5 * MB) {
    // Large files: aggressive compression
    return {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.6,
      outputFormat: "jpeg",
    };
  } else if (fileSize > 2 * MB) {
    // Medium files: moderate compression
    return {
      maxWidth: 700,
      maxHeight: 700,
      quality: 0.7,
      outputFormat: "jpeg",
    };
  } else {
    // Small files: light compression
    return {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      outputFormat: "jpeg",
    };
  }
};

/**
 * Complete image processing pipeline
 * @param {File} file - The image file to process
 * @returns {Promise<string>} - Compressed base64 image
 */
export const processImageFile = async (file) => {
  // Validate file first
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get optimal compression settings
  const compressionOptions = getCompressionOptions(file.size);

  // Compress the image
  const compressedBase64 = await compressImage(file, compressionOptions);

  return compressedBase64;
};
