import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'error' | 'success';

interface TypographyProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  style?: TextStyle;
  bold?: boolean;
  italic?: boolean;
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  style,
  bold = false,
  italic = false,
  numberOfLines,
}) => {
  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`color_${color}`],
    bold && styles.bold,
    italic && styles.italic,
    style,
  ];

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Inter_400Regular',
  },
  // Variants
  text_h1: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    lineHeight: 40,
  },
  text_h2: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    lineHeight: 32,
  },
  text_h3: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    lineHeight: 28,
  },
  text_body: {
    fontSize: 16,
    lineHeight: 24,
  },
  text_caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  text_label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  // Colors
  color_primary: {
    color: colors.text.primary,
  },
  color_secondary: {
    color: colors.text.secondary,
  },
  color_tertiary: {
    color: colors.text.tertiary,
  },
  color_accent: {
    color: colors.accent,
  },
  color_error: {
    color: colors.error,
  },
  color_success: {
    color: colors.success,
  },
  bold: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
});
