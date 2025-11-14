import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
const optionLabels = ['Driving Insights', 'Vehicle Finance Overview', 'Eco Rewards Dashboard', 'Predictive Finance AI'];


// Option item that appears when rotating clockwise
function OptionItem({ position, objectPosition, color, label, onClick, visibilityLevel }) {
  // Extract the object's position (center point for animation)
  const objectX = objectPosition[0];
  const objectY = objectPosition[1];
  const objectZ = objectPosition[2];
  
  // Calculate the final position of the option
  const finalX = position[0];
  const finalY = position[1];
  const finalZ = position[2];
  
  // Calculate the offset from object center to final position
  const offsetX = finalX - objectX;
  const offsetY = finalY - objectY;
  
  // Calculate animated position (from object center when hidden, to final position when visible)
  const animatedX = objectX + (offsetX * visibilityLevel);
  const animatedY = objectY + (offsetY * visibilityLevel);
  
  // Calculate opacity based on visibility level
  const opacity = visibilityLevel;
  
  // Don't render if completely invisible
  if (visibilityLevel <= 0.01) return null;
  
  return (
    <group position={[animatedX, animatedY, finalZ]}>
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
      
      {/* Label */}
      <group position={[0, 0, 0.02]}>
        {/* Text is rendered as HTML overlay in the parent component */}
      </group>
    </group>
  );
}

