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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { colors } from '../theme/colors';
import { QuestionnaireNavigator, questionnaireData, QuestionnaireResult } from '../questionnaire';

const { width, height } = Dimensions.get('window');

interface Bubble {
  id: number;
  angle: number;
  radius: number;
  opacity: Animated.Value;
  scale: Animated.Value;
}

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

  const handleGetStarted = () => {
    setShowQuestionnaire(true);
  };

  const handleQuestionnaireComplete = (results: QuestionnaireResult) => {
    console.log('Questionnaire completed with results:', results);
    // TODO: Save results and navigate to main app
    // You can store these results in your backend or local storage
    // Then navigate to the main app screen
  };

  const handleSignIn = () => {
    // TODO: Navigate to sign in
    console.log('Sign in pressed');
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
});
