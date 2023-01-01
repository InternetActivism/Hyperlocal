import { Provider } from 'jotai';
import React, { useEffect, useState } from 'react';
import App from './App';
import { LoadingPageStatic, OnboardingPage } from './pages';
import { CurrentUserInfo } from './services/database';
import { getOrCreateUserInfoDatabase } from './services/user';

export default function AppWrapper() {
  const [currentUserInfo, setCurrentUserInfo] = useState<null | CurrentUserInfo>(null);
  const [minTimeoutReached, setMinTimeoutReached] = useState(false);
  const showLoadingScreen = currentUserInfo === null || !minTimeoutReached;

  // Get or create the current user info from the database
  useEffect(() => {
    const user = getOrCreateUserInfoDatabase();
    setCurrentUserInfo(user);
  }, []);

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
    return <App />;
  };

  return <Provider>{renderApp()}</Provider>;
}
