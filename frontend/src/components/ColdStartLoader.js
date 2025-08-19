'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, Coffee } from 'lucide-react';

export default function ColdStartLoader({ 
  isVisible, 
  message = "Backend is starting up...", 
  onTimeout 
}) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [phase, setPhase] = useState('warming');

  useEffect(() => {
    if (!isVisible) {
      setTimeElapsed(0);
      setPhase('warming');
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        // Update phase based on time elapsed
        if (newTime < 10) {
          setPhase('warming');
        } else if (newTime < 30) {
          setPhase('starting');
        } else if (newTime < 50) {
          setPhase('connecting');
        } else {
          setPhase('timeout');
          if (onTimeout) onTimeout();
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onTimeout]);

  if (!isVisible) return null;

  const getPhaseIcon = () => {
    switch (phase) {
      case 'warming':
        return <Coffee className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'starting':
        return <Clock className="w-6 h-6 text-orange-500 animate-spin" />;
      case 'connecting':
        return <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />;
      case 'timeout':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Coffee className="w-6 h-6 text-blue-500 animate-pulse" />;
    }
  };

  const getPhaseMessage = () => {
    switch (phase) {
      case 'warming':
        return "Waking up the server...";
      case 'starting':
        return "Starting services...";
      case 'connecting':
        return "Establishing connection...";
      case 'timeout':
        return "Taking longer than expected...";
      default:
        return message;
    }
  };

  const getProgressWidth = () => {
    const maxTime = 60; // 60 seconds
    const progress = Math.min((timeElapsed / maxTime) * 100, 100);
    return `${progress}%`;
  };

  const getEstimatedTime = () => {
    if (timeElapsed < 10) return "~30-45 seconds";
    if (timeElapsed < 30) return "~20-30 seconds";
    if (timeElapsed < 50) return "~10-20 seconds";
    return "Please try refreshing";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getPhaseIcon()}
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getPhaseMessage()}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-gray-600 mb-4">
            This is normal for the first request. Subsequent requests will be much faster.
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                phase === 'timeout' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: getProgressWidth() }}
            />
          </div>
          
          {/* Time and Estimate */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Time elapsed: {timeElapsed}s</span>
            <span>Estimated: {getEstimatedTime()}</span>
          </div>
          
          {/* Tips */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>💡 Tip:</strong> This happens because our free-tier server goes to sleep after inactivity. 
              Once awake, all requests will be fast!
            </p>
          </div>
          
          {/* Timeout Actions */}
          {phase === 'timeout' && (
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => setTimeElapsed(0)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Keep Waiting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
