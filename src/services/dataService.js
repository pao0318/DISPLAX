/**
 * Service for loading and managing object data
 */

// Import mock data
import { initialMockData } from '../data/mockData';

/**
 * Get all objects from the mock data
 * @returns {Array} Array of objects
 */
export const getAllObjects = () => {
  return initialMockData.objects;
};

/**
 * Get a specific object by ID
 * @param {number} id - The object ID
 * @returns {Object|null} The object or null if not found
 */
export const getObjectById = (id) => {
  return initialMockData.objects.find(obj => obj.id === id) || null;
};

/**
 * Update object position
 * @param {number} id - The object ID
 * @param {Object} position - The new position {x, y}
 * @returns {Object} The updated object
 */
export const updateObjectPosition = (id, position) => {
  const objectIndex = initialMockData.objects.findIndex(obj => obj.id === id);
  if (objectIndex === -1) return null;
  
  // In a real app, this would update a database or state management store
  // For this mock, we'll update the object in memory
  initialMockData.objects[objectIndex] = {
    ...initialMockData.objects[objectIndex],
    ...position
  };
  
  return initialMockData.objects[objectIndex];
};

/**
 * Get options for an object
 * @param {number} id - The object ID
 * @returns {Array} Array of options
 */
export const getObjectOptions = (id) => {
  const object = getObjectById(id);
  return object ? object.options : [];
};

const dataService = {
  getAllObjects,
  getObjectById,
  updateObjectPosition,
  getObjectOptions
};

export default dataService;
