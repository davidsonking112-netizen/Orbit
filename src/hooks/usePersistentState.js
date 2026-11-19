import { useEffect, useState } from 'react';

function getInitialValue(initialValue) {
  return typeof initialValue === 'function' ? initialValue() : initialValue;
}

export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const fallback = getInitialValue(initialValue);
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback : JSON.parse(stored);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the UI usable when storage is unavailable or full.
    }
  }, [key, value]);

  return [value, setValue];
}
