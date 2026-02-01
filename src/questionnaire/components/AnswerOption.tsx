import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../../theme/colors';

interface AnswerOptionProps {
  text: string;
  icon?: ImageSourcePropType;
  selected: boolean;
  onPress: () => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  text,
  icon,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Image source={icon} style={styles.icon} resizeMode="contain" />
        </View>
      )}
      <Text style={[styles.text, selected && styles.textSelected]}>
        {text}
      </Text>
      {!selected && (
        <View style={styles.radioCircle} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 22,
    marginBottom: 12,
  },
  containerSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  iconContainer: {
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 44,
    height: 44,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: colors.text.primary,
  },
  textSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.primary,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginLeft: 12,
  },
});
