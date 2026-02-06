import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from '../components';
import { CoursePathScreen } from './CoursePathScreen';
import { LessonScreen } from './LessonScreen';
import { supabase, Course as SupabaseCourse } from '../lib/supabase';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2;

// Local course type with progress
interface Course extends SupabaseCourse {
  progress: number;
}

// Fallback image for courses without an image_url
const DEFAULT_COURSE_IMAGE = require('../../assets/emojis/laptopEmoji.png');

// Map icon names to colors for visual variety
const ICON_COLORS: Record<string, string> = {
  'FaYoutube': '#FF0000',
  'FaTshirt': '#9333EA',
  'FaBookOpen': '#3B82F6',
  'FaLink': '#10B981',
  'FaShoppingCart': '#F59E0B',
  'FaShippingFast': '#6366F1',
  'FaChartLine': '#EC4899',
  'FaUserGraduate': '#14B8A6',
  'FaCloud': '#0EA5E9',
  'FaUsers': '#8B5CF6',
  'FaExchangeAlt': '#F97316',
  'FaUserCircle': '#EF4444',
  'FaTags': '#84CC16',
};

export const CoursesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  
  // Data fetching state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from Supabase
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== FETCHING COURSES ===');

      // Fetch live courses with lesson count
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select(`
          *,
          stages (id),
          lessons (id)
        `)
        .eq('is_live', true)
        .order('title', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      console.log('=== RAW COURSES DATA ===');
      console.log(JSON.stringify(data, null, 2));

      // Transform data to include lesson count and default progress
      const coursesWithProgress: Course[] = (data || []).map((course: any) => {
        const lessonCount = course.lessons?.length || 0;
        const stageCount = course.stages?.length || 0;

        return {
          ...course,
          lesson_count: lessonCount,
          stage_count: stageCount,
          progress: 0, // TODO: Fetch actual progress from user_courses table
        };
      });

      console.log('=== PROCESSED COURSES ===');
      coursesWithProgress.forEach(c => {
        console.log(`- ${c.title}: ${c.lesson_count} lessons, ${c.stage_count} stages`);
      });

      setCourses(coursesWithProgress);
    } catch (err: any) {
      console.error('=== ERROR FETCHING COURSES ===');
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Hide tab bar ONLY when lesson is active (not for course path)
  useLayoutEffect(() => {
    if (activeLessonId) {
      navigation.setOptions({
        tabBarStyle: { display: 'none' },
      });
    } else {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          display: 'flex',
        },
      });
    }
  }, [activeLessonId, navigation]);

  useEffect(() => {
    const onBackPress = () => {
      if (activeLessonId) {
        setActiveLessonId(null);
        return true;
      }
      if (selectedCourse) {
        setSelectedCourse(null);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedCourse, activeLessonId]);

  if (activeLessonId) {
    return (
      <LessonScreen 
        lessonId={activeLessonId}
        onClose={() => setActiveLessonId(null)}
        onComplete={() => {
          console.log('Lesson completed');
          setActiveLessonId(null);
        }}
      />
    );
  }

  if (selectedCourse) {
    return (
      <CoursePathScreen 
        course={selectedCourse} 
        onBack={() => setSelectedCourse(null)} 
        onStartLesson={(lessonId) => setActiveLessonId(lessonId)}
      />
    );
  }

  const renderItem = ({ item }: { item: Course }) => {
    const iconColor = item.icon ? (ICON_COLORS[item.icon] || colors.accent) : colors.accent;
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => setSelectedCourse(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={[styles.imageContainer, !item.image_url && { backgroundColor: `${iconColor}20` }]}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.courseImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={[styles.iconText, { color: iconColor }]}>
                {item.title.charAt(0)}
              </Text>
            )}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>
            {item.lesson_count || 0} lessons • {item.difficulty || 'Beginner'}
          </Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No courses available</Text>
      <Text style={styles.emptySubtitle}>Check back later for new content</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchCourses}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="chevron-back" size={24} color={colors.text.primary} />}
          onPress={() => navigation.navigate('Home' as never)}
          variant="filled"
        />
        <Text style={styles.headerTitle}>Your Mastery path</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.listContainer,
            courses.length === 0 && styles.listContainerEmpty,
          ]}
          columnWrapperStyle={courses.length > 0 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={loading}
          onRefresh={fetchCourses}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContainerEmpty: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface, 
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  iconText: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  cardImage: {
    width: 60,
    height: 60,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 12,
    fontFamily: 'Inter_500Medium',
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: 'Inter_500Medium',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    fontFamily: 'Inter_600SemiBold',
  },
});
