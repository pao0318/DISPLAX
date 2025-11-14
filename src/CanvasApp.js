import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Import components
import MapCanvas from './components/MapCanvas';
import DraggableObject from './components/DraggableObject';
import ObjectOptions from './components/ObjectOptions';
import OptionsPanel from './components/OptionsPanel';

// Import services
import { getAllObjects, updateObjectPosition } from './services/dataService';

function CanvasApp() {
  // State for objects and active object
  const [objects, setObjects] = useState([]);
  const [activeObject, setActiveObject] = useState(null);

  // State for center car options
  const [showCenterOptions, setShowCenterOptions] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // State for options panel
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedObjectName, setSelectedObjectName] = useState('');
  
  // Define the main car object in the center (not part of draggable objects)
  const centerCarObject = {
    id: 'center-car',
    name: 'Car',
    type: 'car',
    x: 0.5,
    y: 0.5,
    angle: 0,
    color: '#06b6d4',
    icon: 'Car',
    options: [
      { id: 1, label: 'Driving Insights', description: 'View your driving analytics' },
      { id: 2, label: 'Vehicle Finance Overview', description: 'Check your payment status' },
      { id: 3, label: 'Eco Rewards Dashboard', description: 'See your environmental impact' },
      { id: 4, label: 'Predictive Finance AI', description: 'Get AI-powered recommendations' },
      { id: 5, label: 'My Journey Summary', description: 'Review your recent trips' }
    ]
  };
  
  // Load objects on component mount - only once
  useEffect(() => {
    const loadedObjects = getAllObjects();
    setObjects(loadedObjects);
  }, []);

  
  // Handle center car click to toggle options
  const handleCarClick = useCallback(() => {
    if (showCenterOptions && !isAnimatingOut) {
      setIsAnimatingOut(true);
    } else {
      setShowCenterOptions(true);
      setIsAnimatingOut(false);
    }
  }, [showCenterOptions, isAnimatingOut]);
  
  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    if (isAnimatingOut) {
      setShowCenterOptions(false);
      setIsAnimatingOut(false);
    }
  }, [isAnimatingOut]);
  
  // Handle object click - toggles active object for options visibility inside DraggableObject
  const handleObjectClick = useCallback((object) => {
    setActiveObject(prev => (prev?.id === object.id ? null : object));
  }, []);
  
  // Handle object drag - memoized with useCallback
  const handleObjectDrag = useCallback((id, position) => {
    // Use functional updates to avoid stale closures
    setObjects(prevObjects => 
      prevObjects.map(obj => 
        obj.id === id ? { ...obj, ...position } : obj
      )
    );
    
    // Update active object if it's the one being dragged
    setActiveObject(prev => 
      prev?.id === id ? { ...prev, ...position } : prev
    );
    
    // Update position in data service
    updateObjectPosition(id, position);
  }, []);
  
  // Handle option selection
  const handleOptionSelect = useCallback((objectId, option) => {
    console.log(`Selected ${option.label}`);
    
    // Find the object name
    let objName = 'Car';
    if (objectId !== 'center-car') {
      const obj = objects.find(o => o.id === objectId);
      objName = obj ? obj.name : 'Object';
    }
    
    setSelectedOption(option);
    setSelectedObjectName(objName);
  }, [objects]);
  
  return (
    <div className="App">
      {/* Map background */}
      <MapCanvas mapSrc="/assets/map.svg" />
      
      {/* Draggable objects on the map */}
      {objects.map(object => (
        <DraggableObject
          key={object.id}
          object={object}
          options={object.options}
          onOptionSelect={handleOptionSelect}
          onDrag={handleObjectDrag}
          onClick={handleObjectClick}
          isActive={activeObject?.id === object.id}
        />
      ))}
      
      
      {/* EY Logo */}
      <div className="absolute bottom-4 right-4 w-24 pointer-events-auto">
        <img src="/assets/EY_Logo_Beam_STFWC_Stacked_RGB_White_Yellow_EN 2.svg" alt="EY Logo" />
      </div>
      
  
      
      {/* Options Panel */}
      {selectedOption && (
        <OptionsPanel
          option={selectedOption}
          objectName={selectedObjectName}
          onClose={() => setSelectedOption(null)}
        />
      )}
    </div>
  );
}

export default CanvasApp;
