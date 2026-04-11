import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors } from '../../theme/colors';
import { SignInScreenData } from '../types';
import { QuestionnaireScreenWrapper } from '../components';
import { Button } from '../../components/Button';
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
  const insets = useSafeAreaInsets();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAppleSigningIn, setIsAppleSigningIn] = useState(false);
  const superwall = useSuperwall();

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

          try {
            await superwall.identify(authData.user.id);
            console.log('[CREATE ACCOUNT] ✅ Superwall identified with user ID');
          } catch (e) {
            console.warn('[CREATE ACCOUNT] ⚠️ Could not identify Superwall user:', e);
          }

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

  const handleAppleSignIn = async () => {
    try {
      setIsAppleSigningIn(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token returned from Apple Sign-In');
      }

      const { data: authData, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        Alert.alert('Sign In Error', error.message);
        return;
      }

      if (authData.session && authData.user) {
        console.log('========================================');
        console.log('[CREATE ACCOUNT] ✅ Apple Sign-In successful');
        console.log('[CREATE ACCOUNT] Email:', authData.user.email);
        console.log('[CREATE ACCOUNT] User ID:', authData.user.id);

        try {
          await superwall.identify(authData.user.id);
          console.log('[CREATE ACCOUNT] ✅ Superwall identified with user ID');
        } catch (e) {
          console.warn('[CREATE ACCOUNT] ⚠️ Could not identify Superwall user:', e);
        }

        let fullName: string | null = authData.user.user_metadata?.full_name ?? null;
        if (credential.fullName) {
          const nameParts = [];
          if (credential.fullName.givenName) nameParts.push(credential.fullName.givenName);
          if (credential.fullName.middleName) nameParts.push(credential.fullName.middleName);
          if (credential.fullName.familyName) nameParts.push(credential.fullName.familyName);

          const appleName = nameParts.join(' ');
          if (appleName) {
            fullName = appleName;
            await supabase.auth.updateUser({
              data: {
                full_name: fullName,
                given_name: credential.fullName.givenName,
                family_name: credential.fullName.familyName,
              },
            });
          }
        }

        const profileData = {
          id: authData.user.id,
          email: authData.user.email ?? null,
          full_name: fullName,
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

        console.log('[CREATE ACCOUNT] ✅ Account creation complete, continuing questionnaire');
        console.log('========================================');

        onContinue();
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User cancelled Apple sign-in');
      } else {
        console.error('Apple Sign-In error:', error);
        Alert.alert('Sign In Error', error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsAppleSigningIn(false);
    }
  };

  const googleIcon = (
    <Image
      source={require('../../../assets/logos/googleLogo.png')}
      style={styles.googleLogo}
      resizeMode="contain"
    />
  );

  const googleLoader = (
    <ActivityIndicator size="small" color={colors.background} />
  );

  const appleIcon = (
    <Ionicons name="logo-apple" size={20} color="#000000" />
  );

  const appleLoader = (
    <ActivityIndicator size="small" color="#000000" />
  );

  return (
    <QuestionnaireScreenWrapper
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={handleGoogleSignIn}
      hideButton
    >
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.iconText}>🎉</Text>
          <Text style={styles.title}>
            {data.title || 'Create your account'}
          </Text>
          <Text style={styles.subtitle}>
            {data.subtitle || 'Sign in to save your progress and unlock your personalized plan.'}
          </Text>
        </View>

        <View style={[styles.buttonSection, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            title={isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            onPress={handleGoogleSignIn}
            variant="primary"
            size="large"
            fullWidth
            disabled={isSigningIn}
            loading={isSigningIn}
            leftIcon={!isSigningIn ? googleIcon : undefined}
          />

          {Platform.OS === 'ios' && (
            <View style={styles.appleButtonWrapper}>
              <Button
                title={isAppleSigningIn ? 'Signing in...' : 'Sign in with Apple'}
                onPress={handleAppleSignIn}
                variant="secondary"
                size="large"
                fullWidth
                disabled={isAppleSigningIn}
                loading={isAppleSigningIn}
                leftIcon={!isAppleSigningIn ? appleIcon : undefined}
              />
            </View>
          )}

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
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconText: {
    fontSize: 48,
    marginBottom: 20,
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
    gap: 0,
  },
  appleButtonWrapper: {
    marginTop: 12,
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
  footerLink: {
    textDecorationLine: 'underline',
    color: colors.text.primary,
  },
});
