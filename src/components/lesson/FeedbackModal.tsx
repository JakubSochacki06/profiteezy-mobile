import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface FeedbackModalProps {
  isVisible: boolean;
  isCorrect: boolean;
  onNext: () => void;
  onRetry: () => void;
  canRetry: boolean;
  points?: number;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isVisible,
  isCorrect,
  onNext,
  onRetry,
  canRetry,
  points = 10,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(300); // Start off-screen

  useEffect(() => {
    if (isVisible) {
      // Subtle push from bottom
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = withTiming(300, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!isVisible && translateY.value === 300) return null;

  // Design tokens
  const isSuccess = isCorrect;
  
  // Background is always surface color to fit dark theme
  const backgroundColor = colors.surface;
  
  // Status Colors (for text and icons)
  const statusColor = isSuccess ? colors.success : colors.error;
  
  // Button Colors
  // Primary Action: Always Accent color for consistency, or Error color for "Try Again"?
  // Usually "Try Again" is also a primary action, but using Accent everywhere keeps it cohesive.
  // However, "Try Again" in red might be clearer. Let's stick to the user request: "make the continue button accent".
  // I'll make the primary button Accent for success, and maybe keep it Accent or Error for retry. 
  // Let's try Accent for both to keep the "theme" request, or maybe Error for retry to signal state.
  // User said "make the continue button accent", implies Success state. 
  // For consistency, let's use Accent for success, and Error for Retry to clearly distinguish.
  const buttonBg = isSuccess ? colors.accent : (canRetry ? colors.error : colors.accent);
  const buttonText = '#FFFFFF'; // White text on colored buttons
  
  // Secondary Button (Why?)
  const secondaryBorder = colors.border;
  const secondaryText = colors.text.secondary;

  return (
    <Animated.View style={[
      styles.container, 
      animatedStyle, 
      { 
        backgroundColor,
        paddingBottom: insets.bottom + 20 
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={isSuccess ? "checkmark-circle" : "close-circle"} 
            size={32} 
            color={statusColor} 
          />
          <Text style={[styles.title, { color: statusColor }]}>
            {isSuccess ? "Correct!" : "Incorrect"}
          </Text>
        </View>
        
        {isSuccess && (
          <View style={styles.pointsContainer}>
            <Ionicons name="sparkles" size={16} color={colors.accent} />
            <Text style={[styles.pointsText, { color: colors.accent }]}>+{points} XP</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.flagButton}>
          <Ionicons name="flag-outline" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {/* Placeholder for explanation/Why button */}
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: secondaryBorder }]}>
          <Text style={[styles.secondaryButtonText, { color: secondaryText }]}>Why?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: buttonBg }]}
          onPress={isSuccess || !canRetry ? onNext : onRetry}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, { color: buttonText }]}>
            {isSuccess || !canRetry ? "Continue" : "Try Again"}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 24,
    zIndex: 1000, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 16,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  flagButton: {
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  secondaryButton: {
    width: 80,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
});
