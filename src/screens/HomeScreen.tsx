import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import {
  getCurrentLearningState,
  Course,
  supabase,
  fetchDailyMissions,
  UserDailyMission,
} from '../lib/supabase';
import { CoursePathScreen } from './CoursePathScreen';
import { LessonScreen } from './LessonScreen';
import { CourseSelectionModal } from '../components';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const TOTAL_DAILY_MISSIONS = 2;

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<any>>();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [missions, setMissions] = useState<UserDailyMission[]>([]);
  const [streak, setStreak] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Calculate bottom padding for tab bar
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 8);
  const tabBarHeight = Platform.OS === 'ios' 
    ? 60 + bottomPadding 
    : 60 + bottomPadding;

  // Hide tab bar when lesson is active for full screen experience
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
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          display: 'flex',
        },
      });
    }
  }, [activeLessonId, navigation, tabBarHeight, bottomPadding]);

  const fetchState = async (courseId?: string) => {
    try {
      if (!course) setLoading(true);

      const [state, { data: { user } }] = await Promise.all([
        getCurrentLearningState(courseId),
        supabase.auth.getUser(),
      ]);

      if (state?.course) {
        setCourse(state.course);
        setUserPoints(state.totalPoints);
      } else {
        setCourse(null);
        setUserPoints(0);
      }

      if (user) {
        const dailyMissions = await fetchDailyMissions(user.id);
        setMissions(dailyMissions);
      }

      // TODO: fetch real streak from DB when available
      setStreak(0);
    } catch (err) {
      console.error('Error fetching home state:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!activeLessonId) {
        // If we have a current course, try to refresh it specifically, otherwise default behavior
        fetchState(course?.id);
      }
    }, [activeLessonId])
  );

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
  };

  const handleLessonClose = () => {
    setActiveLessonId(null);
    fetchState(course?.id);
  };

  const handleLessonComplete = () => {
    setActiveLessonId(null);
    fetchState(course?.id);
  };

  const handleCourseSelect = (selectedCourse: Course) => {
    // Optimistically update course to show loading state or new content immediately
    setCourse(selectedCourse);
    // Fetch full state for this course (progress etc)
    fetchState(selectedCourse.id);
  };

  const completedMissions = missions.filter((m) => m.is_completed).length;

  if (activeLessonId && course) {
    return (
      <LessonScreen
        lessonId={activeLessonId}
        courseId={course.id}
        onClose={handleLessonClose}
        onComplete={handleLessonComplete}
      />
    );
  }

  if (loading && !course) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={80} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Start your journey</Text>
          <Text style={styles.emptySubtitle}>
            Choose a course to begin learning and track your progress here.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowCourseModal(true)}
          >
            <Text style={styles.startButtonText}>Select a Course</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Top Stats Bar */}
      <View style={[styles.statsBar, { paddingTop: insets.top + 8 }]}>
        {/* Course Image - Clickable */}
        <TouchableOpacity 
          style={styles.statItem} 
          onPress={() => setShowCourseModal(true)}
          activeOpacity={0.7}
        >
          {course.image_url ? (
            <Image 
              source={{ uri: course.image_url }} 
              style={styles.courseImage} 
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.courseImage, styles.courseImagePlaceholder]}>
              <Ionicons name="book" size={18} color={colors.text.tertiary} />
            </View>
          )}
        </TouchableOpacity>

        {/* Streak */}
        <View style={styles.statItem}>
          <Image source={require('../../assets/streakIcon.png')} style={styles.streakIcon} />
          <Text style={styles.statValue}>{streak}</Text>
        </View>

        {/* User Points */}
        <View style={styles.statItem}>
          <Text style={styles.pointsIcon}>$</Text>
          <Text style={styles.statValue}>{userPoints}</Text>
        </View>

        {/* Daily Missions */}
        <View style={styles.statItem}>
          <Ionicons name="checkbox" size={22} color={colors.accent} />
          <Text style={styles.statValue}>
            {completedMissions}/{TOTAL_DAILY_MISSIONS}
          </Text>
        </View>
      </View>

      {/* Course Path without its own header */}
      <CoursePathScreen
        course={course}
        showBackButton={false}
        showHeader={false}
        onStartLesson={handleStartLesson}
        key={course.id}
      />

      {/* Course Selection Modal */}
      <CourseSelectionModal
        visible={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        onSelectCourse={handleCourseSelect}
        currentCourseId={course.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  pointsIcon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
  courseImage: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  courseImagePlaceholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  startButton: {
    marginTop: 24,
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
});
