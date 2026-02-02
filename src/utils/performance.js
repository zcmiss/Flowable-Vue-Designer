/**
 * RAF-based throttle for high-frequency events
 * @param {Function} fn - Function to throttle
 * @returns {Function} Throttled function
 */
export function rafThrottle(fn) {
  let queued = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  };
}

/**
 * Create a lowercase translation map for faster lookups
 * @param {Object} translations - Translation object
 * @returns {Map} Lowercase key map
 */
export function createTranslationMap(translations) {
  return new Map(
    Object.entries(translations).map(([key, value]) => [key.toLowerCase(), value])
  );
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
