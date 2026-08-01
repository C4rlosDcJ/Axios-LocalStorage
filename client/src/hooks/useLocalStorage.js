import { useState, useEffect } from 'react';

/**
 * CUSTOM HOOK: useLocalStorage
 * Permite gestionar un estado en React que se sincroniza automáticamente con el LocalStorage del navegador.
 * 
 * @param {string} key - La clave con la que se guardará en LocalStorage.
 * @param {any} initialValue - El valor por defecto en caso de no existir datos en LocalStorage.
 * @returns {[any, Function]} Estado reactivo y función setter.
 */
export function useLocalStorage(key, initialValue) {
  // Inicialización perezosa (lazy initial state) leyendo de LocalStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[LocalStorage Error] Error leyendo ${key}:`, error);
      return initialValue;
    }
  });

  // Efecto secundario que guarda en LocalStorage cada vez que cambia el estado o la clave
  useEffect(() => {
    try {
      if (storedValue === null || storedValue === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(`[LocalStorage Error] Error guardando ${key}:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
