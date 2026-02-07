import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import { FillWordTask as FillWordTaskType } from '../../../types/lesson';

interface Props {
  task: FillWordTaskType;
  onComplete: (isCorrect: boolean) => void;
  registerControls: (canSubmit: boolean, title: string, onSubmit: () => void) => void;
}

export const FillWordTask: React.FC<Props> = ({ task, onComplete, registerControls }) => {
  const segments = task.segments || [];
  const words = task.words || [];
  const correctWords = task.correctWords || [];
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [filledWords, setFilledWords] = useState<(string | null)[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setAvailableWords([...words]);
    const blankCount = segments.filter(s => s === null).length;
    setFilledWords(Array(blankCount).fill(null));
    setHasSubmitted(false);
  }, [task]);

  const handleWordSelect = (word: string) => {
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
    const word = filledWords[index];
    if (word) {
      const newFilled = [...filledWords];
      newFilled[index] = null;
      setFilledWords(newFilled);
      setAvailableWords([...availableWords, word]);
    }
  };

  const handleSubmit = () => {
    if (!hasSubmitted) {
      setHasSubmitted(true);
    } else {
      const correct = filledWords.every((word, index) => word === correctWords[index]);
      onComplete(correct);
    }
  };

  // Register controls with parent
  useEffect(() => {
    const isComplete = filledWords.every(w => w !== null);
    const canSubmit = hasSubmitted || isComplete;
    const title = hasSubmitted ? "Continue" : "Check Answer";
    registerControls(canSubmit, title, handleSubmit);
  }, [filledWords, hasSubmitted]);

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

            if (hasSubmitted) {
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
                onPress={() => !hasSubmitted && handleClearBlank(currentBlankIndex)}
                disabled={!filledWord || hasSubmitted}
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

  const isComplete = filledWords.every(w => w !== null);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.question}>{task.question}</Text>

      {renderSentence()}

      {/* Word Pool */}
      <View style={styles.poolContainer}>
        {availableWords.map((word, index) => (
          <TouchableOpacity
            key={`${word}-${index}`}
            style={styles.poolItem}
            onPress={() => handleWordSelect(word)}
            disabled={hasSubmitted || isComplete}
          >
            <Text style={styles.poolItemText}>{word}</Text>
          </TouchableOpacity>
        ))}
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
    marginBottom: 32,
    fontFamily: 'Inter_700Bold',
  },
  sentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 48,
    gap: 8,
  },
  sentenceText: {
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 32,
  },
  blankSlot: {
    minWidth: 80,
    height: 36,
    borderBottomWidth: 2,
    borderColor: colors.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: -4,
  },
  blankFilled: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(95, 203, 15, 0.1)',
    borderRadius: 8,
    borderBottomWidth: 0,
    borderWidth: 1,
  },
  blankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.tertiary,
  },
  poolContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  poolItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  poolItemText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
