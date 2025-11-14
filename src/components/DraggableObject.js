import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import ObjectOptions from './ObjectOptions';

/**
 * DraggableObject component that can be dragged around the canvas
 * @param {Object} props
 * @param {Object} props.object - The object data
 * @param {Function} props.onDrag - Called when object is dragged with new position
 * @param {Function} props.onClick - Called when object is clicked
 * @param {boolean} props.isActive - Whether the object is currently active
 * @param {Array} props.options - Optional list of options for this object
 * @param {Function} props.onOptionSelect - Callback when an option is selected
 */
const DraggableObject = memo(({ object, onDrag, onClick, isActive, options, onOptionSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: object.x, y: object.y });
  const objectRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef();
  const lastPositionRef = useRef({ x: object.x, y: object.y });
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // Handle mouse down
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    // Capture the initial click offset from the center of the object
    const rect = e.currentTarget.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2)
    };
    
    setIsDragging(true);
    
    // Call onClick to activate this object
    onClick(object);
  }, [object, onClick]);
  
  // Handle mouse move - optimized with requestAnimationFrame
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Use requestAnimationFrame to limit updates
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      if (!objectRef.current) return;
      
      const parentRect = objectRef.current.parentElement.getBoundingClientRect();
      const newX = (e.clientX - offsetRef.current.x - parentRect.left) / parentRect.width;
      const newY = (e.clientY - offsetRef.current.y - parentRect.top) / parentRect.height;
      
      // Clamp values between 0 and 1
      const clampedX = Math.max(0, Math.min(1, newX));
      const clampedY = Math.max(0, Math.min(1, newY));
      
      // Only update if position changed significantly (reduce updates)
      const dx = Math.abs(clampedX - lastPositionRef.current.x);
      const dy = Math.abs(clampedY - lastPositionRef.current.y);
      
      if (dx > 0.001 || dy > 0.001) {
        lastPositionRef.current = { x: clampedX, y: clampedY };
        setPosition({ x: clampedX, y: clampedY });
        onDrag(object.id, { x: clampedX, y: clampedY });
      }
    });
  }, [isDragging, object.id, onDrag]);
  
  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);
  
  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Update position when object prop changes (but not during drag)
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: object.x, y: object.y });
      lastPositionRef.current = { x: object.x, y: object.y };
    }
  }, [object.x, object.y, isDragging]);

  // Manage options visibility based on isActive, with disappear animation
  useEffect(() => {
    if (isActive) {
      setOptionsVisible(true);
      setIsAnimatingOut(false);
    } else if (optionsVisible) {
      setIsAnimatingOut(true);
    }
  }, [isActive, optionsVisible]);

  // Use CSS transform for better performance
  const style = {
    position: 'absolute',
    left: `${position.x * 100}%`,
    top: `${position.y * 100}%`,
    backgroundColor: 'transparent',
    transform: 'translate(-50%, -50%)',
    zIndex: isActive ? 10 : 1,
    willChange: isDragging ? 'left, top' : 'auto', // Hint to browser for optimization
    touchAction: 'none', // Disable browser handling of touch gestures
  };

  // Prepare data for options rendering via portal
  const appContainer = typeof document !== 'undefined' ? document.querySelector('.App') : null;
  const optionsList = options ?? object.options ?? [];
  const objectForOptions = { ...object, x: position.x, y: position.y, options: optionsList };

  const handleOptionsAnimationComplete = useCallback(() => {
    if (isAnimatingOut) {
      setOptionsVisible(false);
      setIsAnimatingOut(false);
    }
  }, [isAnimatingOut]);

  return (
    <>
      <div 
        ref={objectRef}
        className={`absolute rounded-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''} ${isActive && !isDragging ? 'pulse' : ''}`}
        style={style}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="flex items-center justify-center h-full w-full text-white">
          {object.icon ? (
            <img 
              src={`/assets/${object.icon}.svg`} 
              alt={object.name} 
              className="object-contain" 
              style={{ 
                opacity: 1,
                transform: 'scale(0.4)',
              }} 
            />
          ) : (
            <span className="font-bold">{object.name.charAt(0)}</span>
          )}
        </div>
      </div>

      {(optionsVisible || isAnimatingOut) && appContainer && createPortal(
        (
          <ObjectOptions
            object={objectForOptions}
            onOptionSelect={onOptionSelect}
            isVisible={!isAnimatingOut}
            onAnimationComplete={handleOptionsAnimationComplete}
          />
        ),
        appContainer
      )}
    </>
  );
});

export default DraggableObject;
