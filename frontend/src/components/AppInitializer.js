'use client';

import { useEffect } from 'react';
import { apiService, keepAliveService } from '../lib/api';

export default function AppInitializer() {
  useEffect(() => {
    // Wake up the backend service on app load
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing MindCare Connect...');
        
        // Try to wake up the backend
        const isAwake = await apiService.wakeUp();
        
        if (isAwake) {
          console.log('✅ Backend is already awake');
        } else {
          console.log('🔄 Backend is starting up...');
        }
        
        // Start keep-alive service
        keepAliveService.start();
        
      } catch (error) {
        console.log('⚠️ Failed to initialize app:', error.message);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      keepAliveService.stop();
    };
  }, []);

  // This component doesn't render anything
  return null;
}
