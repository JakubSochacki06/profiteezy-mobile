import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SuperwallProvider, useSuperwall } from 'expo-superwall';
import { LoginScreen } from './src/screens/LoginScreen';
import { supabase } from './src/lib/supabase';

// Component to handle deep links and subscription status initialization
// Note: The SDK may handle some deep links automatically, but we set this up
// to ensure all deep links are properly routed to Superwall
function DeepLinkHandler() {
  const superwall = useSuperwall();

  useEffect(() => {
    // Initialize Superwall subscription status from Supabase profile.
    // This avoids resetting paid users back to INACTIVE on every app launch.
    const initializeSubscriptionStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          await superwall.setSubscriptionStatus({ status: 'INACTIVE' });
          console.log('Subscription status initialized to INACTIVE (no session)');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_expires_at')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Failed to read profile for subscription status:', error);
          await superwall.setSubscriptionStatus({ status: 'INACTIVE' });
          return;
        }

        const isActive = profile?.subscription_status === 'active';
        const isExpired = profile?.subscription_expires_at
          ? new Date(profile.subscription_expires_at) < new Date()
          : false;

        await superwall.setSubscriptionStatus({
          status: isActive && !isExpired ? 'ACTIVE' : 'INACTIVE',
        });
        console.log(
          `Subscription status initialized to ${isActive && !isExpired ? 'ACTIVE' : 'INACTIVE'}`
        );
      } catch (error) {
        console.error('Failed to initialize subscription status:', error);
      }
    };

    initializeSubscriptionStatus();

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
    <SuperwallProvider 
      apiKeys={{ ios: "pk_1XJ62ooPiSXsAdIGSOkT_", android: "pk_1XJ62ooPiSXsAdIGSOkT_" }}
      options={{
        logging: {
          level: 'debug', // Enable debug logging to see configuration issues
          scopes: ['all'], // Log all Superwall events
        },
      }}
    >
      <SafeAreaProvider>
        <NavigationContainer>
          <DeepLinkHandler />
          <LoginScreen />
        </NavigationContainer>
      </SafeAreaProvider>
    </SuperwallProvider>
  );
}
