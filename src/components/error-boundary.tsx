'use client';

import { useEffect } from 'react';

export function ErrorBoundary() {
  useEffect(() => {
    // Capturar erros globais de JavaScript
    const handleError = (event: ErrorEvent) => {
      console.warn('Global error caught:', event.error);
      // Evitar que o erro quebre a aplicação
      event.preventDefault();
    };

    // Capturar erros de promises rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection:', event.reason);
      // Evitar que a promise rejeitada quebre a aplicação
      event.preventDefault();
    };

    // Capturar erros de geolocalização especificamente
    const originalGeolocation = navigator.geolocation?.getCurrentPosition;
    if (originalGeolocation) {
      navigator.geolocation.getCurrentPosition = function(success, error, options) {
        return originalGeolocation.call(this, success, (err) => {
          console.warn('Geolocation error handled:', err);
          if (error) error(err);
        }, options);
      };
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
