import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';

interface QuestionnaireButtonProps {
  onPress: () => void;
  disabled?: boolean;
  text?: string;
}

export const QuestionnaireButton: React.FC<QuestionnaireButtonProps> = ({
  onPress,
  disabled = false,
  text = 'Continue',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
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
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
