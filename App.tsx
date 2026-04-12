import React, { useEffect, Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SuperwallProvider, useSuperwall, SuperwallExpoModule } from 'expo-superwall';
import type { SubscriptionStatus } from 'expo-superwall';
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
function SubscriptionStatusInitializer() {
  const setSubscriptionStatus = useSuperwall(s => s.setSubscriptionStatus);

  useEffect(() => {
    let cancelled = false;

    const initializeSubscriptionStatus = async () => {
      try {
        const timeout = new Promise<void>((resolve) => setTimeout(resolve, 6000));
        const init = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (cancelled) return;

          if (!session?.user) {
            await setSubscriptionStatus({ status: 'INACTIVE' });
            return;
          }

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_expires_at')
            .eq('id', session.user.id)
            .single();

          if (cancelled) return;

          if (error) {
            console.error('Failed to read profile for subscription status:', error);
            await setSubscriptionStatus({ status: 'INACTIVE' });
            return;
          }

          const isActive = profile?.subscription_status === 'active';
          const isExpired = profile?.subscription_expires_at
            ? new Date(profile.subscription_expires_at) < new Date()
            : false;

          const status: SubscriptionStatus = isActive && !isExpired
            ? { status: 'ACTIVE', entitlements: [] }
            : { status: 'INACTIVE' };

          await setSubscriptionStatus(status);
        };

        await Promise.race([init(), timeout]);
      } catch (error) {
        console.error('Failed to initialize subscription status:', error);
        if (!cancelled) {
          try { await setSubscriptionStatus({ status: 'INACTIVE' }); } catch (_) {}
        }
      }
    };

    initializeSubscriptionStatus();
    SuperwallExpoModule.setInterfaceStyle('DARK');

    return () => { cancelled = true; };
  }, [setSubscriptionStatus]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SuperwallProvider
        apiKeys={{ ios: "pk_-w27jLL0CBIyfAFdcSG3Z", android: "pk_1XJ62ooPiSXsAdIGSOkT_" }}
        options={{
          logging: {
            level: 'warn',
            scopes: ['all'],
          },
        }}
      >
        <SafeAreaProvider>
          <NavigationContainer>
            <SubscriptionStatusInitializer />
            <LoginScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      </SuperwallProvider>
    </ErrorBoundary>
  );
}
