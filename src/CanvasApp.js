import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import MapCanvas from './components/MapCanvas';
import DraggableObject from './components/DraggableObject';
import OptionsPanel from './components/OptionsPanel';

// Import services
import { getAllObjects, updateObjectPosition } from './services/dataService';

function CanvasApp() {
   const [objects, setObjects] = useState([]);
  const [activeObject, setActiveObject] = useState(null);
  const [showHelp, setShowHelp] = useState(true);
  
  // State for center car options
  
  // State for options panel
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedObjectName, setSelectedObjectName] = useState('');
  
  // Define the main car object in the center (not part of draggable objects)
  
  
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
  
  // Handle center car click to toggle options
  
  // Handle animation completion
  
  
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
      <MapCanvas mapSrc="/assets/map2-bg.svg" />
      
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
      <div className="absolute bottom-8 right-10 w-24 pointer-events-auto">
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
