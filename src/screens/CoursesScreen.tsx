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

// Local course type with progress
interface Course extends SupabaseCourse {
  progress: number;
  lesson_count: number;
  stage_count: number;
  image_url?: string | null;
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

  if (activeLessonId && selectedCourse) {
    return (
      <LessonScreen
        lessonId={activeLessonId}
        courseId={selectedCourse.id}
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
        key={activeLessonId ? 'refreshed' : selectedCourse.id}
      />
    );
  }

  const renderItem = ({ item }: { item: Course }) => {
    // Determine color based on icon or default to accent
    // If no icon is provided, we can fallback to the app theme accent or a cycled color
    const themeColor = item.icon ? (ICON_COLORS[item.icon] || colors.accent) : colors.accent;

    // For the icon display
    const IconComponent = () => (
      item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.courseImage}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.iconPlaceholder, { backgroundColor: `${themeColor}20` }]}>
          <Text style={[styles.iconText, { color: themeColor }]}>
            {item.title.charAt(0)}
          </Text>
        </View>
      )
    );

    return (
      <TouchableOpacity
        style={[styles.card, { borderColor: themeColor }]}
        onPress={() => setSelectedCourse(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <IconComponent />
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>

        <View style={styles.progressSection}>
          <Text style={styles.sectionText}>STAGES</Text>
          <Text style={styles.progressText}>0/{item.stage_count || item.lesson_count || 20}</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${item.progress * 100}%`, backgroundColor: themeColor }]} />
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
        <Text style={styles.headerTitle}>Career Paths</Text>
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
          contentContainerStyle={[
            styles.listContainer,
            courses.length === 0 && styles.listContainerEmpty,
          ]}
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
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  listContainerEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    // Add subtle shadow/elevation
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressText: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
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
