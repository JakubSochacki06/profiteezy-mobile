import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import { MultipleChoiceTask as MultipleChoiceTaskType } from '../../../types/lesson';

interface Props {
  task: MultipleChoiceTaskType;
  onComplete: (isCorrect: boolean) => void;
  registerControls: (canSubmit: boolean, title: string, onSubmit: () => void) => void;
}

export const MultipleChoiceTask: React.FC<Props> = ({ task, onComplete, registerControls }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedOption === null) return;

    if (!hasSubmitted) {
      setHasSubmitted(true);
    } else {
      // Already submitted, now continue
      const isCorrect = selectedOption === task.correctIndex;
      onComplete(isCorrect);
    }
  };

  // Register controls with parent
  useEffect(() => {
    const canSubmit = hasSubmitted || selectedOption !== null;
    const title = hasSubmitted ? "Continue" : "Check Answer";
    registerControls(canSubmit, title, handleSubmit);
  }, [selectedOption, hasSubmitted]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.question}>{task.question}</Text>

      <View style={styles.optionsContainer}>
        {(task.options || []).map((option, index) => {
          const isSelected = selectedOption === index;
          let borderColor = colors.border;
          let backgroundColor = colors.surface;

          if (hasSubmitted) {
            if (index === task.correctIndex) {
              borderColor = colors.success;
              backgroundColor = 'rgba(76, 175, 80, 0.1)';
            } else if (isSelected) {
              borderColor = colors.error;
              backgroundColor = 'rgba(244, 67, 54, 0.1)';
            }
          } else if (isSelected) {
            borderColor = colors.accent;
            backgroundColor = 'rgba(95, 203, 15, 0.1)';
          }

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                { borderColor, backgroundColor }
              ]}
              onPress={() => !hasSubmitted && setSelectedOption(index)}
              activeOpacity={0.8}
              disabled={hasSubmitted}
            >
              <View style={[
                styles.radioCircle,
                isSelected && styles.radioCircleSelected,
                hasSubmitted && index === task.correctIndex && { borderColor: colors.success },
                hasSubmitted && isSelected && index !== task.correctIndex && { borderColor: colors.error },
              ]}>
                {isSelected && <View style={[
                  styles.radioInner,
                  hasSubmitted && index === task.correctIndex && { backgroundColor: colors.success },
                  hasSubmitted && isSelected && index !== task.correctIndex && { backgroundColor: colors.error },
                ]} />}
              </View>
              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
                hasSubmitted && index === task.correctIndex && { color: colors.success },
                hasSubmitted && isSelected && index !== task.correctIndex && { color: colors.error },
              ]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 24,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 24,
    fontFamily: 'Inter_700Bold',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  optionTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
