import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { FillWordTaskData, TaskComponentProps } from '../../../types/lesson';

type Props = TaskComponentProps<FillWordTaskData>;

export const InlineFillWord: React.FC<Props> = ({ 
  taskData, 
  onReadyChange,
  registerCheckAnswer,
  showResult,
  attemptCount 
}) => {
  const segments = taskData.segments || [];
  const words = taskData.words || [];
  const correctWords = taskData.correct_words || [];
  
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [filledWords, setFilledWords] = useState<(string | null)[]>([]);

  // Count blanks
  const blankCount = segments.filter(s => s === null).length;

  // Initialize state
  useEffect(() => {
    setAvailableWords([...words]);
    setFilledWords(Array(blankCount).fill(null));
  }, [taskData]);

  // Reset when attempting again
  useEffect(() => {
    if (!showResult && attemptCount > 0) {
      setAvailableWords([...words]);
      setFilledWords(Array(blankCount).fill(null));
    }
  }, [showResult, attemptCount]);

  // Check if all blanks are filled
  const isComplete = filledWords.every(w => w !== null);

  // Report ready state
  useEffect(() => {
    onReadyChange(isComplete);
  }, [isComplete, onReadyChange]);

  // Register check answer function
  useEffect(() => {
    registerCheckAnswer(() => {
      return filledWords.every((word, index) => word === correctWords[index]);
    });
  }, [filledWords, correctWords, registerCheckAnswer]);

  const handleWordSelect = (word: string) => {
    if (showResult) return;
    
    const firstEmptyIndex = filledWords.findIndex(w => w === null);
    if (firstEmptyIndex !== -1) {
      const newFilled = [...filledWords];
      newFilled[firstEmptyIndex] = word;
      setFilledWords(newFilled);

      const wordIndex = availableWords.indexOf(word);
      if (wordIndex > -1) {
        const newAvailable = [...availableWords];
        newAvailable.splice(wordIndex, 1);
        setAvailableWords(newAvailable);
      }
    }
  };

  const handleClearBlank = (index: number) => {
    if (showResult) return;
    
    const word = filledWords[index];
    if (word) {
      const newFilled = [...filledWords];
      newFilled[index] = null;
      setFilledWords(newFilled);
      setAvailableWords([...availableWords, word]);
    }
  };

  const renderSentence = () => {
    let blankIndex = 0;

    return (
      <View style={styles.sentenceContainer}>
        {segments.map((segment, index) => {
          if (segment === null) {
            const currentBlankIndex = blankIndex;
            const filledWord = filledWords[currentBlankIndex];
            blankIndex++;

            let borderColor = colors.border;
            let textColor = colors.accent;

            if (showResult) {
              if (filledWord === correctWords[currentBlankIndex]) {
                borderColor = colors.success;
                textColor = colors.success;
              } else {
                borderColor = colors.error;
                textColor = colors.error;
              }
            } else if (filledWord) {
              borderColor = colors.accent;
            }

            return (
              <TouchableOpacity
                key={`blank-${currentBlankIndex}`}
                style={[
                  styles.blankSlot,
                  filledWord ? styles.blankFilled : null,
                  { borderColor }
                ]}
                onPress={() => handleClearBlank(currentBlankIndex)}
                disabled={!filledWord || showResult}
              >
                <Text style={[styles.blankText, { color: textColor }]}>
                  {filledWord || "______"}
                </Text>
              </TouchableOpacity>
            );
          } else {
            return (
              <Text key={`text-${index}`} style={styles.sentenceText}>
                {segment}
              </Text>
            );
          }
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{taskData.question}</Text>

      {renderSentence()}

      {/* Word Pool */}
      {availableWords.length > 0 && (
        <View style={styles.poolContainer}>
          {availableWords.map((word, index) => (
            <TouchableOpacity
              key={`${word}-${index}`}
              style={styles.poolItem}
              onPress={() => handleWordSelect(word)}
              disabled={showResult || isComplete}
            >
              <Text style={styles.poolItemText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  sentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  sentenceText: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 28,
  },
  blankSlot: {
    minWidth: 70,
    height: 32,
    borderBottomWidth: 2,
    borderColor: colors.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  blankFilled: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(95, 203, 15, 0.1)',
    borderRadius: 8,
    borderBottomWidth: 0,
    borderWidth: 1,
  },
  blankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.tertiary,
  },
  poolContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  poolItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poolItemText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
});
