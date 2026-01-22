// Theme system for SerikaCord - Clean Black and Purple theme

export const THEME_COLORS = {
  // Primary brand colors
  brand: {
    primary: '#8B5CF6',    // Serika purple
    secondary: '#7C3AED',  // Darker purple (hover)
    accent: '#A78BFA',     // Light purple accent
    premium: '#8B5CF6',    // Serika+ purple
  },
  
  // Status colors
  status: {
    online: '#8B5CF6',
    idle: '#A78BFA',
    dnd: '#EF4444',
    offline: '#555555',
    streaming: '#8B5CF6',
  },
  
  // Semantic colors
  semantic: {
    success: '#8B5CF6',
    warning: '#A78BFA',
    error: '#EF4444',
    info: '#8B5CF6',
  },
  
  // Dark theme palette (Black + Purple)
  dark: {
    background: {
      primary: '#000000',
      secondary: '#0a0a0a',
      tertiary: '#111111',
      floating: '#0a0a0a',
      accent: '#111111',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#888888',
      muted: '#666666',
      link: '#8B5CF6',
    },
    interactive: {
      normal: '#888888',
      hover: '#FFFFFF',
      active: '#FFFFFF',
      muted: '#555555',
    },
    border: {
      subtle: '#1a1a1a',
      strong: '#222222',
    },
  },
  
  // Light theme palette (for future - kept minimal)
  light: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F2F2F2',
      tertiary: '#E5E5E5',
      floating: '#FFFFFF',
      accent: '#F0F0F0',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
      muted: '#666666',
      link: '#8B5CF6',
    },
    interactive: {
      normal: '#333333',
      hover: '#000000',
      active: '#000000',
      muted: '#999999',
    },
    border: {
      subtle: '#E5E5E5',
      strong: '#CCCCCC',
    },
  },
} as const;

// Animation presets
export const ANIMATIONS = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
} as const;

// Spacing system
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// Border radius
export const RADIUS = {
  none: '0',
  sm: '3px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
  
  // Special cases
  serverIcon: {
    default: '24px',
    hover: '16px',
    active: '16px',
  },
  avatar: {
    small: '50%',
    large: '8px',
  },
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    sans: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Z-index layers
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  toast: 1500,
} as const;

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  
  // Discord-like shadows
  elevated: '0 8px 16px rgba(0, 0, 0, 0.24)',
  popup: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.24)',
  modal: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 24px 48px rgba(0, 0, 0, 0.4)',
} as const;

// Generate CSS custom properties
export function generateCSSVariables(theme: 'dark' | 'light' = 'dark') {
  const colors = THEME_COLORS[theme];
  const vars: Record<string, string> = {};
  
  // Flatten and convert to CSS variables
  Object.entries(colors).forEach(([category, values]) => {
    Object.entries(values as Record<string, string>).forEach(([name, value]) => {
      vars[`--color-${category}-${name}`] = value;
    });
  });
  
  // Add brand colors
  Object.entries(THEME_COLORS.brand).forEach(([name, value]) => {
    vars[`--color-brand-${name}`] = value;
  });
  
  // Add status colors
  Object.entries(THEME_COLORS.status).forEach(([name, value]) => {
    vars[`--color-status-${name}`] = value;
  });
  
  return vars;
}
