import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Gauge component that can be dragged and rotated
function Gauge({ position, reading, onPositionChange, onReadingChange }) {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [lastAngle, setLastAngle] = useState(null);
  const { camera, raycaster, mouse, gl } = useThree();
  
  // Create gauge geometry
  const outerRadius = 1;
  const innerRadius = 0.7;
  const segments = 64;

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
        
        // Update reading based on rotation
        // Clockwise (negative angleDiff) increases reading
        const readingChange = -angleDiff * 50; // Scale factor for sensitivity
        onReadingChange(readingChange);
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
  
  // Calculate gauge fill based on reading (0-100)
  const normalizedReading = Math.max(0, Math.min(100, reading)) / 100;
  const arcAngle = normalizedReading * Math.PI * 2;
  
  return (
    <group 
      ref={meshRef}
      position={[position.x, position.y, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerUp}
    >
      {/* Outer ring (background) */}
      <mesh>
        <ringGeometry args={[innerRadius, outerRadius, segments]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      
      {/* Progress arc */}
      <mesh>
        <ringGeometry args={[innerRadius, outerRadius, segments, 1, 0, arcAngle]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      
      {/* Center circle */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[innerRadius * 0.9, segments]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Reading text */}
      <group position={[0, 0, 0.02]}>
        {/* Text is rendered as HTML overlay in the parent component */}
      </group>
      
      {/* Drag/rotate indicator */}
      {isDragging && (
        <mesh position={[0, 0, 0.03]} rotation={[0, 0, 0]}>
          <ringGeometry args={[outerRadius * 1.05, outerRadius * 1.15, segments]} />
          <meshStandardMaterial color={isRotating ? "#3b82f6" : "#10b981"} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

export default function CircularGauge() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [reading, setReading] = useState(50);
  const canvasRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  // Handle position change
  const handlePositionChange = (x, y) => {
    setPosition({ x, y });
    setIsDragging(true);
    setIsRotating(false);
  };
  
  // Handle reading change
  const handleReadingChange = (change) => {
    setReading(prev => {
      const newValue = prev + change;
      return Math.max(0, Math.min(100, newValue));
    });
    setIsDragging(true);
    setIsRotating(true);
  };
  
  // Reset dragging/rotating state when pointer is released
  useEffect(() => {
    const handlePointerUp = () => {
      setIsDragging(false);
      setIsRotating(false);
    };
    
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Gauge 
          position={position} 
          reading={reading}
          onPositionChange={handlePositionChange}
          onReadingChange={handleReadingChange}
        />
        
        <OrbitControls 
          enableRotate={false} 
          enablePan={false} 
          enableZoom={true}
          enabled={!isDragging}
        />
        
        <gridHelper args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>
      
      {/* Reading overlay */}
      <div 
        className="absolute pointer-events-none"
        style={{
          left: `${(position.x / 5 + 0.5) * 100}%`,
          top: `${(-position.y / 5 + 0.5) * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="text-3xl font-bold text-gray-800">
          {Math.round(reading)}
        </div>
      </div>
      
      {/* Info panel */}
      <div className="absolute bottom-6 left-6 bg-white/95 p-4 rounded-lg shadow-lg text-sm">
        <div className="font-bold text-lg">Circular Gauge</div>
        <div className="text-gray-700 mt-1">Reading: <span className="font-semibold">{Math.round(reading)}</span></div>
        <div className="text-gray-600 text-xs mt-2">
          Pos: ({position.x.toFixed(2)}, {position.y.toFixed(2)})
        </div>
        <div className="text-xs text-gray-500 mt-3 pt-2 border-t">
          {isDragging
            ? isRotating
              ? '🔄 Circular drag to change value'
              : '📍 Drag to move gauge'
            : '👆 Click and hold to interact'}
        </div>
      </div>
    </div>
  );
}
