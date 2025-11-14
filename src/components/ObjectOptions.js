import React, { useMemo, memo } from 'react';

/**
 * ObjectOptions component that displays options in a circle around an object
 * @param {Object} props
 * @param {Object} props.object - The object data with options
 * @param {Function} props.onOptionSelect - Called when an option is selected
 */
const ObjectOptions = memo(({ object, onOptionSelect }) => {
  // Pre-calculate option positions - memoized to avoid recalculation on re-renders
  const optionElements = useMemo(() => {
    if (!object || !object.options) return [];
    
    return object.options.map((option, index) => {
      // Calculate position in a circl
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
        animationDelay: 'var(--option-delay)',
      };
      
      return (
        <div 
          key={option.id}
          className="option-item absolute bg-gray-800 text-white rounded-full cursor-pointer"
          style={style}
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            onOptionSelect(object.id, option);
          }}
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
  }, [object?.id, object?.options, onOptionSelect]);
  
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
