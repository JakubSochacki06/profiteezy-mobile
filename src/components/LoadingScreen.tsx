import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import { colors } from '../theme/colors';

interface LoadingIndicatorProps {
  /** Font size of the $ sign. Default 120 */
  size?: number;
}

/**
 * Animated $ sign that fills with accent color.
 * Use this inline inside any layout (e.g. below a header).
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 120 }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const dollarHeight = size * 1.17; // line-height ratio

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        // Fill from bottom to top
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        // Brief pause at top
        Animated.delay(150),
        // Drain from top to bottom
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        // Brief pause at bottom
        Animated.delay(150),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [fillAnim]);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dollarHeight],
  });

  return (
    <View style={[styles.dollarWrapper, { width: size, height: dollarHeight }]}>
      {/* Base $ sign (dim / unfilled) */}
      <Text style={[styles.dollarBase, { fontSize: size, lineHeight: dollarHeight }]}>$</Text>

      {/* Animated color fill clipped from bottom */}
      <Animated.View style={[styles.fillClip, { height: fillHeight }]}>
        <Text style={[styles.dollarFilled, { fontSize: size, lineHeight: dollarHeight }]}>$</Text>
      </Animated.View>
    </View>
  );
};

/**
 * Full-screen loading screen with the animated $ sign.
 * Use this as a top-level screen replacement.
 */
export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <LoadingIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dollarWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dollarBase: {
    fontWeight: '900',
    color: colors.border,
    textAlign: 'center',
  },
  fillClip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  dollarFilled: {
    fontWeight: '900',
    color: colors.accent,
    textAlign: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
