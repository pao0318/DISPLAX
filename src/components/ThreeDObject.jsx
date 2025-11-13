import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useHelper } from '@react-three/drei';
import * as THREE from 'three';

function Box(props) {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  
  // Rotate the box on each frame
  useFrame((state, delta) => {
    if (active) {
      mesh.current.rotation.x += delta * 0.5;
      mesh.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? '#2196f3' : '#10b981'} />
    </mesh>
  );
}

export default function ThreeDObject({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const [objectPosition, setObjectPosition] = useState(position);
  const [objectRotation, setObjectRotation] = useState(rotation);
  
  // Convert degrees to radians for rotation display
  const getDegreesFromRadians = (radians) => {
    return Math.round((radians * 180) / Math.PI);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
        <pointLight position={[-10, -10, -10]} />
        
        <Box 
          position={objectPosition} 
          rotation={objectRotation.map(r => r * Math.PI / 180)} 
        />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          onChange={(e) => {
            if (e.target.object) {
              setObjectPosition([
                e.target.object.position.x,
                e.target.object.position.y,
                e.target.object.position.z
              ]);
              
              setObjectRotation([
                e.target.object.rotation.x,
                e.target.object.rotation.y,
                e.target.object.rotation.z
              ]);
            }
          }}
        />
        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
      </Canvas>
      
      {/* Controls Panel */}
      <div className="absolute bottom-6 left-6 bg-white/95 p-4 rounded-lg shadow-lg text-sm">
        <div className="font-bold text-lg">3D Object Controls</div>
        
        <div className="mt-2">
          <div className="font-semibold">Position:</div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <div key={axis} className="flex flex-col">
                <label className="text-xs text-gray-500">{axis}</label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={objectPosition[i]}
                  onChange={(e) => {
                    const newPos = [...objectPosition];
                    newPos[i] = parseFloat(e.target.value);
                    setObjectPosition(newPos);
                  }}
                  className="w-full"
                />
                <span className="text-xs">{objectPosition[i].toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="font-semibold">Rotation (degrees):</div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <div key={axis} className="flex flex-col">
                <label className="text-xs text-gray-500">{axis}</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={objectRotation[i]}
                  onChange={(e) => {
                    const newRot = [...objectRotation];
                    newRot[i] = parseFloat(e.target.value);
                    setObjectRotation(newRot);
                  }}
                  className="w-full"
                />
                <span className="text-xs">{objectRotation[i].toFixed(0)}°</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-3 pt-2 border-t">
          Click object to animate • Drag to rotate view • Scroll to zoom
        </div>
      </div>
    </div>
  );
}
