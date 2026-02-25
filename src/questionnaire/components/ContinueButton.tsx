import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';

interface ContinueButtonProps {
  onPress: () => void;
  disabled?: boolean;
  text?: string;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onPress,
  disabled = false,
  text = 'Continue',
}) => {
  return (
    <View style={styles.container}>
      <Button
        title={text}
        onPress={onPress}
        disabled={disabled}
        variant="primary"
        size="large"
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
