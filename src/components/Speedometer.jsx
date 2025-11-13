import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Speedometer component that can be dragged and rotated with reduced sensitivity
function SpeedometerGauge({ position, reading, onPositionChange, onReadingChange }) {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [lastAngle, setLastAngle] = useState(null);
  const { camera, raycaster, mouse, gl } = useThree();
  
  // Create gauge geometry
  const outerRadius = 1;
  const innerRadius = 0.6;
  const segments = 64;
  
  // Reduced sensitivity factor - higher value means slower changes
  const rotationSensitivity = 0.15; // Reduced from previous implementation

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
        
        // Update reading based on rotation with reduced sensitivity
        // Clockwise (negative angleDiff) increases reading
        const readingChange = -angleDiff * rotationSensitivity * 50; // Reduced sensitivity
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
  
  // Calculate speedometer arc angle (only goes from -135 to +135 degrees, not full circle)
  const startAngle = -Math.PI * 0.75; // -135 degrees
  const endAngle = Math.PI * 0.75; // +135 degrees
  const totalAngleRange = endAngle - startAngle;
  
  // Calculate gauge fill based on reading (0-100)
  const normalizedReading = Math.max(0, Math.min(100, reading)) / 100;
  const arcAngle = startAngle + (normalizedReading * totalAngleRange);
  
  // Create tick marks for the speedometer
  const tickMarks = [];
  const majorTickCount = 11; // 0, 10, 20, ..., 100
  const minorTicksPerMajor = 1; // Number of minor ticks between major ticks
  
  for (let i = 0; i <= majorTickCount - 1; i++) {
    const tickAngle = startAngle + (i / (majorTickCount - 1)) * totalAngleRange;
    const tickSinAngle = Math.sin(tickAngle);
    const tickCosAngle = Math.cos(tickAngle);
    
    // Major tick
    tickMarks.push(
      <line 
        key={`major-${i}`}
        position={[0, 0, 0.02]}
        geometry={new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(tickCosAngle * innerRadius, tickSinAngle * innerRadius, 0),
          new THREE.Vector3(tickCosAngle * (innerRadius - 0.15), tickSinAngle * (innerRadius - 0.15), 0)
        ])}
      >
        <lineBasicMaterial color="#000000" linewidth={2} />
      </line>
    );
    
    // Minor ticks
    if (i < majorTickCount - 1) {
      for (let j = 1; j <= minorTicksPerMajor; j++) {
        const minorTickAngle = tickAngle + (j / (minorTicksPerMajor + 1)) * (totalAngleRange / (majorTickCount - 1));
        const minorTickSinAngle = Math.sin(minorTickAngle);
        const minorTickCosAngle = Math.cos(minorTickAngle);
        
        tickMarks.push(
          <line 
            key={`minor-${i}-${j}`}
            position={[0, 0, 0.02]}
            geometry={new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(minorTickCosAngle * innerRadius, minorTickSinAngle * innerRadius, 0),
              new THREE.Vector3(minorTickCosAngle * (innerRadius - 0.08), minorTickSinAngle * (innerRadius - 0.08), 0)
            ])}
          >
            <lineBasicMaterial color="#666666" linewidth={1} />
          </line>
        );
      }
    }
  }
  
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
        <ringGeometry args={[innerRadius, outerRadius, segments, 1, startAngle, totalAngleRange]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      
      {/* Progress arc */}
      <mesh>
        <ringGeometry args={[innerRadius, outerRadius, segments, 1, startAngle, arcAngle - startAngle]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      
      {/* Tick marks */}
      {tickMarks}
      
      {/* Center circle */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[innerRadius * 0.9, segments]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Needle */}
      <mesh position={[0, 0, 0.03]} rotation={[0, 0, arcAngle]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={new Float32Array([
              0, 0, 0,
              outerRadius * 0.9, 0, 0,
              0, outerRadius * 0.1, 0
            ])}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            count={3}
            array={new Uint16Array([0, 1, 2])}
            itemSize={1}
          />
        </bufferGeometry>
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Center cap */}
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
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

export default function Speedometer() {
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
        
        <SpeedometerGauge 
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
      
      {/* Info panel */}
      <div className="absolute bottom-6 left-6 bg-white/95 p-4 rounded-lg shadow-lg text-sm">
        <div className="font-bold text-lg">Speedometer</div>
        <div className="text-gray-700 mt-1">Speed: <span className="font-semibold">{Math.round(reading)}</span></div>
        <div className="text-gray-600 text-xs mt-2">
          Pos: ({position.x.toFixed(2)}, {position.y.toFixed(2)})
        </div>
        <div className="text-xs text-gray-500 mt-3 pt-2 border-t">
          {isDragging
            ? isRotating
              ? '🔄 Rotate slowly to change value'
              : '📍 Drag to move speedometer'
            : '👆 Click and hold to interact'}
        </div>
      </div>
    </div>
  );
}
