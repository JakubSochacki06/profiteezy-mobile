import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import { SortTask as SortTaskType } from '../../../types/lesson';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  task: SortTaskType;
  onComplete: (isCorrect: boolean) => void;
  registerControls: (canSubmit: boolean, title: string, onSubmit: () => void) => void;
}

export const SortTask: React.FC<Props> = ({ task, onComplete, registerControls }) => {
  const categories = task.categories || [];
  const items = task.items || [];
  const [unsortedItems, setUnsortedItems] = useState(items);
  const [sortedItems, setSortedItems] = useState<Record<string, typeof items>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSelectItem = (itemId: string) => {
    if (selectedItem === itemId) {
      setSelectedItem(null);
    } else {
      setSelectedItem(itemId);
    }
  };

  const handleSortIntoCategory = (categoryId: string) => {
    if (!selectedItem) return;

    const item = unsortedItems.find(i => i.id === selectedItem);
    if (!item) return;

    setSortedItems(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), item]
    }));
    setUnsortedItems(prev => prev.filter(i => i.id !== selectedItem));
    setSelectedItem(null);
  };

  const handleReturnToPool = (categoryId: string, itemId: string) => {
    if (hasSubmitted) return;

    const item = sortedItems[categoryId]?.find(i => i.id === itemId);
    if (!item) return;

    setSortedItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(i => i.id !== itemId)
    }));
    setUnsortedItems(prev => [...prev, item]);
  };

  const handleSubmit = () => {
    if (!hasSubmitted) {
      setHasSubmitted(true);
    } else {
      let allCorrect = true;
      if (unsortedItems.length > 0) {
        allCorrect = false;
      }
      Object.entries(sortedItems).forEach(([catId, items]) => {
        items.forEach(item => {
          if (item.categoryId !== catId) {
            allCorrect = false;
          }
        });
      });
      onComplete(allCorrect);
    }
  };

  // Register controls with parent
  useEffect(() => {
    const isComplete = unsortedItems.length === 0;
    const canSubmit = hasSubmitted || isComplete;
    const title = hasSubmitted ? "Continue" : "Check Sorting";
    registerControls(canSubmit, title, handleSubmit);
  }, [unsortedItems.length, hasSubmitted]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.question}>{task.question}</Text>
      <Text style={styles.instruction}>Tap an item, then tap the category to sort it.</Text>

      {/* Categories Buckets */}
      <View style={styles.categoriesContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryBucket,
              selectedItem && !hasSubmitted ? styles.categoryActive : null
            ]}
            onPress={() => !hasSubmitted && selectedItem && handleSortIntoCategory(category.id)}
            activeOpacity={selectedItem ? 0.7 : 1}
          >
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <View style={styles.categoryItems}>
              {(sortedItems[category.id] || []).map(item => {
                let itemColor = colors.surface;
                if (hasSubmitted) {
                  itemColor = item.categoryId === category.id ? colors.success : colors.error;
                }

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.sortedItem, { backgroundColor: itemColor === colors.surface ? 'rgba(255,255,255,0.1)' : itemColor }]}
                    onPress={() => handleReturnToPool(category.id, item.id)}
                  >
                    <Text style={styles.sortedItemText}>{item.content}</Text>
                    {hasSubmitted && (
                      <Ionicons
                        name={item.categoryId === category.id ? "checkmark" : "alert-circle"}
                        size={14}
                        color="white"
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
            {unsortedItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.poolItem,
                  selectedItem === item.id && styles.poolItemSelected
                ]}
                onPress={() => handleSelectItem(item.id)}
              >
                <Text style={[
                  styles.poolItemText,
                  selectedItem === item.id && styles.poolItemTextSelected
                ]}>{item.content}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
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
  categoriesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  categoryBucket: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  categoryActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(95, 203, 15, 0.05)',
    borderStyle: 'dashed',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
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
    marginBottom: 24,
  },
  poolLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  poolItems: {
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
  poolItemSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  poolItemText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  poolItemTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
});
