import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  secureTextEntry,
  style,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const brand = useBrand();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPasswordField = !!secureTextEntry;

  const borderColor = error ? Brand.danger : isFocused ? brand.primary : theme.border;

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.inputWrapper}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          onFocus={(event) => {
            setIsFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            inputProps.onBlur?.(event);
          }}
          style={[
            styles.input,
            isPasswordField && styles.inputWithToggle,
            {
              color: theme.text,
              borderColor,
              backgroundColor: theme.surfaceSunken,
              borderWidth: isFocused || error ? 2 : 1,
            },
            style,
          ]}
          {...inputProps}
        />
        {isPasswordField && (
          <Pressable
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            style={styles.toggleButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.messageRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color={Brand.danger} />
          <ThemedText type="small" style={{ color: Brand.danger }}>
            {error}
          </ThemedText>
        </View>
      ) : hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  input: {
    minHeight: MinTouchTarget + 4,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  inputWithToggle: {
    paddingRight: Spacing.three + 28,
  },
  toggleButton: {
    position: 'absolute',
    right: Spacing.three,
    minWidth: MinTouchTarget / 2,
    minHeight: MinTouchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
