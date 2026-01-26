import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SuperwallProvider, useSuperwall } from 'expo-superwall';
import { LoginScreen } from './src/screens/LoginScreen';

// Component to handle deep links for Superwall
// Note: The SDK may handle some deep links automatically, but we set this up
// to ensure all deep links are properly routed to Superwall
function DeepLinkHandler() {
  const superwall = useSuperwall();

  useEffect(() => {
    // Handle deep links when app is opened from a closed state
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url && superwall.handleDeepLink) {
        try {
          await superwall.handleDeepLink(url);
        } catch (error) {
          // handleDeepLink may return false for non-Superwall links, which is expected
          // Only log actual errors
          if (error && typeof error !== 'boolean') {
            console.error('Initial deep link error:', error);
          }
        }
      }
    };

    // Handle deep links when app is already running
    const handleUrl = async (event: { url: string }) => {
      if (superwall.handleDeepLink) {
        try {
          await superwall.handleDeepLink(event.url);
        } catch (error) {
          // handleDeepLink may return false for non-Superwall links, which is expected
          if (error && typeof error !== 'boolean') {
            console.error('Deep link error:', error);
          }
        }
      }
    };

    handleInitialUrl();

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription.remove();
    };
  }, [superwall]);

  return null;
}

export default function App() {
  return (
    <SuperwallProvider apiKeys={{ ios: "pk_-w27jLL0CBIyfAFdcSG3Z", android: "pk_-w27jLL0CBIyfAFdcSG3Z" }}>
      <SafeAreaProvider>
        <DeepLinkHandler />
        <LoginScreen />
      </SafeAreaProvider>
    </SuperwallProvider>
  );
}
