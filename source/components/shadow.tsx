import { colors } from "./colors";

export const shadowStyles = {
  // 1. Soft & subtle (great for cards, buttons)
  softShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8, // Android
  },

  // 2. Medium depth – very popular in modern UI (Material Design / Neumorphism feel)
  mediumShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },

  // 3. Strong but still soft – for floating cards, modals, etc.
  strongShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    shadowOpacity: 0.15,
    elevation: 20,
  },

  // 4. Extra soft “floating” shadow (very blurred, modern iOS-style)
  floatingShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 16,
  },

  // 5. Darker & more dramatic (if you want real depth)
  deepShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 24,
  },
};