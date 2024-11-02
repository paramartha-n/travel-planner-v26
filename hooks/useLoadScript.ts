"use client";

import { useState, useEffect } from 'react';

const SCRIPT_ID = 'google-maps-script';

export function useLoadScript() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById(SCRIPT_ID)) {
      setIsLoaded(true);
      return;
    }

    // Check if the API is already available
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    const handleLoad = () => {
      setIsLoaded(true);
    };

    script.addEventListener('load', handleLoad);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
    };
  }, []);

  return isLoaded;
}