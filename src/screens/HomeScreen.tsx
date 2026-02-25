import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  Course,
  supabase,
  fetchDailyMissions,
  getUserTotalPoints,
  fetchStreak,
  UserDailyMission,
  TOTAL_DAILY_MISSIONS,
} from '../lib/supabase';
import { CoursePathScreen } from './CoursePathScreen';
import { LessonScreen } from './LessonScreen';
import { CourseSelectionModal, Button, LoadingScreen } from '../components';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

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

      // Step 1: Get user + course in parallel (fast — just 2 small queries)
      const { data: { user } } = await supabase.auth.getUser();

      let courseData: Course | null = null;
      if (courseId) {
        const { data } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        if (data) courseData = data as Course;
      }
      if (!courseData) {
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .eq('is_live', true)
          .limit(1);
        if (courses?.length) courseData = courses[0] as Course;
      }

      // Set course immediately so CoursePathScreen starts loading right away
      if (courseData) {
        setCourse(courseData);
      } else {
        setCourse(null);
        setUserPoints(0);
      }

      // Step 2: Fetch points, missions, and streak in parallel (doesn't block the course path)
      if (user && courseData) {
        const [points, dailyMissions, streakData] = await Promise.all([
          getUserTotalPoints(user.id),
          fetchDailyMissions(user.id),
          fetchStreak(user.id),
        ]);
        setUserPoints(points);
        setMissions(dailyMissions);
        setStreak(streakData.current_streak);
      } else if (user) {
        const [dailyMissions, streakData] = await Promise.all([
          fetchDailyMissions(user.id),
          fetchStreak(user.id),
        ]);
        setMissions(dailyMissions);
        setStreak(streakData.current_streak);
      }
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
    return <LoadingScreen />;
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
          <Button
            title="Select a Course"
            onPress={() => setShowCourseModal(true)}
            size="large"
          />
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
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark" size={22} color={colors.accent} style={styles.checkmarkIcon} />
            <Ionicons name="checkmark" size={22} color={colors.accent} style={styles.checkmarkIconBold} />
          </View>
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
  checkmarkContainer: {
    position: 'relative',
    width: 22,
    height: 22,
  },
  checkmarkIcon: {
    position: 'absolute',
  },
  checkmarkIconBold: {
    position: 'absolute',
    left: 0.5,
    top: 0.5,
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
  // startButton styles removed - now using Button component
});
