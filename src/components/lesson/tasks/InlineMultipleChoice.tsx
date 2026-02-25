import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { MultipleChoiceTaskData, TaskComponentProps } from '../../../types/lesson';

type Props = TaskComponentProps<MultipleChoiceTaskData>;

export const InlineMultipleChoice: React.FC<Props> = ({ 
  taskData, 
  onReadyChange,
  registerCheckAnswer,
  showResult,
  attemptCount 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  
  // Robustly handle correct_index: can be undefined, number, or array of numbers
  const correctIndices = useMemo(() => {
    const rawIndex = taskData.correct_index;
    if (Array.isArray(rawIndex)) {
      return rawIndex;
    } else if (typeof rawIndex === 'number') {
      return [rawIndex];
    }
    return [];
  }, [taskData.correct_index]);

  const requiredSelections = Math.max(1, correctIndices.length);

  // Reset selection when attempting again
  useEffect(() => {
    if (!showResult && attemptCount > 0) {
      setSelectedOptions(new Set());
    }
  }, [showResult, attemptCount]);

  // Report ready state when enough selections are made
  useEffect(() => {
    // If we have no correct indices (data error), don't block? Or block?
    // Let's assume user must select at least requiredSelections amount
    onReadyChange(selectedOptions.size === requiredSelections);
  }, [selectedOptions.size, requiredSelections, onReadyChange]);

  // Register check answer function
  useEffect(() => {
    registerCheckAnswer(() => {
      // If data is missing correct indices, we can't really check. Fail safe?
      if (correctIndices.length === 0) return false;

      // Check if selected options match correct indices exactly
      if (selectedOptions.size !== correctIndices.length) return false;
      return correctIndices.every(idx => selectedOptions.has(idx));
    });
  }, [selectedOptions, correctIndices, registerCheckAnswer]);

  const handleSelect = (index: number) => {
    if (showResult) return;
    
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      // Only allow selecting up to the required number
      if (newSelected.size < requiredSelections) {
        newSelected.add(index);
      } else {
        // Replace the oldest selection (convert to array, remove first, add new)
        const arr = Array.from(newSelected);
        arr.shift();
        arr.push(index);
        setSelectedOptions(new Set(arr));
        return;
      }
    }
    setSelectedOptions(newSelected);
  };

  const isCorrectOption = (index: number) => correctIndices.includes(index);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{taskData.question}</Text>
      {/* Instruction text removed as requested */}

      <View style={styles.optionsContainer}>
        {(taskData.options || []).map((option, index) => {
          const isSelected = selectedOptions.has(index);
          const isCorrect = isCorrectOption(index);
          
          let borderColor = colors.border;
          let backgroundColor = colors.surface;

          if (showResult) {
            if (isCorrect) {
              borderColor = colors.success;
              backgroundColor = 'rgba(76, 175, 80, 0.15)';
            } else if (isSelected) {
              borderColor = colors.error;
              backgroundColor = 'rgba(244, 67, 54, 0.15)';
            }
          } else if (isSelected) {
            borderColor = colors.accent;
            backgroundColor = 'rgba(95, 203, 15, 0.1)';
          }

          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, { borderColor, backgroundColor }]}
              onPress={() => handleSelect(index)}
              activeOpacity={0.8}
              disabled={showResult}
            >
              <View style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected,
                showResult && isCorrect && { borderColor: colors.success, backgroundColor: colors.success },
                showResult && isSelected && !isCorrect && { borderColor: colors.error, backgroundColor: colors.error },
              ]}>
                {(isSelected || (showResult && isCorrect)) && (
                  <Ionicons 
                    name="checkmark" 
                    size={14} 
                    color="white" 
                  />
                )}
              </View>
              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
                showResult && isCorrect && { color: colors.success },
                showResult && isSelected && !isCorrect && { color: colors.error },
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selection counter removed as requested */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  instruction: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  optionsContainer: {
    gap: 12,
    marginTop: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    borderColor: colors.accent,
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
  counter: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});
