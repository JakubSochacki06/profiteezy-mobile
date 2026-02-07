import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import { DragDropTask as DragDropTaskType } from '../../../types/lesson';

interface Props {
  task: DragDropTaskType;
  onComplete: (isCorrect: boolean) => void;
  registerControls: (canSubmit: boolean, title: string, onSubmit: () => void) => void;
}

export const DragDropTask: React.FC<Props> = ({ task, onComplete, registerControls }) => {
  const items = task.items || [];
  const correctOrder = task.correctOrder || [];
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setAvailableItems([...items]);
    setOrderedItems([]);
    setHasSubmitted(false);
  }, [task]);

  const handleAddItem = (item: string) => {
    setOrderedItems([...orderedItems, item]);
    setAvailableItems(availableItems.filter(i => i !== item));
  };

  const handleRemoveItem = (item: string) => {
    setAvailableItems([...availableItems, item]);
    setOrderedItems(orderedItems.filter(i => i !== item));
  };

  const handleSubmit = () => {
    if (!hasSubmitted) {
      setHasSubmitted(true);
    } else {
      const correct = orderedItems.every((item, index) => item === correctOrder[index]) && orderedItems.length === correctOrder.length;
      onComplete(correct);
    }
  };

  // Register controls with parent
  useEffect(() => {
    const isComplete = orderedItems.length === correctOrder.length;
    const canSubmit = hasSubmitted || isComplete;
    const title = hasSubmitted ? "Continue" : "Check Order";
    registerControls(canSubmit, title, handleSubmit);
  }, [orderedItems, hasSubmitted, correctOrder.length]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.question}>{task.question}</Text>
      <Text style={styles.instruction}>Tap items in the correct order</Text>

      {/* Slots for Ordered Items */}
      <View style={styles.slotsContainer}>
        {correctOrder.map((_, index) => {
          const item = orderedItems[index];
          const isFilled = !!item;

          let borderColor = colors.border;
          if (hasSubmitted) {
            if (item === correctOrder[index]) {
              borderColor = colors.success;
            } else {
              borderColor = colors.error;
            }
          }

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.slot,
                isFilled && styles.slotFilled,
                { borderColor }
              ]}
              onPress={() => isFilled && !hasSubmitted && handleRemoveItem(item)}
              disabled={!isFilled || hasSubmitted}
            >
              <Text style={styles.slotNumber}>{index + 1}</Text>
              {isFilled ? (
                <Text style={styles.slotText}>{item}</Text>
              ) : (
                <View style={styles.placeholder} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Available Items Pool */}
      <View style={styles.poolContainer}>
        {availableItems.map((item, index) => (
          <TouchableOpacity
            key={`${item}-${index}`}
            style={styles.poolItem}
            onPress={() => handleAddItem(item)}
            disabled={hasSubmitted}
          >
            <Text style={styles.poolItemText}>{item}</Text>
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
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  instruction: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
  },
  slotsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  slot: {
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  slotFilled: {
    borderStyle: 'solid',
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  slotNumber: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginRight: 16,
    fontWeight: 'bold',
  },
  slotText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
  },
  poolContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  poolItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poolItemText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
