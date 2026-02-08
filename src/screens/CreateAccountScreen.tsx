import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { colors } from '../theme/colors';
import { supabase, upsertProfile } from '../lib/supabase';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useSuperwall } from 'expo-superwall';

interface CreateAccountScreenProps {
  onComplete: () => void;
}

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ onComplete }) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const insets = useSafeAreaInsets();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const superwall = useSuperwall();

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;

        if (!idToken) {
          throw new Error('No ID token returned from Google Sign-In');
        }

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          console.error('Supabase auth error:', error);
          Alert.alert('Sign In Error', error.message);
          return;
        }

        if (data.session && data.user) {
          console.log('Successfully signed in with Google!', data.user.email);

          // Get Superwall user ID
          let superwallCustomerId: string | null = null;
          try {
            superwallCustomerId = await superwall.getUserId();
          } catch (e) {
            console.warn('Could not get Superwall user ID:', e);
          }

          // Upsert profile with Superwall customer ID
          const profileResult = await upsertProfile({
            id: data.user.id,
            email: data.user.email ?? null,
            full_name: data.user.user_metadata?.full_name ?? null,
            avatar_url: data.user.user_metadata?.avatar_url ?? null,
            superwall_customer_id: superwallCustomerId,
            subscription_status: 'active',
          });

          if (!profileResult.success) {
            console.error('Profile upsert failed:', profileResult.error);
          }

          // Link Superwall to the authenticated user
          try {
            await superwall.identify(data.user.id);
          } catch (e) {
            console.warn('Could not identify Superwall user:', e);
          }

          onComplete();
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log('Sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services is not available on this device');
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled sign-in');
            break;
          default:
            Alert.alert('Sign In Error', error.message || 'An unknown error occurred');
        }
      } else {
        Alert.alert('Sign In Error', error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Top section with icon and text */}
          <View style={styles.topSection}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🎉</Text>
            </View>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Sign in to save your progress and access your subscription across devices.
            </Text>
          </View>

          {/* Bottom section with button */}
          <View style={[styles.bottomSection, { paddingBottom: 28 + insets.bottom }]}>
            <TouchableOpacity
              style={[styles.googleButton, isSigningIn && styles.googleButtonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isSigningIn}
              activeOpacity={0.9}
            >
              {isSigningIn ? (
                <ActivityIndicator size="small" color={colors.background} style={styles.buttonIcon} />
              ) : (
                <Image
                  source={require('../../assets/logos/googleLogo.png')}
                  style={styles.googleLogo}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.googleButtonText}>
                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              By continuing, you agree to Hustlingo's{' '}
              <Text style={styles.footerLink}>Terms and Conditions</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 40,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 12,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
    color: colors.text.primary,
  },
});
