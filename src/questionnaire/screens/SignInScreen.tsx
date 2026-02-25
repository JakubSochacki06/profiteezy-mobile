import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { SignInScreenData } from '../types';
import { QuestionnaireScreenWrapper } from '../components';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase, upsertProfile } from '../../lib/supabase';
import { useSuperwall } from 'expo-superwall';

interface SignInScreenProps {
  data: SignInScreenData;
  onContinue: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  data,
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const superwall = useSuperwall();

  // Auto-skip if user is already signed in (e.g. from "I already have an account")
  useEffect(() => {
    const checkExistingAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('User already signed in, skipping sign-in step');
        onContinue();
      }
    };
    checkExistingAuth();
  }, []);

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
        const { data: authData, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          console.error('Supabase auth error:', error);
          Alert.alert('Sign In Error', error.message);
          return;
        }

        if (authData.session && authData.user) {
          console.log('========================================');
          console.log('[CREATE ACCOUNT] ✅ Google Sign-In successful');
          console.log('[CREATE ACCOUNT] Email:', authData.user.email);
          console.log('[CREATE ACCOUNT] User ID:', authData.user.id);
          console.log('[CREATE ACCOUNT] Full name:', authData.user.user_metadata?.full_name);
          console.log('[CREATE ACCOUNT] Avatar URL:', authData.user.user_metadata?.avatar_url);

          // Link Superwall to the authenticated user before saving profile metadata.
          try {
            await superwall.identify(authData.user.id);
            console.log('[CREATE ACCOUNT] ✅ Superwall identified with user ID');
          } catch (e) {
            console.warn('[CREATE ACCOUNT] ⚠️ Could not identify Superwall user:', e);
          }

          // Upsert profile (subscription_status stays inactive until paywall)
          const profileData = {
            id: authData.user.id,
            email: authData.user.email ?? null,
            full_name: authData.user.user_metadata?.full_name ?? null,
            avatar_url: authData.user.user_metadata?.avatar_url ?? null,
            superwall_customer_id: authData.user.id,
            subscription_status: 'inactive',
            points: 0,
          };
          console.log('[CREATE ACCOUNT] Upserting profile to Supabase:', JSON.stringify(profileData, null, 2));

          const profileResult = await upsertProfile(profileData);

          if (profileResult.success) {
            console.log('[CREATE ACCOUNT] ✅ Profile upserted successfully');
          } else {
            console.error('[CREATE ACCOUNT] ❌ Profile upsert FAILED:', profileResult.error);
          }

          // Verify: read back the profile from Supabase
          try {
            const { data: savedProfile, error: readError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (readError) {
              console.error('[CREATE ACCOUNT] ❌ Could not read back profile:', readError);
            } else {
              console.log('[CREATE ACCOUNT] 📋 Profile in Supabase after upsert:', JSON.stringify(savedProfile, null, 2));
            }
          } catch (e) {
            console.error('[CREATE ACCOUNT] ❌ Error reading back profile:', e);
          }

          console.log('[CREATE ACCOUNT] ✅ Account creation complete, continuing questionnaire');
          console.log('========================================');

          // Continue to next questionnaire step
          onContinue();
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

  return (
    <QuestionnaireScreenWrapper
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={handleGoogleSignIn}
      hideButton
    >
      <View style={styles.content}>
        {/* Top section with icon and text */}
        <View style={styles.topSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🎉</Text>
          </View>
          <Text style={styles.title}>
            {data.title || 'Create your account'}
          </Text>
          <Text style={styles.subtitle}>
            {data.subtitle || 'Sign in to save your progress and unlock your personalized plan.'}
          </Text>
        </View>

        {/* Sign in button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.googleButton, isSigningIn && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
            activeOpacity={0.7}
          >
            {isSigningIn ? (
              <ActivityIndicator size="small" color={colors.text.primary} style={styles.buttonIcon} />
            ) : (
              <Image
                source={require('../../../assets/logos/googleLogo.png')}
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
    </QuestionnaireScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 32,
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
  buttonSection: {
    paddingHorizontal: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
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
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
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
