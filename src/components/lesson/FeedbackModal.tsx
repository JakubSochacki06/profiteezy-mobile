import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated as RNAnimated, Pressable, Image } from 'react-native';
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

// Constants for 3D button effect
const BUTTON_DEPTH = 5;
const PRIMARY_SHADOW_SUCCESS = '#419702'; // Darker green
const PRIMARY_SHADOW_ERROR = '#B91C1C'; // Darker red
const SECONDARY_SHADOW = '#1F2126'; // Dark shadow

// 3D Button component for modal
interface Button3DProps {
  title: string;
  onPress: () => void;
  backgroundColor: string;
  shadowColor: string;
  textColor: string;
  flex?: number;
  borderColor?: string;
}

const Button3D: React.FC<Button3DProps> = ({ 
  title, 
  onPress, 
  backgroundColor, 
  shadowColor, 
  textColor,
  flex = 1,
  borderColor,
}) => {
  const translateY = useRef(new RNAnimated.Value(0)).current;

  const handlePressIn = () => {
    RNAnimated.timing(translateY, {
      toValue: BUTTON_DEPTH,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    RNAnimated.timing(translateY, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.button3dContainer, { flex }, flex === 0 && { minWidth: 80 }]}
    >
      {/* Shadow layer */}
      <View style={[styles.button3dShadow, { backgroundColor: shadowColor }]} />
      
      {/* Face layer */}
      <RNAnimated.View 
        style={[
          styles.button3dFace, 
          { 
            backgroundColor,
            borderColor: borderColor,
            borderWidth: borderColor ? 1 : 0,
            transform: [{ translateY }] 
          }
        ]}
      >
        <Text style={[styles.button3dText, { color: textColor }]}>{title}</Text>
      </RNAnimated.View>
    </Pressable>
  );
};

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
  
  // Freeze the isCorrect value when modal becomes visible
  // This prevents showing "Incorrect" during close animation when state resets
  const [frozenIsCorrect, setFrozenIsCorrect] = useState(isCorrect);

  useEffect(() => {
    if (isVisible) {
      // Capture the correct state when modal opens
      setFrozenIsCorrect(isCorrect);
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
  }, [isVisible, isCorrect]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!isVisible && translateY.value === 300) return null;

  // Use frozen value to prevent flicker during close animation
  const isSuccess = frozenIsCorrect;
  
  // Background is always surface color to fit dark theme
  const backgroundColor = colors.surface;
  
  // Status Colors (for text and icons)
  const statusColor = isSuccess ? '#FFFFFF' : colors.error;
  
  // Button colors for 3D effect
  const buttonBg = isSuccess ? colors.accent : (canRetry ? colors.error : colors.accent);
  const buttonShadow = isSuccess ? PRIMARY_SHADOW_SUCCESS : (canRetry ? PRIMARY_SHADOW_ERROR : PRIMARY_SHADOW_SUCCESS);
  const buttonText = '#FFFFFF';

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
          {isSuccess ? (
            <Image 
              source={require('../../../assets/confetti-icon.png')}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons 
              name="close-circle" 
              size={32} 
              color={statusColor} 
            />
          )}
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
        
        <Pressable style={styles.flagButton}>
          <Ionicons name="flag-outline" size={20} color={colors.text.tertiary} />
        </Pressable>
      </View>

      <View style={styles.actions}>
        {/* Primary action button with 3D effect */}
        <Button3D
          title={isSuccess || !canRetry ? "Continue" : "Try Again"}
          onPress={isSuccess || !canRetry ? onNext : onRetry}
          backgroundColor={buttonBg}
          shadowColor={buttonShadow}
          textColor={buttonText}
        />
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
  // 3D Button styles
  button3dContainer: {
    height: 56 + BUTTON_DEPTH,
    position: 'relative',
  },
  button3dShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: BUTTON_DEPTH,
    height: 56,
    borderRadius: 16,
  },
  button3dFace: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  button3dText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
});
