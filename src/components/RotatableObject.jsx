import React, { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { calculateAngleDifference } from '../utils/rotationUtils';

/**
 * A component that can be dragged and rotated
 * @param {Object} props
 * @param {Object} props.position - Initial position {x, y, z}
 * @param {Function} props.onPositionChange - Called when position changes
 * @param {Function} props.onRotate - Called when object is rotated with angle difference
 * @param {Function} props.onDragStart - Called when drag starts
 * @param {Function} props.onDragEnd - Called when drag ends
 * @param {React.ReactNode} props.children - The object to render
 */
const RotatableObject = ({
  position,
  onPositionChange,
  onRotate,
  onDragStart,
  onDragEnd,
  children
}) => {
  const groupRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [lastAngle, setLastAngle] = useState(null);
  const { camera, raycaster, mouse, gl } = useThree();
  
  // Handle pointer down
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    if (onDragStart) onDragStart();
    gl.domElement.style.cursor = 'grabbing';
    
    // Calculate angle for rotation reference
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const screenPos = worldPos.clone().project(camera);
    setLastAngle(Math.atan2(mouse.y - screenPos.y, mouse.x - screenPos.x));
  };
  
  // Handle pointer up
  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRotating(false);
    if (onDragEnd) onDragEnd();
    gl.domElement.style.cursor = 'grab';
    setLastAngle(null);
  };
  
  // Handle pointer move
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    // Get world position of the mesh
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    
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
        const angleDiff = calculateAngleDifference(currentAngle, lastAngle);
        
        // Call onRotate callback with angle difference
        if (onRotate) onRotate(angleDiff);
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
      if (onPositionChange) onPositionChange(intersection.x, intersection.y, intersection.z);
    }
  };
  
  // Clean up event listeners
  React.useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setIsRotating(false);
        if (onDragEnd) onDragEnd();
        gl.domElement.style.cursor = 'grab';
        setLastAngle(null);
      }
    };
    
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging, gl, onDragEnd]);
  
  return (
    <group 
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerUp}
    >
      {children}
      
      {/* Drag/rotate indicator */}
      {isDragging && (
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[2.05, 2.15, 64]} />
          <meshStandardMaterial 
            color="#67e8f9" 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      )}
    </group>
  );
};

export default RotatableObject;
