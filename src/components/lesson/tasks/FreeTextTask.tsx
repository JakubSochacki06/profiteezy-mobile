import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../../theme/colors';
import { FreeTextTask as FreeTextTaskType } from '../../../types/lesson';

interface Props {
  task: FreeTextTaskType;
  onComplete: (isCorrect: boolean) => void;
  registerControls: (canSubmit: boolean, title: string, onSubmit: () => void) => void;
}

export const FreeTextTask: React.FC<Props> = ({ task, onComplete, registerControls }) => {
  const [text, setText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const minChars = task.minChars || 1;
  const isValid = text.length >= minChars;

  const handleSubmit = () => {
    if (!isValid) return;
    
    if (!hasSubmitted) {
      setHasSubmitted(true);
    } else {
      onComplete(true);
    }
  };

  // Register controls with parent
  useEffect(() => {
    const canSubmit = hasSubmitted || isValid;
    const title = hasSubmitted ? "Continue" : "Submit Answer";
    registerControls(canSubmit, title, handleSubmit);
  }, [text, hasSubmitted, isValid]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{task.question}</Text>
        <Text style={styles.prompt}>{task.prompt}</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={task.placeholder || "Type your answer here..."}
            placeholderTextColor={colors.text.tertiary}
            multiline
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
            editable={!hasSubmitted}
          />
          {task.minChars && (
            <Text style={[
              styles.counter, 
              text.length < minChars ? { color: colors.text.tertiary } : { color: colors.success }
            ]}>
              {text.length} / {minChars} chars
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  prompt: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 150,
    fontFamily: 'Inter_400Regular',
  },
  counter: {
    alignSelf: 'flex-end',
    marginTop: 8,
    fontSize: 12,
  },
});
