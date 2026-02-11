import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { DragDropTaskData, TaskComponentProps } from '../../../types/lesson';

type Props = TaskComponentProps<DragDropTaskData>;

export const InlineDragDrop: React.FC<Props> = ({ 
  taskData, 
  onReadyChange,
  registerCheckAnswer,
  showResult,
  attemptCount 
}) => {
  const items = taskData.items || [];
  const correctOrder = taskData.correct_order || [];
  
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [orderedItems, setOrderedItems] = useState<string[]>([]);

  // Initialize/reset state
  useEffect(() => {
    setAvailableItems([...items]);
    setOrderedItems([]);
  }, [taskData]);

  // Reset when attempting again
  useEffect(() => {
    if (!showResult && attemptCount > 0) {
      setAvailableItems([...items]);
      setOrderedItems([]);
    }
  }, [showResult, attemptCount]);

  // Report ready state when all items are placed
  const isComplete = orderedItems.length === correctOrder.length;
  
  useEffect(() => {
    onReadyChange(isComplete);
  }, [isComplete, onReadyChange]);

  // Register check answer function
  useEffect(() => {
    registerCheckAnswer(() => {
      const correctItems = correctOrder.map(idx => items[idx]);
      return orderedItems.every((item, index) => item === correctItems[index]);
    });
  }, [orderedItems, correctOrder, items, registerCheckAnswer]);

  const handleAddItem = (item: string) => {
    if (showResult) return;
    setOrderedItems([...orderedItems, item]);
    setAvailableItems(availableItems.filter(i => i !== item));
  };

  const handleRemoveItem = (item: string) => {
    if (showResult) return;
    setAvailableItems([...availableItems, item]);
    setOrderedItems(orderedItems.filter(i => i !== item));
  };

  // Get correct item for a slot index
  const getCorrectItem = (slotIndex: number) => {
    return items[correctOrder[slotIndex]];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{taskData.question}</Text>
      <Text style={styles.instruction}>Tap items in the correct order</Text>

      {/* Slots for Ordered Items */}
      <View style={styles.slotsContainer}>
        {correctOrder.map((_, index) => {
          const item = orderedItems[index];
          const isFilled = !!item;
          const correctItem = getCorrectItem(index);

          let borderColor = colors.border;
          if (showResult && isFilled) {
            borderColor = item === correctItem ? colors.success : colors.error;
          }

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.slot,
                isFilled && styles.slotFilled,
                { borderColor }
              ]}
              onPress={() => isFilled && handleRemoveItem(item)}
              disabled={!isFilled || showResult}
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
      {availableItems.length > 0 && (
        <View style={styles.poolContainer}>
          {availableItems.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={styles.poolItem}
              onPress={() => handleAddItem(item)}
              disabled={showResult}
            >
              <Text style={styles.poolItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  slotsContainer: {
    gap: 10,
    marginTop: 8,
  },
  slot: {
    height: 56,
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
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  placeholder: {
    flex: 1,
  },
  poolContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  poolItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poolItemText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
