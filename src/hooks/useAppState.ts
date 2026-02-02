import { useState, useEffect } from 'react';
import { AppState } from 'react-native';

export const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Listener to update state
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    // Cleanup: Remove listener when component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  return appState; // Returns 'active', 'background', or 'inactive' (iOS)
};

export default useAppState;