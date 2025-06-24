"use client";

import { useState, useEffect } from 'react';

export default function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      // When the page loads, check if there's an update
      const checkForUpdates = async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          setRegistration(reg || null);

          if (reg) {
            // Check for updates every 60 minutes
            setInterval(() => {
              reg.update().catch(console.error);
            }, 60 * 60 * 1000);

            // Listen for new service worker updates
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      };

      checkForUpdates();

      // Add event listener for when the service worker updates in the background
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (document.visibilityState === 'visible') {
          window.location.reload();
        }
      });
    }
  }, []);

  const applyUpdate = () => {
    if (registration && registration.waiting) {
      // Send message to service worker to skip waiting and activate new version
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  return { updateAvailable, applyUpdate };
}