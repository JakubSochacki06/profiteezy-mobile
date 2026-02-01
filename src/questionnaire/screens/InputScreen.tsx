import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { InputScreenData } from '../types';
import { QuestionnaireScreenWrapper } from '../components';

interface InputScreenProps {
  data: InputScreenData;
  onContinue: (value: string) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export const InputScreen: React.FC<InputScreenProps> = ({
  data,
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleContinue = () => {
    onContinue(inputValue.trim());
  };

  return (
    <QuestionnaireScreenWrapper
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={handleContinue}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Title at top */}
        {data.title && (
          <View style={styles.header}>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        )}

        {/* Description under title */}
        {data.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{data.description}</Text>
          </View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Input in the middle */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={data.placeholder || 'Type your answer...'}
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize={data.autoCapitalize || 'sentences'}
            autoCorrect={data.autoCorrect !== false}
            keyboardType={data.keyboardType || 'default'}
            multiline={data.multiline || false}
            numberOfLines={data.multiline ? 4 : 1}
            maxLength={data.maxLength}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            blurOnSubmit
          />
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </KeyboardAvoidingView>
    </QuestionnaireScreenWrapper>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    textAlign: 'left',
  },
  descriptionContainer: {
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'left',
    lineHeight: 24,
  },
  spacer: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.border,
    textAlign: 'left',
  },
});
