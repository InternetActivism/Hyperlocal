import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import InitializedApp from './InitializedApp';
import { LoadingPageStatic, OnboardingPage } from './pages';
import { currentUserInfoAtom } from './services/atoms';
import { getOrCreateUserInfoDatabase } from './services/user';

/* App handles all functionality before starting the bridgefy SDK */
export default function App() {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [minTimeoutReached, setMinTimeoutReached] = useState(false);
  const showLoadingScreen = currentUserInfo === null || !minTimeoutReached;

  // Get or create the current user info from the database
  useEffect(() => {
    const user = getOrCreateUserInfoDatabase();
    setCurrentUserInfo(user);
  }, [setCurrentUserInfo]);

  // Set up a minimum timeout so that the loading screen is shown for at least 0.2 second
  useEffect(() => {
    setTimeout(() => {
      setMinTimeoutReached(true);
    }, 200);
  }, []);

  const renderApp = () => {
    if (showLoadingScreen) {
      return <LoadingPageStatic />;
    }
    if (!currentUserInfo.isOnboarded) {
      console.log('(AppWrapper) User not onboarded yet');
      return <OnboardingPage />;
    }
    return <InitializedApp />;
  };

  return renderApp();
}
