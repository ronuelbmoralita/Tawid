import { colors } from "./colors";

export const shadowStyles = {
  // 1. Soft & subtle (great for cards, buttons)
  softShadow: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4, // Android
  },

  // 2. Medium depth – very popular in modern UI (Material Design / Neumorphism feel)
  mediumShadow: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  // 3. Strong but still soft – for floating cards, modals, etc.
  strongShadow: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.15,
    elevation: 16,
  },

  // 4. Extra soft “floating” shadow (very blurred, modern iOS-style)
  floatingShadow: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },

  // 5. Darker & more dramatic (if you want real depth)
  deepShadow: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },

  // 6. Shadow on TOP (for floating cards above content)
  topShadow: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  // 7. Shadow on BOTH top and bottom
  bothShadow: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
};