// Main object that can be dragged and rotated
function InteractiveObjectMesh({ 
  objectData, 
  onPositionChange, 
  onAngleChange, 
  optionsVisibility,
  onOptionSelect 
}) {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [lastAngle, setLastAngle] = useState(null);
  const { camera, raycaster, mouse, gl } = useThree();
  
  // Create object geometry
  const radius = 2;
  const segments = 64;
  
  // Car dimensions
  const carWidth = 2.5;
  const carHeight = 1.2;
  
  // Handle pointer down
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    
    // Store initial position for later reference
    setLastPosition(new THREE.Vector3().copy(meshRef.current.position));
    
    // Calculate angle for rotation reference
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    const screenPos = worldPos.clone().project(camera);
    setLastAngle(Math.atan2(mouse.y - screenPos.y, mouse.x - screenPos.x));
  };
  
  // Handle pointer up
  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRotating(false);
    gl.domElement.style.cursor = 'grab';
    setLastPosition(null);
    setLastAngle(null);
  };
  
  // Handle pointer move
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    // Get world position of the mesh
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    
    // Project to screen coordinates
    const screenPos = worldPos.clone().project(camera);
    
    // Calculate distance from current mouse position to object center
    const dx = mouse.x - screenPos.x;
    const dy = mouse.y - screenPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate current angle
    const currentAngle = Math.atan2(mouse.y - screenPos.y, mouse.x - screenPos.x);
    
    // If distance is greater than threshold, we're rotating
    if (distance > 0.15) {
      setIsRotating(true);
      
      if (lastAngle !== null) {
        // Calculate angle difference
        let angleDiff = currentAngle - lastAngle;
        
        // Normalize angle difference
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Update angle based on rotation
        onAngleChange(angleDiff);
      }
      
      setLastAngle(currentAngle);
    } 
    // Otherwise we're dragging
    else if (!isRotating) {
      // Convert mouse movement to 3D position
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      // Update position
      onPositionChange(intersection.x, intersection.y);
    }
  };
  
  // Clean up event listeners
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setIsRotating(false);
        gl.domElement.style.cursor = 'grab';
        setLastPosition(null);
        setLastAngle(null);
      }
    };
    
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging, gl]);
  
  // Get object color based on fiducialID
  const getObjectColor = (fiducialID) => {
    const colors = {
      42: '#10b981', // emerald
      8: '#3b82f6',  // blue
    };
    return colors[fiducialID] || '#f59e0b'; // default to amber
  };

  // Option positions (in a circle around the main object)
  const optionPositions = [
    [0, 4, 0],   // top
    [4, 0, 0],   // right
    [0, -4, 0],  // bottom
    [-4, 0, 0],  // left
  ];
  
  // Option colors
  const optionColors = ['#67e8f9', '#67e8f9', '#67e8f9', '#67e8f9'];
  
  // Option labels
  
  return (
    <group>
      {/* Main object - Car with circular background */}
      <group
        ref={meshRef}
        position={[objectData.x * 10 - 5, objectData.y * 10 - 5, 0]}
        rotation={[0, 0, objectData.angle]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
      >
        {/* Outer circle with serrated edge */}
        <mesh>
          <circleGeometry args={[radius, segments]} />
          <meshStandardMaterial color="#0891b2" opacity={0.3} transparent />
        </mesh>
        
        {/* Inner circle */}
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[radius * 0.95, segments]} />
          <meshStandardMaterial color="#0891b2" opacity={0.2} transparent />
        </mesh>
        
        {/* Horizontal stripes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, -1.5 + i * 0.5, 0.02]}>
            <planeGeometry args={[radius * 2, 0.2]} />
            <meshStandardMaterial color="#67e8f9" opacity={0.3} transparent />
          </mesh>
        ))}
        
        {/* Car silhouette */}
        <group position={[0, 0, 0.03]}>
          {/* Car body - using basic geometries instead of Shape */}
          <mesh>
            <boxGeometry args={[carWidth, carHeight, 0.1]} />
            <meshStandardMaterial color="#67e8f9" />
          </mesh>
          
          {/* Car roof */}
          <mesh position={[0, carHeight/4, 0.01]}>
            <boxGeometry args={[carWidth * 0.6, carHeight * 0.5, 0.1]} />
            <meshStandardMaterial color="#67e8f9" />
          </mesh>
          
          {/* Wheels */}
          <mesh position={[-carWidth/3, -carHeight/2, 0.01]}>
            <circleGeometry args={[0.4, 16]} />
            <meshStandardMaterial color="#67e8f9" />
          </mesh>
          <mesh position={[carWidth/3, -carHeight/2, 0.01]}>
            <circleGeometry args={[0.4, 16]} />
            <meshStandardMaterial color="#67e8f9" />
          </mesh>
          
          {/* Lightning bolt - using a custom mesh */}
          <group>
            {/* Top part of lightning */}
            <mesh position={[0, 0.2, 0.02]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[0.2, 0.6, 0.1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            
            {/* Bottom part of lightning */}
            <mesh position={[0, -0.2, 0.02]} rotation={[0, 0, -Math.PI / 6]}>
              <boxGeometry args={[0.2, 0.6, 0.1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>
      </group>
      
      {/* Option items */}
      {optionPositions.map((pos, index) => {
        // Calculate object center position
        const objectCenterPos = [objectData.x * 10 - 5, objectData.y * 10 - 5, 0];
        
        // Calculate final option position
        const finalOptionPos = [
          objectData.x * 10 - 5 + pos[0], 
          objectData.y * 10 - 5 + pos[1], 
          0
        ];
        
        return (
          <OptionItem 
            key={index}
            position={finalOptionPos}
            objectPosition={objectCenterPos}
            color={optionColors[index]}
            label={optionLabels[index]}
            onClick={() => onOptionSelect(index)}
            visibilityLevel={optionsVisibility}
          />
        );
      })}
      
      {/* Drag/rotate indicator */}
      {isDragging && (
        <mesh 
          position={[objectData.x * 10 - 5, objectData.y * 10 - 5, 0.01]} 
          rotation={[0, 0, 0]}
        >
          <ringGeometry args={[radius * 1.05, radius * 1.15, segments]} />
          <meshStandardMaterial 
            color={isRotating ? "#67e8f9" : "#67e8f9"} 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      )}
    </group>
  );
}

export default function InteractiveObject({ initialData }) {
  // Use only the first object from the data
  const [objectData, setObjectData] = useState(initialData.objects[0]);
  const [optionsVisibility, setOptionsVisibility] = useState(0); // 0 = hidden, 1 = fully visible
  const canvasRef = useRef();
  
  // Handle position change
  const handlePositionChange = (x, y) => {
    setObjectData(prev => ({
      ...prev,
      // Convert from Three.js coordinates (-5 to 5) to normalized (0 to 1)
      x: (x + 5) / 10,
      y: (y + 5) / 10
    }));
  };
  
  // Handle angle change
  const handleAngleChange = (angleDiff) => {
    // Track total rotation for animation purposes
    setObjectData(prev => ({
      ...prev,
      // Update angle
      angle: (prev.angle + angleDiff) % (Math.PI * 2)
    }));
    
    // Gradually show options when rotating clockwise (negative angleDiff)
    // Gradually hide options when rotating counterclockwise (positive angleDiff)
    if (angleDiff < 0) { // Clockwise rotation
      // Increase visibility based on rotation amount (up to 180 degrees = PI radians)
      setOptionsVisibility(prev => {
        // Calculate new visibility level
        const increment = Math.abs(angleDiff) / (Math.PI / 4); // Full visibility at 45 degrees
        return Math.min(1, prev + increment); // Cap at 1 (fully visible)
      });
    } else if (angleDiff > 0) { // Counterclockwise rotation
      // Decrease visibility based on rotation amount
      setOptionsVisibility(prev => {
        // Calculate new visibility level
        const decrement = Math.abs(angleDiff) / (Math.PI / 4); // Full invisibility at 45 degrees
        return Math.max(0, prev - decrement); // Cap at 0 (fully invisible)
      });
    }
  };
  
  // Handle option selection
  const handleOptionSelect = (optionIndex) => {
    console.log(`Selected option ${optionIndex + 1} for object ${objectData.fiducialID}`);
    // Here you could trigger different actions based on the selected option
  };
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 15], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Render single interactive object */}
        <InteractiveObjectMesh 
          objectData={objectData}
          onPositionChange={handlePositionChange}
          onAngleChange={handleAngleChange}
          optionsVisibility={optionsVisibility}
          onOptionSelect={handleOptionSelect}
        />
        
        <OrbitControls 
          enableRotate={false} 
          enablePan={false} 
          enableZoom={true}
        />
        
        <gridHelper args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>
      
      {/* Option labels overlay */}
      {optionsVisibility > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {optionLabels.map((label, i) => {
            // Base positions for fully visible options
            const basePositions = [
              { top: '15%', left: '50%' },  // top
              { top: '50%', left: '75%' },  // right
              { top: '85%', left: '50%' },  // bottom
              { top: '50%', left: '25%' },  // left
            ];
            
            // Convert object position from 3D space to screen percentage
            // objectData.x and objectData.y are in 0-1 range
            const objectCenterPos = {
              top: `${objectData.y * 100}%`,
              left: `${objectData.x * 100}%`
            };
            
            // Calculate animated positions based on visibility level
            // When visibility is 0, all options are at object center
            // When visibility is 1, options are at their final positions
            const targetPos = basePositions[i];
            
            // Interpolate between object center and target position
            const animatedPos = {
              top: `calc(${objectData.y * 100}% + (${parseFloat(targetPos.top) - objectData.y * 100}% * ${optionsVisibility}))`,
              left: `calc(${objectData.x * 100}% + (${parseFloat(targetPos.left) - objectData.x * 100}% * ${optionsVisibility}))`
            };
            
            // Split the label into multiple lines if needed
            const words = label.split(' ');
            const lines = [];
            if (words.length === 2) {
              lines.push(words[0], words[1]);
            } else if (words.length === 3) {
              lines.push(words[0], words[1], words[2]);
            } else {
              lines.push(words[0], words.slice(1).join(' '));
            }
            
            return (
              <div 
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-center w-32"
                style={{
                  ...animatedPos,
                  opacity: optionsVisibility
                }}
              >
                {lines.map((line, j) => (
                  <div key={j} className="text-lg">{line}</div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Info panel */}
      <div className="absolute bottom-6 left-6 bg-white/95 p-4 rounded-lg shadow-lg text-sm">
        <div className="font-bold text-lg">Electric Vehicle Dashboard</div>
        <div className="text-gray-700 mt-1">
          Vehicle ID: <span className="font-semibold">{objectData.fiducialID}</span>
        </div>
        <div className="text-gray-600 text-xs mt-2">
          Position: ({objectData.x.toFixed(3)}, {objectData.y.toFixed(3)})
        </div>
        <div className="text-gray-600 text-xs">
          Rotation: {(objectData.angle * 180 / Math.PI).toFixed(1)}°
        </div>
        <div className="text-gray-600 text-xs">
          Menu Visibility: {Math.round(optionsVisibility * 100)}%
        </div>
        <div className="text-xs text-gray-500 mt-3 pt-2 border-t">
          {optionsVisibility > 0.5 
            ? '🔄 Menu visible - rotate counterclockwise to hide'
            : '🔄 Rotate clockwise to show menu options'}
        </div>
      </div>
    </div>
  );
}
