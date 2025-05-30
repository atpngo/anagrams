import { useEffect } from 'react';

export const useKeyUp = (callback: (key: string) => void) => {
  const onKeyUp = (event: KeyboardEvent) => {
    event.preventDefault();
    callback(event.key);
  };
  useEffect(() => {
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyUp]);
};