export const colors = {
  brand: '#40E0D0',
  black: '#1A1A1A',
  white: '#FFFFFF',
  red: '#FF6B6B',
  orange: '#F59E0B',
  gray: '#808080',
  blur: (opacity: number = 0.6) => `rgba(255,255,255,${opacity})`
} as const;