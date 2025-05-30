import { useEffect } from 'react';

export const useKeyDown = (callback: (key: string) => void) => {
  const onKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();
    callback(event.key);
  };
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
};