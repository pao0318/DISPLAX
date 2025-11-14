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
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  
  // Handle pointer down (works for mouse, touch, and pen)
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    // Capture the initial click offset from the center of the object
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Store the starting position to detect if it's a click or drag
    startPosRef.current = { x: clientX, y: clientY };
    hasMovedRef.current = false;
    
    offsetRef.current = {
      x: clientX - (rect.left + rect.width / 2),
      y: clientY - (rect.top + rect.height / 2)
    };
    
    setIsDragging(true);
  }, []);
  
  // Handle pointer move - optimized with requestAnimationFrame
  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Check if pointer has moved more than 5 pixels (to distinguish click from drag)
    const dx = Math.abs(clientX - startPosRef.current.x);
    const dy = Math.abs(clientY - startPosRef.current.y);
    
    if (dx > 5 || dy > 5) {
      hasMovedRef.current = true;
    }
    
    if (!hasMovedRef.current) return;
    
    // Use requestAnimationFrame to limit updates
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      if (!objectRef.current) return;
      
      const parentRect = objectRef.current.parentElement.getBoundingClientRect();
      const newX = (clientX - offsetRef.current.x - parentRect.left) / parentRect.width;
      const newY = (clientY - offsetRef.current.y - parentRect.top) / parentRect.height;
      
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
  
  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    // If it was a click (not a drag), call onClick
    if (!hasMovedRef.current) {
      onClick(object);
    }
    
    setIsDragging(false);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, [object, onClick]);
  
  // Add and remove event listeners for both mouse and touch
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handlePointerMove, { passive: true });
      document.addEventListener('mouseup', handlePointerUp);
      
      // Touch events
      document.addEventListener('touchmove', handlePointerMove, { passive: true });
      document.addEventListener('touchend', handlePointerUp);
      
      // Pointer events (modern approach)
      document.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerup', handlePointerUp);
      
      document.body.style.cursor = 'grabbing';
    } else {
      // Mouse events
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      
      // Touch events
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
      
      // Pointer events
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      
      document.body.style.cursor = '';
    }
    
    return () => {
      // Mouse events
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      
      // Touch events
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
      
      // Pointer events
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);
  
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
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onPointerDown={handlePointerDown}
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
