import React, { useMemo, memo, useState, useEffect, useCallback } from 'react';

/**
 * ObjectOptions component that displays options in a circle around an object
 * @param {Object} props
 * @param {Object} props.object - The object data with options
 * @param {Function} props.onOptionSelect - Called when an option is selected
 * @param {boolean} props.isVisible - Whether the options should be visible
 * @param {Function} props.onAnimationComplete - Called when disappearing animation completes
 */
const ObjectOptions = memo(({ object, onOptionSelect, isVisible = true, onAnimationComplete }) => {
  // State to track animation state
  const [animationState, setAnimationState] = useState(isVisible ? 'appearing' : 'idle');
  
  // Handle visibility changes with functional update to avoid adding animationState to deps
  useEffect(() => {
    setAnimationState(prev => {
      if (isVisible) return 'appearing';
      return prev !== 'idle' ? 'disappearing' : prev;
    });
  }, [isVisible]);
  
  // Handle animation end
  const handleAnimationEnd = useCallback(() => {
    if (animationState === 'disappearing') {
      setAnimationState('idle');
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }
  }, [animationState, onAnimationComplete]);
  
  // Pre-calculate option positions - memoized to avoid recalculation on re-renders
  const optionElements = useMemo(() => {
    if (!object || !object.options) return [];
    
    return object.options.map((option, index) => {
      // Calculate position in a circle
      const angle = (index / object.options.length) * Math.PI * 2;
      const radius = 100; // Distance from center
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Use CSS variables for better performance with animations
      const style = {
        '--option-x': `${x}px`,
        '--option-y': `${y}px`,
        '--option-delay': `${index * 0.05}s`,
        left: 'var(--option-x)',
        top: 'var(--option-y)',
      };
      
      return (
        <div 
          key={option.id}
          className={`option-item absolute bg-gray-800 text-white rounded-full cursor-pointer ${animationState}`}
          style={style}
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            onOptionSelect(object.id, option);
          }}
          onAnimationEnd={index === 0 ? handleAnimationEnd : undefined}
        >
          <div className="flex items-center justify-center h-full">
            {option.id}
          </div>
          
          {/* Option label */}
          <div className="option-label absolute whitespace-nowrap bg-gray-800 px-2 py-1 rounded text-xs">
            {option.label}
            {option.description && (
              <div className="text-gray-400 text-xs">{option.description}</div>
            )}
          </div>
        </div>
      );
    });
  }, [object, onOptionSelect, animationState, handleAnimationEnd]);
  
  // If there's no object or options, don't render anything
  if (!object || !object.options || object.options.length === 0) return null;
  
  return (
    <div 
      className="options-container absolute z-20" 
      style={{
        left: `${object.x * 100}%`,
        top: `${object.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', // Let clicks pass through the container
      }}
    >
      {optionElements}
    </div>
  );
});

export default ObjectOptions;
