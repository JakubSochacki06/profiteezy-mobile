import React, { useEffect, Component } from 'react';
import { Linking, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SuperwallProvider, useSuperwall } from 'expo-superwall';
import { LoginScreen } from './src/screens/LoginScreen';
import { supabase } from './src/lib/supabase';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.subtitle}>Please restart the app to continue.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D1D1D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#AAAAAA',
    fontSize: 15,
    textAlign: 'center',
  },
});

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
        // Race against a 6-second timeout so Superwall is never left uninitialized
        const timeout = new Promise<void>((resolve) => setTimeout(resolve, 6000));
        const init = async () => {
          const { data: { session } } = await supabase.auth.getSession();

          if (!session?.user) {
            await superwall.setSubscriptionStatus({ status: 'INACTIVE' });
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
        };

        await Promise.race([init(), timeout]);
      } catch (error) {
        console.error('Failed to initialize subscription status:', error);
        try {
          await superwall.setSubscriptionStatus({ status: 'INACTIVE' });
        } catch (_) {}
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
    <ErrorBoundary>
      <SuperwallProvider
        apiKeys={{ ios: "pk_1XJ62ooPiSXsAdIGSOkT_", android: "pk_1XJ62ooPiSXsAdIGSOkT_" }}
        options={{
          logging: {
            level: 'warn',
            scopes: ['all'],
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
    </ErrorBoundary>
  );
}
