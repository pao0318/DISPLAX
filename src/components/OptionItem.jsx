import React from 'react';
import { calculateAnimatedPosition } from '../utils/rotationUtils';

/**
 * A component that represents an option item that can appear/disappear based on rotation
 * @param {Object} props
 * @param {Object} props.startPosition - Starting position {x, y, z}
 * @param {Object} props.endPosition - End position {x, y, z}
 * @param {number} props.visibilityLevel - Visibility level (0-1)
 * @param {Function} props.onClick - Called when option is clicked
 * @param {React.ReactNode} props.children - Optional children to render inside the option
 */
const OptionItem = ({
  startPosition,
  endPosition,
  visibilityLevel,
  onClick,
  children
}) => {
  // Don't render if completely invisible
  if (visibilityLevel <= 0.01) return null;
  
  // Calculate animated position
  const animatedPosition = calculateAnimatedPosition(
    startPosition,
    endPosition,
    visibilityLevel
  );
  
  // Calculate opacity based on visibility level
  const opacity = visibilityLevel;
  
  return (
    <group position={[animatedPosition.x, animatedPosition.y, animatedPosition.z]}>
      {/* Circle background */}
      <mesh onClick={onClick}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#1e293b" opacity={0.8 * opacity} transparent />
      </mesh>
      
      {/* Circle border */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[1.15, 1.2, 32]} />
        <meshStandardMaterial color="#67e8f9" opacity={opacity} transparent />
      </mesh>
      
      {/* Children content */}
      <group position={[0, 0, 0.02]}>
        {children}
      </group>
    </group>
  );
};

export default OptionItem;
