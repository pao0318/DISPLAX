/**
 * Utility functions for handling rotation-based interactions
 */

/**
 * Calculates the visibility level based on rotation direction and amount
 * @param {number} angleDiff - The angle difference magnitude (absolute value)
 * @param {number} currentVisibility - Current visibility level (0-1)
 * @param {number} sensitivity - How sensitive the rotation is (lower = more sensitive)
 * @param {number} totalRotation - Total rotation accumulated so far in radians
 * @returns {number} - New visibility level (0-1)
 */
export const calculateVisibilityFromRotation = (angleDiff, currentVisibility, sensitivity = 2, totalRotation = 0) => {
  // No change if no rotation
  if (angleDiff === 0) return currentVisibility;
  
  // Calculate visibility based on proportion of 180 degrees (PI radians)
  // This makes options fully visible at exactly 180 degrees of rotation
  const proportion = Math.abs(totalRotation) / Math.PI;
  return Math.min(1, proportion);
};

/**
 * Calculates the animated position based on visibility level
 * @param {Object} startPosition - Starting position {x, y, z}
 * @param {Object} endPosition - End position {x, y, z}
 * @param {number} visibilityLevel - Current visibility level (0-1)
 * @returns {Object} - Animated position {x, y, z}
 */
export const calculateAnimatedPosition = (startPosition, endPosition, visibilityLevel) => {
  return {
    x: startPosition.x + (endPosition.x - startPosition.x) * visibilityLevel,
    y: startPosition.y + (endPosition.y - startPosition.y) * visibilityLevel,
    z: startPosition.z + (endPosition.z - startPosition.z) * visibilityLevel
  };
};

/**
 * Generates positions for options around a center point
 * @param {number} count - Number of options
 * @param {number} radius - Radius from center
 * @returns {Array} - Array of position objects {x, y, z}
 */
export const generateOptionPositions = (count, radius = 4) => {
  const positions = [];
  
  for (let i = 0; i < count; i++) {
    // Calculate angle for even distribution
    const angle = (i / count) * Math.PI * 2;
    
    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: 0
    });
  }
  
  return positions;
};

/**
 * Calculates angle between two points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} - Angle in radians
 */
export const calculateAngle = (point1, point2) => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

/**
 * Calculates angle difference, handling the wrap-around at 2π
 * @param {number} currentAngle - Current angle in radians
 * @param {number} previousAngle - Previous angle in radians
 * @returns {number} - Angle difference in radians
 */
export const calculateAngleDifference = (currentAngle, previousAngle) => {
  let diff = currentAngle - previousAngle;
  
  // Handle wrap-around
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  
  return diff;
};
