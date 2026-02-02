# Theme System Documentation

This project includes a comprehensive theming system that allows you to easily switch between different color schemes throughout your entire application.

## Features

- ✅ **Two Built-in Themes**: Primary (Blue-based) and Secondary (Green-based)
- ✅ **Type-Safe**: Full TypeScript support with theme types
- ✅ **Easy to Use**: Simple hook-based API
- ✅ **Consistent Design**: Typography, spacing, and border radius tokens
- ✅ **Custom Text Component**: Pre-configured with theme support
- ✅ **Flexible**: Easy to extend and customize

## Quick Start

### 1. Theme Provider Setup (Already Done in App.tsx)

The `ThemeProvider` is already wrapped around your app in `App.tsx`. Set your theme once here:

```typescript
import { ThemeProvider } from '@/core/theme';

function App() {
  return (
    <ThemeProvider theme="primary">
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

To change the theme, simply change the `theme` prop to `"primary"` or `"secondary"`.
```

### 2. Using the Theme in Components

Use the `useTheme` hook to access the current theme:

```typescript
import { useTheme } from '@/core/theme';

const MyComponent = () => {
  const { theme, themeMode } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.primary }}>
      <Text style={{ color: theme.colors.onPrimary }}>
        Current theme: {themeMode}
      </Text>
    </View>
  );
};
```

### 3. Using the Custom Text Component

The custom `Text` component automatically uses theme colors:

```typescript
import { Text } from '@/core/components';

// Default text (uses theme.colors.text)
<Text>Regular text</Text>

// Primary colored text
<Text variant="primary">Primary text</Text>

// Secondary colored text
<Text variant="secondary">Secondary text</Text>

// Different sizes
<Text size="xs">Extra small</Text>
<Text size="sm">Small</Text>
<Text size="md">Medium (default)</Text>
<Text size="lg">Large</Text>
<Text size="xl">Extra large</Text>
<Text size="xxl">2X large</Text>
<Text size="xxxl">3X large</Text>
```

## Theme Structure

### Colors

Each theme includes the following color tokens:

```typescript
{
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;      // Text color on primary background
  
  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  onSecondary: string;    // Text color on secondary background
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textDisabled: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Other
  shadow: string;
  overlay: string;
}
```

### Spacing

```typescript
{
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

### Border Radius

```typescript
{
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}
```

### Typography

```typescript
{
  fontFamily: {
    regular: 'BarlowCondensed-Regular',
    medium: 'BarlowCondensed-Medium',
    bold: 'BarlowCondensed-Bold',
    light: 'BarlowCondensed-Light',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
}
```

## Available Themes

### Primary Theme (Blue-based)
- Primary Color: #3B82F6 (Blue)
- Secondary Color: #8B5CF6 (Purple)
- Background: #F9FAFB (Light Gray)

### Secondary Theme (Green-based)
- Primary Color: #10B981 (Green)
- Secondary Color: #F59E0B (Orange)
- Background: #F0FDF4 (Very Light Green)

## Advanced Usage

### Creating Theme-Aware Styles

```typescript
import { useTheme } from '@/core/theme';

const MyComponent = () => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 2,
        borderColor: theme.colors.primaryDark,
      }}
    >
      <Text style={{ color: theme.colors.onPrimary }}>
        Themed component
      </Text>
    </View>
  );
};
```

### Setting the Theme

The theme is set once in `App.tsx`. To change themes, modify the `theme` prop:

```typescript
// In App.tsx
<ThemeProvider theme="primary">  // or "secondary"
  {/* Your app */}
</ThemeProvider>
```

## Adding a New Theme

To add a new theme:

1. Create new colors in `src/core/theme/colors.ts`:

```typescript
export const darkThemeColors: ThemeColors = {
  primary: '#...',
  // ... add all required color tokens
};
```

2. Add the theme to `src/core/theme/themes.ts`:

```typescript
export const darkTheme: Theme = {
  colors: darkThemeColors,
  ...commonTheme,
};

export const themes = {
  primary: primaryTheme,
  secondary: secondaryTheme,
  dark: darkTheme, // New theme
};
```

3. Update the `ThemeMode` type in `src/core/theme/types.ts`:

```typescript
export type ThemeMode = 'primary' | 'secondary' | 'dark';
```

## Best Practices

1. **Always use theme colors** instead of hardcoded colors
2. **Use spacing tokens** for consistent padding and margins
3. **Use typography tokens** for font sizes and families
4. **Use the custom Text component** throughout your app
5. **Test both themes** to ensure your UI looks good in both

## Example: Theme Demo Screen

Check out `src/screens/ThemeDemo/ThemeDemo.tsx` for a comprehensive example showcasing all theme features.

## Theme API Reference

### `useTheme()` Hook

Returns an object with:

- `theme`: Current theme object with all colors, spacing, typography, etc.
- `themeMode`: Current theme mode ('primary' or 'secondary')

## Support

For questions or issues with the theming system, please refer to the example implementations in:
- `src/screens/Home/HomeScree.tsx`

