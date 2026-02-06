import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Easing,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { colors } from '../theme/colors';
import { QuestionnaireNavigator, questionnaireData, QuestionnaireResult } from '../questionnaire';
import { usePaywall } from '../hooks/usePaywall';
import { MainTabNavigator } from '../navigation';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

interface Bubble {
  id: number;
  angle: number;
  radius: number;
  opacity: Animated.Value;
  scale: Animated.Value;
}

// Configure Google Sign-In - you need to get the webClientId from Google Cloud Console
// Go to https://console.cloud.google.com/apis/credentials and create an OAuth 2.0 Client ID
// For Expo/React Native, you need a Web application type client ID
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

GoogleSignin.configure({
  // webClientId is REQUIRED for getting the idToken needed for Supabase auth
  webClientId: googleWebClientId,
  // Only enable offlineAccess if webClientId is provided (it requires server auth)
  offlineAccess: false,
  // Request scopes for user profile info
  scopes: ['profile', 'email'],
});

export const LoginScreen = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const insets = useSafeAreaInsets();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleIdRef = useRef(0);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showHome, setShowHome] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSignInModal) {
      // Animate In
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSignInModal]);

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSignInModal(false);
    });
  };

  const { showPaywall } = usePaywall({
    placement: 'onboarding_complete',
    onDismiss: (result) => {
      if (result.type === 'purchased' || result.type === 'restored') {
        setShowHome(true);
        setShowQuestionnaire(false);
      }
    },
    onSkip: () => {
      setShowHome(true);
      setShowQuestionnaire(false);
    },
  });

  const handleGetStarted = () => {
    setShowQuestionnaire(true);
  };

  const handleQuestionnaireComplete = (results: QuestionnaireResult) => {
    console.log('Questionnaire completed with results:', results);
    showPaywall();
  };

  const handleSignIn = () => {
    setShowSignInModal(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();
      
      // Perform the Google Sign-In
      const response = await GoogleSignin.signIn();
      
      if (isSuccessResponse(response)) {
        // Get the ID token from the response
        const idToken = response.data.idToken;
        
        if (!idToken) {
          throw new Error('No ID token returned from Google Sign-In');
        }
        
        // Sign in with Supabase using the ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        
        if (error) {
          console.error('Supabase auth error:', error);
          Alert.alert('Sign In Error', error.message);
          return;
        }
        
        if (data.session) {
          console.log('Successfully signed in with Google!', data.user?.email);
          // Close the modal and navigate to home
          handleCloseModal();
          setShowHome(true);
        }
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // Sign-in is already in progress
            console.log('Sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services is not available on this device');
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            // User cancelled the sign-in flow
            console.log('User cancelled sign-in');
            break;
          default:
            console.error('Google Sign-In error:', error);
            Alert.alert('Sign In Error', 'An error occurred during Google Sign-In');
        }
      } else {
        console.error('Unknown error:', error);
        Alert.alert('Sign In Error', error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  useEffect(() => {
    if (!fontsLoaded) return;

    const createBubble = () => {
      const id = bubbleIdRef.current++;
      // Avoid angles that would place bubbles on far left/right (90 degrees on each side)
      // This excludes angles from -45 to 45 degrees (right) and 135 to 225 degrees (left)
      let angle;
      do {
        angle = Math.random() * Math.PI * 2;
      } while (
        (angle > -Math.PI / 4 && angle < Math.PI / 4) || // Right side
        (angle > (3 * Math.PI) / 4 && angle < (5 * Math.PI) / 4) // Left side
      );
      
      // Randomly choose which circle (outer or inner)
      const circleRadius = Math.random() > 0.5 ? (width * 1.1) / 2 : (width * 0.7) / 2;
      const radius = circleRadius;
      const opacity = new Animated.Value(0);
      const scale = new Animated.Value(0);

      const bubble: Bubble = { id, angle, radius, opacity, scale };

      // Animate bubble appearing
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate bubble disappearing after 2 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setBubbles((prev) => prev.filter((b) => b.id !== id));
        });
      }, 2000);

      setBubbles((prev) => [...prev, bubble]);
    };

    // Create initial bubbles after a short delay
    const initialTimeout = setTimeout(() => {
      createBubble();
    }, 1000);
    
    // Create bubbles periodically
    const periodicInterval = setInterval(createBubble, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(periodicInterval);
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  // Show Main Tab Navigator if user has completed onboarding and paywall
  if (showHome) {
    return <MainTabNavigator />;
  }

  // Show questionnaire if user clicked Get Started
  if (showQuestionnaire) {
    return (
      <QuestionnaireNavigator
        data={questionnaireData}
        onComplete={handleQuestionnaireComplete}
      />
    );
  }

  const getBubblePosition = (bubble: Bubble) => {
    const containerSize = width * 1.1;
    const centerX = containerSize / 2;
    const centerY = containerSize / 2;
    const x = centerX + Math.cos(bubble.angle) * bubble.radius - 20;
    const y = centerY + Math.sin(bubble.angle) * bubble.radius - 20;
    return { x, y };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with App Name Placeholder */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>Profiteezy</Text>
          </View>
          {/* Sneaky Debug Button - Remove in production */}
          <TouchableOpacity 
            onPress={() => setShowHome(true)}
            style={styles.debugButton}
            activeOpacity={0.7}
          >
            <Text style={styles.debugButtonText}>🏠</Text>
          </TouchableOpacity>
        </View>

        {/* Concentric Circles with Dollar Sign */}
        <View style={styles.centerContainer}>
          <View style={styles.circleContainer}>
            {/* Outer circles */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            
            {/* Money bubbles */}
            {bubbles.map((bubble) => {
              const position = getBubblePosition(bubble);
              return (
                <Animated.View
                  key={bubble.id}
                  style={[
                    styles.bubble,
                    {
                      left: position.x,
                      top: position.y,
                      opacity: bubble.opacity,
                      transform: [{ scale: bubble.scale }],
                    },
                  ]}
                >
                  <Image 
                    source={require('../../assets/money-icon.png')} 
                    style={styles.bubbleImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              );
            })}
            
            {/* Center circle with laptop image */}
            <View style={styles.centerCircle}>
              <Image 
                source={require('../../assets/laptop-icon.png')} 
                style={styles.centerImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Title Text - Outside bottom container */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            <Text style={styles.titleBold}>Start Earning Money </Text>
            <Text style={styles.titleItalic}>online </Text>
            <Text style={styles.titleAccent}>Now</Text>
          </Text>
        </View>

        {/* Bottom Content */}
        <View style={[styles.bottomContainer, { paddingBottom: 28 + insets.bottom }]}>
          <View style={styles.bottomContent}>
            {/* Get Started Button */}
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text style={styles.getStartedText}>Get started</Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity 
              onPress={handleSignIn}
              activeOpacity={0.7}
            >
              <Text style={styles.signInText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Sign In Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={showSignInModal}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <Animated.View 
            style={[
              styles.modalOverlay,
              {
                backgroundColor: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)'],
                }),
              }
            ]}
          >
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.modalContent, 
                  { 
                    paddingBottom: insets.bottom + 20,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Sign in</Text>
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={handleCloseModal}
                  >
                    <Ionicons name="close" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Sign In Options */}
                <View style={styles.modalBody}>
                  <TouchableOpacity 
                    style={[styles.authButton, isGoogleSigningIn && styles.authButtonDisabled]}
                    onPress={handleGoogleSignIn}
                    disabled={isGoogleSigningIn}
                    activeOpacity={0.7}
                  >
                    {isGoogleSigningIn ? (
                      <ActivityIndicator size="small" color={colors.text.primary} style={styles.authIcon} />
                    ) : (
                      <Image 
                        source={require('../../assets/logos/googleLogo.png')} 
                        style={styles.googleLogo}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={styles.authButtonText}>
                      {isGoogleSigningIn ? 'Signing in...' : 'Sign in with Google'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.authButton}>
                    <Ionicons name="mail" size={20} color={colors.text.primary} style={styles.authIcon} />
                    <Text style={styles.authButtonText}>Sign in with Email</Text>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.modalFooter}>
                  <Text style={styles.footerText}>
                    By continuing, you agree to Profiteezy's{' '}
                    <Text style={styles.footerLink}>Terms and Conditions</Text> and{' '}
                    <Text style={styles.footerLink}>Privacy Policy</Text>
                  </Text>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 40,
    paddingBottom: 10,
  },
  logoPlaceholder: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  circleContainer: {
    width: width * 1.1,
    height: width * 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
  },
  circle1: {
    width: width * 1.1,
    height: width * 1.1,
  },
  circle2: {
    width: width * 0.7,
    height: width * 0.7,
  },
  bubble: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleImage: {
    width: 24,
    height: 24,
  },
  centerCircle: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  centerImage: {
    width: 60,
    height: 60,
  },
  bottomContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  bottomContent: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 40,
  },
  titleBold: {
    fontFamily: 'Inter_700Bold',
  },
  titleItalic: {
    fontFamily: 'Inter_500Medium',
    fontStyle: 'italic',
  },
  titleAccent: {
    fontFamily: 'Inter_700Bold',
    color: colors.accent,
  },
  getStartedButton: {
    backgroundColor: colors.accent,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  getStartedText: {
    color: colors.background,
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  signInText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
  },
  debugButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  debugButtonText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.primary,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
    backgroundColor: colors.border,
    borderRadius: 20,
  },
  modalBody: {
    gap: 16,
    marginBottom: 32,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: 'transparent',
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authIcon: {
    marginRight: 12,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.primary,
  },
  modalFooter: {
    alignItems: 'center',
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
