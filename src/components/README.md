# UI Components Library

This directory contains reusable UI components that ensure consistent design across all screens in the app.

## Why Use Reusable Components?

✅ **Consistency** - All buttons, cards, and text look the same across the app  
✅ **Maintainability** - Update styles in one place, changes apply everywhere  
✅ **Faster Development** - No need to recreate styles for each screen  
✅ **Type Safety** - TypeScript ensures correct usage  
✅ **Best Practice** - This is how professional apps are built (design systems)

## Available Components

### Button

A flexible button component with multiple variants and sizes.

```tsx
import { Button } from '../components';

// Primary button (default)
<Button title="Get Started" onPress={handlePress} />

// Secondary button
<Button title="Cancel" onPress={handlePress} variant="secondary" />

// Outline button
<Button title="Learn More" onPress={handlePress} variant="outline" />

// Ghost button (transparent)
<Button title="Skip" onPress={handlePress} variant="ghost" />

// Different sizes
<Button title="Small" onPress={handlePress} size="small" />
<Button title="Medium" onPress={handlePress} size="medium" />
<Button title="Large" onPress={handlePress} size="large" />

// With icons
<Button 
  title="Continue" 
  onPress={handlePress}
  leftIcon={<Ionicons name="arrow-forward" size={20} />}
/>

// Loading state
<Button title="Submit" onPress={handlePress} loading={true} />

// Full width
<Button title="Sign In" onPress={handlePress} fullWidth />
```

**Props:**
- `title` (required) - Button text
- `onPress` (required) - Press handler
- `variant` - 'primary' | 'secondary' | 'outline' | 'ghost' (default: 'primary')
- `size` - 'small' | 'medium' | 'large' (default: 'medium')
- `disabled` - Boolean (default: false)
- `loading` - Boolean (default: false)
- `fullWidth` - Boolean (default: false)
- `leftIcon` - React node for left icon
- `rightIcon` - React node for right icon
- `style` - Custom ViewStyle
- `textStyle` - Custom TextStyle

### Typography

Consistent text styling across the app.

```tsx
import { Typography } from '../components';

// Headings
<Typography variant="h1">Main Title</Typography>
<Typography variant="h2">Section Title</Typography>
<Typography variant="h3">Subsection Title</Typography>

// Body text
<Typography variant="body">Regular paragraph text</Typography>
<Typography variant="caption">Small caption text</Typography>
<Typography variant="label">Form label</Typography>

// Colors
<Typography color="primary">Primary text</Typography>
<Typography color="secondary">Secondary text</Typography>
<Typography color="accent">Accent colored text</Typography>
<Typography color="error">Error message</Typography>

// Modifiers
<Typography bold>Bold text</Typography>
<Typography italic>Italic text</Typography>
<Typography numberOfLines={2}>Truncated text</Typography>
```

**Props:**
- `variant` - 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' (default: 'body')
- `color` - 'primary' | 'secondary' | 'tertiary' | 'accent' | 'error' | 'success' (default: 'primary')
- `bold` - Boolean (default: false)
- `italic` - Boolean (default: false)
- `numberOfLines` - Number for text truncation
- `style` - Custom TextStyle

### Card

Consistent card container with padding options.

```tsx
import { Card } from '../components';

// Default card
<Card>
  <Typography variant="h3">Card Title</Typography>
  <Typography>Card content goes here</Typography>
</Card>

// Elevated card (with shadow)
<Card variant="elevated">
  <Typography>Elevated content</Typography>
</Card>

// Different padding
<Card padding="small">Small padding</Card>
<Card padding="medium">Medium padding (default)</Card>
<Card padding="large">Large padding</Card>
<Card padding="none">No padding</Card>
```

**Props:**
- `variant` - 'default' | 'elevated' | 'outlined' (default: 'default')
- `padding` - 'none' | 'small' | 'medium' | 'large' (default: 'medium')
- `style` - Custom ViewStyle

### IconButton

Circular icon button for actions.

```tsx
import { IconButton } from '../components';
import { Ionicons } from '@expo/vector-icons';

// Default (transparent)
<IconButton 
  icon={<Ionicons name="chevron-back" size={24} color={colors.text.primary} />}
  onPress={handleBack}
/>

// Filled
<IconButton 
  icon={<Ionicons name="heart" size={20} color={colors.text.primary} />}
  onPress={handleLike}
  variant="filled"
/>

// Outline
<IconButton 
  icon={<Ionicons name="settings" size={20} color={colors.text.primary} />}
  onPress={handleSettings}
  variant="outline"
/>

// Sizes
<IconButton icon={...} onPress={...} size="small" />
<IconButton icon={...} onPress={...} size="medium" />
<IconButton icon={...} onPress={...} size="large" />
```

**Props:**
- `icon` (required) - React node (usually an icon)
- `onPress` (required) - Press handler
- `variant` - 'default' | 'filled' | 'outline' (default: 'default')
- `size` - 'small' | 'medium' | 'large' (default: 'medium')
- `disabled` - Boolean (default: false)
- `loading` - Boolean (default: false)
- `style` - Custom ViewStyle

## Migration Example

**Before (inline styles):**
```tsx
<TouchableOpacity style={styles.startButton} onPress={handlePress}>
  <Text style={styles.startButtonText}>Start learning</Text>
</TouchableOpacity>
```

**After (reusable component):**
```tsx
<Button title="Start learning" onPress={handlePress} />
```

## Best Practices

1. **Always use components from this library** instead of creating inline styles
2. **Import from index** - `import { Button, Card } from '../components'`
3. **Use Typography** instead of raw `<Text>` components for consistency
4. **Extend with style prop** if you need one-off customizations
5. **Add new components here** when you find yourself repeating UI patterns
