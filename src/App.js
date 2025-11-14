import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';

// Import components
import MapCanvas from './components/MapCanvas';
import DraggableObject from './components/DraggableObject';
import ObjectOptions from './components/ObjectOptions';

// Import services
import { getAllObjects, updateObjectPosition } from './services/dataService';

function App() {
  // State for objects and active object
  const [objects, setObjects] = useState([]);
  const [activeObject, setActiveObject] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  
  // Load objects on component mount - only once
  useEffect(() => {
    const loadedObjects = getAllObjects();
    setObjects(loadedObjects);
  }, []);
  
  // Hide help tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelp(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Memoize handlers for better performance
  
  // Handle object click - memoized to prevent recreation on each render
  const handleObjectClick = useCallback((object) => {
    setActiveObject(prevActive => {
      const isToggle = prevActive?.id === object.id;
      setShowOptions(prev => isToggle ? !prev : true);
      return object;
    });
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
  
  // Handle option selection - memoized with useCallback
  const handleOptionSelect = useCallback((objectId, option) => {
    console.log(`Selected ${option.label} for object ${objectId}`);
    // Here you would handle the action for each option
  }, []);
  
  return (
    <div className="App">
      {/* Map background */}
      <MapCanvas mapSrc="/assets/map.svg" />
      
      {/* Draggable objects */}
      {objects.map(object => (
        <DraggableObject
          key={object.id}
          object={object}
          onDrag={handleObjectDrag}
          onClick={handleObjectClick}
          isActive={activeObject?.id === object.id}
        />
      ))}
      
      {/* Options for active object */}
      {showOptions && activeObject && (
        <ObjectOptions 
          object={activeObject}
          onOptionSelect={handleOptionSelect}
        />
      )}
      
      {/* Help tooltip */}
      {showHelp && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 text-white px-4 py-2 rounded-lg shadow-lg text-center">
          <p className="font-bold mb-1">How to interact:</p>
          <p className="text-sm">🖱️ Click and drag to move objects</p>
          <p className="text-sm">🔄 Click an object to show options</p>
        </div>
      )}
      
      {/* EY Logo */}
      <div className="absolute bottom-4 right-4 w-24">
        <img src="/assets/EY_Logo_Beam_STFWC_Stacked_RGB_White_Yellow_EN 2.svg" alt="EY Logo" />
      </div>
      
      {/* Help button */}
      <button 
        className="absolute bottom-4 left-4 bg-gray-800/80 text-white p-2 rounded-full shadow-lg"
        onClick={() => setShowHelp(prev => !prev)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}

export default App;