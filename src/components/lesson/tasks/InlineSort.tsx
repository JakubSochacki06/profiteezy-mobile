import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { SortTaskData, TaskComponentProps } from '../../../types/lesson';

type Props = TaskComponentProps<SortTaskData>;

interface SortItem {
  text: string;
  category: string;
}

export const InlineSort: React.FC<Props> = ({ 
  taskData, 
  onReadyChange,
  registerCheckAnswer,
  showResult,
  attemptCount 
}) => {
  const categories = taskData.categories || [];
  const items = taskData.items || [];
  
  const [unsortedItems, setUnsortedItems] = useState<SortItem[]>([]);
  const [sortedItems, setSortedItems] = useState<Record<string, SortItem[]>>({});
  const [selectedItem, setSelectedItem] = useState<SortItem | null>(null);

  // Initialize state
  useEffect(() => {
    setUnsortedItems([...items]);
    setSortedItems({});
    setSelectedItem(null);
  }, [taskData]);

  // Reset when attempting again
  useEffect(() => {
    if (!showResult && attemptCount > 0) {
      setUnsortedItems([...items]);
      setSortedItems({});
      setSelectedItem(null);
    }
  }, [showResult, attemptCount]);

  // Check if all items are sorted
  const isComplete = unsortedItems.length === 0;

  // Report ready state
  useEffect(() => {
    onReadyChange(isComplete);
  }, [isComplete, onReadyChange]);

  // Register check answer function
  useEffect(() => {
    registerCheckAnswer(() => {
      let allCorrect = true;
      Object.entries(sortedItems).forEach(([catName, catItems]) => {
        catItems.forEach(item => {
          if (item.category !== catName) {
            allCorrect = false;
          }
        });
      });
      return allCorrect;
    });
  }, [sortedItems, registerCheckAnswer]);

  const handleSelectItem = (item: SortItem) => {
    if (showResult) return;
    if (selectedItem?.text === item.text) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleSortIntoCategory = (categoryName: string) => {
    if (!selectedItem || showResult) return;

    setSortedItems(prev => ({
      ...prev,
      [categoryName]: [...(prev[categoryName] || []), selectedItem]
    }));
    setUnsortedItems(prev => prev.filter(i => i.text !== selectedItem.text));
    setSelectedItem(null);
  };

  const handleReturnToPool = (categoryName: string, item: SortItem) => {
    if (showResult) return;

    setSortedItems(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].filter(i => i.text !== item.text)
    }));
    setUnsortedItems(prev => [...prev, item]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{taskData.question}</Text>
      <Text style={styles.instruction}>Tap an item, then tap the category to sort it.</Text>

      {/* Categories Buckets */}
      <View style={styles.categoriesContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryBucket,
              selectedItem && !showResult ? styles.categoryActive : null
            ]}
            onPress={() => selectedItem && handleSortIntoCategory(category)}
            activeOpacity={selectedItem ? 0.7 : 1}
            disabled={showResult}
          >
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.categoryItems}>
              {(sortedItems[category] || []).map((item, idx) => {
                let itemBgColor = 'rgba(255,255,255,0.1)';
                if (showResult) {
                  itemBgColor = item.category === category 
                    ? 'rgba(76, 175, 80, 0.3)' 
                    : 'rgba(244, 67, 54, 0.3)';
                }

                return (
                  <TouchableOpacity
                    key={`${item.text}-${idx}`}
                    style={[styles.sortedItem, { backgroundColor: itemBgColor }]}
                    onPress={() => handleReturnToPool(category, item)}
                    disabled={showResult}
                  >
                    <Text style={styles.sortedItemText}>{item.text}</Text>
                    {showResult && (
                      <Ionicons
                        name={item.category === category ? "checkmark" : "close"}
                        size={14}
                        color={item.category === category ? colors.success : colors.error}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Unsorted Items Pool */}
      {unsortedItems.length > 0 && (
        <View style={styles.poolContainer}>
          <Text style={styles.poolLabel}>Items:</Text>
          <View style={styles.poolItems}>
            {unsortedItems.map((item, idx) => (
              <TouchableOpacity
                key={`${item.text}-${idx}`}
                style={[
                  styles.poolItem,
                  selectedItem?.text === item.text && styles.poolItemSelected
                ]}
                onPress={() => handleSelectItem(item)}
                disabled={showResult}
              >
                <Text style={[
                  styles.poolItemText,
                  selectedItem?.text === item.text && styles.poolItemTextSelected
                ]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  categoriesContainer: {
    gap: 12,
    marginTop: 8,
  },
  categoryBucket: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    minHeight: 80,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  categoryActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(95, 203, 15, 0.05)',
    borderStyle: 'dashed',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  categoryItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortedItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortedItemText: {
    color: colors.text.primary,
    fontSize: 14,
  },
  poolContainer: {
    marginTop: 16,
  },
  poolLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  poolItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  poolItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poolItemSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  poolItemText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  poolItemTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
});
