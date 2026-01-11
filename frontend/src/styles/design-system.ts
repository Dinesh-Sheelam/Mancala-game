/**
 * Design System - Color Palette and Theme
 * Modern, eye-catching design without purple overload
 */

export const colors = {
  // Primary - Warm Earth Tones
  primary: {
    50: '#fef7ed',
    100: '#fdedd3',
    200: '#fbd9a5',
    300: '#f8c06d',
    400: '#f5a033',
    500: '#f2850d',
    600: '#e36a08',
    700: '#bc4f0a',
    800: '#963f0f',
    900: '#7a3510',
  },
  
  // Secondary - Rich Blues
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Accent - Vibrant Teal/Emerald
  accent: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Neutral - Sophisticated Grays
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Success - Green
  success: {
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  
  // Warning - Amber
  warning: {
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  // Error - Red
  error: {
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
};

export const gradients = {
  // Background gradients
  background: {
    primary: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    secondary: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
    accent: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)',
  },
  
  // Button gradients
  button: {
    primary: 'linear-gradient(135deg, #f2850d 0%, #e36a08 100%)',
    secondary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
};

export const animations = {
  // Page transitions
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  
  // Card animations
  card: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  
  // Button animations
  button: {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 },
  },
  
  // Stagger children
  stagger: {
    container: {
      initial: 'hidden',
      animate: 'visible',
      variants: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(242, 133, 13, 0.3)',
  glowBlue: '0 0 20px rgba(37, 99, 235, 0.3)',
};
