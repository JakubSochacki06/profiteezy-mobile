/**
 * Centralized color palette for the app
 * 
 * Usage:
 * import { colors } from '../theme/colors';
 * 
 * backgroundColor: colors.background
 * backgroundColor: colors.surface
 * color: colors.accent
 */

export const colors = {
  // Primary background color (main app background)
  background: '#1D1D1D',
  
  // Surface color (buttons, cards, elevated surfaces)
  surface: '#292929',
  
  // Accent color (highlights, CTAs, important elements)
  accent: '#5FCB0F',
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
  },
  
  // Border colors
  border: '#27272A',
  
  // Additional semantic colors
  success: '#5FCB0F',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// Type export for TypeScript
export type Colors = typeof colors;
