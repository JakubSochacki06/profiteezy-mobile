import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase, Course, getCourseProgress } from '../lib/supabase';
import { Button } from './Button';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CourseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCourse: (course: Course) => void;
  currentCourseId?: string;
}

interface CourseWithProgress extends Course {
  progressPercentage: number;
}

export const CourseSelectionModal: React.FC<CourseSelectionModalProps> = ({
  visible,
  onClose,
  onSelectCourse,
  currentCourseId,
}) => {
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(currentCourseId || null);

  useEffect(() => {
    if (visible) {
      fetchCourses();
      setSelectedId(currentCourseId || null);
    }
  }, [visible, currentCourseId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_live', true)
        .order('title', { ascending: true });

      if (error) throw error;
      
      const coursesData = data || [];
      const coursesWithProgress: CourseWithProgress[] = await Promise.all(
        coursesData.map(async (course) => {
          const progress = await getCourseProgress(course.id);
          return {
            ...course,
            progressPercentage: progress.percentage,
          };
        })
      );

      setCourses(coursesWithProgress);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (course: Course) => {
    setSelectedId(course.id);
  };

  const handleConfirm = () => {
    const selectedCourse = courses.find((c) => c.id === selectedId);
    if (selectedCourse) {
      onSelectCourse(selectedCourse);
    }
    onClose();
  };

  const renderItem = ({ item }: { item: CourseWithProgress }) => {
    const isSelected = selectedId === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.courseItem,
          isSelected && styles.courseItemSelected
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.courseInfo}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.courseImage} />
          ) : (
            <View style={styles.courseImagePlaceholder}>
              <Text style={styles.courseInitial}>{item.title.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {item.progressPercentage > 0 
                  ? `${item.progressPercentage}% Completed` 
                  : 'Start Course'}
              </Text>
              {item.progressPercentage > 0 && (
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${item.progressPercentage}%` }
                    ]} 
                  />
                </View>
              )}
            </View>
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Course</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <Text style={styles.sectionTitle}>Available Courses</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={courses}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}>
          <Button 
            title="CHECK" 
            onPress={handleConfirm}
            disabled={!selectedId}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginLeft: 20,
    marginBottom: 12,
    fontFamily: 'Inter_700Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  courseItemSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(95, 203, 15, 0.05)',
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courseImage: {
    width: 48,
    height: 48, 
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'contain',
  },
  courseImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  courseInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  progressContainer: {
    gap: 6,
  },
  progressText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: 'Inter_500Medium',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    width: '100%',
    maxWidth: 120,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  checkIcon: {
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
