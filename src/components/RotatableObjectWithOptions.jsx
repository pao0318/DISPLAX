import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import RotatableObject from './RotatableObject';
import OptionItem from './OptionItem';
import { calculateVisibilityFromRotation, generateOptionPositions } from '../utils/rotationUtils';

/**
 * A component that renders a rotatable object with options that appear on rotation
 * @param {Object} props
 * @param {Object} props.initialPosition - Initial position {x, y, z}
 * @param {Array} props.options - Array of option data
 * @param {Function} props.onOptionSelect - Called when an option is selected
 * @param {React.ReactNode} props.objectContent - The content of the main object
 * @param {React.ReactNode} props.optionContent - Function to render option content (receives option and index)
 * @param {number} props.optionsRadius - Radius for options placement
 * @param {number} props.rotationSensitivity - How sensitive rotation is (higher = more sensitive)
 */
const RotatableObjectWithOptions = ({
  initialPosition = { x: 0, y: 0, z: 0 },
  options = [],
  onOptionSelect,
  objectContent,
  optionContent,
  optionsRadius = 4,
  rotationSensitivity = 2
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [optionsVisibility, setOptionsVisibility] = useState(0);
  const [totalRotation, setTotalRotation] = useState(0);
  const [rotationDirection, setRotationDirection] = useState(null); // 'clockwise' or 'counterclockwise'
  
  // Generate option positions
  const optionPositions = generateOptionPositions(options.length, optionsRadius);
  
  // Handle position change
  const handlePositionChange = (x, y, z) => {
    setPosition({ x, y, z });
  };
  
  // Handle drag start
  const handleDragStart = () => {
    // Only reset rotation direction, but maintain the current visibility state
    setRotationDirection(null);
    // We'll determine the new direction based on the first rotation movement
  };
  
  // Handle rotation
  const handleRotate = (angleDiff) => {
    // Simple approach: just track the direction of rotation
    const isClockwise = angleDiff < 0;
    const isCounterClockwise = !isClockwise;
    
    // Update current rotation direction
    setRotationDirection(isClockwise ? 'clockwise' : 'counterclockwise');
    
    // For clockwise rotation: gradually show options
    if (isClockwise) {
      // Increase visibility based on rotation amount
      setOptionsVisibility(prev => {
        // Calculate the increment based on rotation amount
        // PI/4 (45 degrees) of rotation will add 0.25 to visibility
        const increment = Math.abs(angleDiff) / (Math.PI / 2); // Adjust sensitivity here
        return Math.min(1, prev + increment); // Cap at 1 (fully visible)
      });
    } 
    // For counterclockwise rotation: gradually hide options
    else {
      // Decrease visibility based on rotation amount
      setOptionsVisibility(prev => {
        // Calculate the decrement based on rotation amount
        const decrement = Math.abs(angleDiff) / (Math.PI / 2); // Adjust sensitivity here
        return Math.max(0, prev - decrement); // Cap at 0 (fully hidden)
      });
    }
    
    // Keep track of total rotation for display purposes
    if (isClockwise) {
      setTotalRotation(prev => prev + Math.abs(angleDiff));
    } else {
      setTotalRotation(prev => Math.max(0, prev - Math.abs(angleDiff)));
    }
  
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    // Only reset rotation direction, but keep the total rotation and visibility state
    setRotationDirection(null);
    // Do NOT reset totalRotation here to maintain the current visibility state
  };
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Main rotatable object with integrated options */}
        <RotatableObject
          position={position}
          onPositionChange={handlePositionChange}
          onRotate={handleRotate}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Main object content */}
          {objectContent}
          
          {/* Option items as children of the main object */}
          {options.map((option, index) => (
            <OptionItem
              key={index}
              startPosition={{ x: 0, y: 0, z: 0 }} // Start from object center
              endPosition={{
                x: optionPositions[index].x,
                y: optionPositions[index].y,
                z: optionPositions[index].z
              }}
              visibilityLevel={optionsVisibility}
              onClick={() => onOptionSelect && onOptionSelect(option, index)}
            >
              {optionContent && optionContent(option, index)}
            </OptionItem>
          ))}
        </RotatableObject>
        
        <OrbitControls 
          enableRotate={false} 
          enablePan={false} 
          enableZoom={true}
        />
        
        <gridHelper args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>
      
      {/* Optional HTML overlay for options */}
      {optionsVisibility > 0 && options.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          pointerEvents: 'none',
          opacity: optionsVisibility
        }}>
          {options.map((option, i) => {
            // Calculate percentage position based on 3D position
            const optPos = optionPositions[i];
            // Calculate from object position (center)
            const objectScreenX = (position.x / 10 + 0.5) * 100;
            const objectScreenY = (position.y / 10 + 0.5) * 100;
            // Calculate offset based on visibility
            const offsetX = (optPos.x / 10) * 100 * optionsVisibility;
            const offsetY = (optPos.y / 10) * 100 * optionsVisibility;
            // Final position
            const screenX = objectScreenX + offsetX;
            const screenY = objectScreenY + offsetY;
            
            return (
              <div 
                key={i}
                style={{
                  position: 'absolute',
                  top: `${screenY}%`,
                  left: `${screenX}%`,
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '120px'
                }}
              >
                {option.label || `Option ${i+1}`}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Info panel */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontSize: '14px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>
          Rotatable Object
        </div>
        <div style={{ marginBottom: '4px' }}>
          Position: ({position.x.toFixed(2)}, {position.y.toFixed(2)})
        </div>
        <div style={{ marginBottom: '4px' }}>
          Options: {Math.round(optionsVisibility * 100)}% visible
        </div>
        <div style={{ marginBottom: '4px' }}>
          Rotation: {Math.round(totalRotation * 180 / Math.PI)}° {rotationDirection || 'none'}
        </div>
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '8px', 
          borderTop: '1px solid #e5e7eb',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          {optionsVisibility > 0.5 
            ? '🔄 Rotate counterclockwise to hide options'
            : '🔄 Rotate 180° clockwise to fully show options'}
        </div>
      </div>
    </div>
  );
};

export default RotatableObjectWithOptions;
