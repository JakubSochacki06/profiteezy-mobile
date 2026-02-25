import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  Pressable,
} from 'react-native';
import { colors } from '../theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

// Shadow colors for the 3D depth effect
const SHADOW_COLORS: Record<ButtonVariant, string> = {
  primary: '#419702', // Darker green for accent
  secondary: '#1F2126', // Dark shadow for surface
  outline: '#419702', // Darker accent for outline
  ghost: 'transparent', // No shadow for ghost
};

const DISABLED_SHADOW_COLORS: Record<ButtonVariant, string> = {
  primary: '#27272A', // Dark gray for disabled shadow
  secondary: '#1F2126',
  outline: '#1F2126',
  ghost: 'transparent',
};

// Depth values for different sizes
const DEPTH_VALUES: Record<ButtonSize, number> = {
  small: 4,
  medium: 5,
  large: 6,
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const depth = DEPTH_VALUES[size];
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.timing(translateY, {
      toValue: depth,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const shadowColor = SHADOW_COLORS[variant];
  const isGhost = variant === 'ghost';
  const isInactive = disabled || loading;

  const containerStyle = [
    styles.container,
    fullWidth && styles.containerFullWidth,
    style,
  ];

  const wrapperStyle = [
    styles.wrapper,
    styles[`wrapper_${size}`],
  ];

  const shadowStyle = [
    styles.shadow,
    styles[`shadow_${size}`],
    {
      backgroundColor: isInactive ? DISABLED_SHADOW_COLORS[variant] : shadowColor,
      top: depth,
    },
  ];

  const faceStyle = [
    styles.face,
    styles[`face_${variant}`],
    styles[`face_${size}`],
    isInactive && styles[`faceDisabled_${variant}`],
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    isInactive && styles[`textDisabled_${variant}`],
    textStyle,
  ];

  // Ghost variant doesn't need the 3D effect
  if (isGhost) {
    return (
      <Pressable
        style={[styles.ghostButton, styles[`ghostButton_${size}`], fullWidth && styles.containerFullWidth, style]}
        onPress={onPress}
        disabled={isInactive}
      >
        {loading ? (
          <ActivityIndicator
            color={colors.text.primary}
            size="small"
          />
        ) : (
          <>
            {leftIcon && <>{leftIcon}</>}
            <Text style={textStyles}>{title}</Text>
            {rightIcon && <>{rightIcon}</>}
          </>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isInactive}
      style={containerStyle}
    >
      <View style={wrapperStyle}>
        {/* Shadow layer (the bottom "depth") */}
        <View style={shadowStyle} />

        {/* Face layer (the actual button surface) */}
        <Animated.View style={[faceStyle, { transform: [{ translateY }] }]}>
          {loading ? (
            <ActivityIndicator
              color={variant === 'primary' ? colors.background : colors.accent}
              size="small"
            />
          ) : (
            <>
              {leftIcon && <>{leftIcon}</>}
              <Text style={textStyles}>{title}</Text>
              {rightIcon && <>{rightIcon}</>}
            </>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  containerFullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  wrapper: {
    position: 'relative',
  },
  wrapper_small: {
    height: 36 + DEPTH_VALUES.small,
  },
  wrapper_medium: {
    height: 48 + DEPTH_VALUES.medium,
  },
  wrapper_large: {
    height: 56 + DEPTH_VALUES.large,
  },
  // Shadow (depth layer)
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 12,
  },
  shadow_small: {
    height: 36,
    borderRadius: 10,
  },
  shadow_medium: {
    height: 48,
    borderRadius: 12,
  },
  shadow_large: {
    height: 56,
    borderRadius: 14,
  },
  // Face (button surface)
  face: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Variants
  face_primary: {
    backgroundColor: colors.accent,
  },
  face_secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  face_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  face_ghost: {
    backgroundColor: 'transparent',
  },
  // Sizes
  face_small: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  face_medium: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  face_large: {
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  faceDisabled_primary: {
    backgroundColor: '#3F3F46', // Dark gray for disabled state
    borderWidth: 1,
    borderColor: colors.border,
  },
  faceDisabled_secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faceDisabled_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
  },
  faceDisabled_ghost: {
    backgroundColor: 'transparent',
  },
  // Text styles
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  text_primary: {
    color: colors.background,
  },
  text_secondary: {
    color: colors.text.primary,
  },
  text_outline: {
    color: colors.accent,
  },
  text_ghost: {
    color: colors.text.primary,
  },
  textDisabled_primary: {
    color: colors.text.secondary, // Muted text for disabled
  },
  textDisabled_secondary: {
    color: colors.text.tertiary,
  },
  textDisabled_outline: {
    color: colors.text.tertiary,
  },
  textDisabled_ghost: {
    color: colors.text.tertiary,
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  // Ghost button (flat, no 3D effect)
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  ghostButton_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  ghostButton_medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  ghostButton_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
});
