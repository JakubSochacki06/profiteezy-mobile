import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Button } from '../components';
import { getCurrentLearningState, Course, Lesson, UserDailyMission, fetchDailyMissions, supabase } from '../lib/supabase';
import { TouchableOpacity } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

interface LearningState {
  course: Course | null;
  nextLesson: Lesson | null;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

const DAILY_MISSIONS = [
  { key: 'complete_lesson', title: 'Complete a lesson', target: 1, reward: 25, icon: 'book-outline' as const },
  { key: 'earn_points', title: 'Earn 50 points', target: 50, reward: 15, icon: 'star-outline' as const },
];

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<any>>();

  const [learningState, setLearningState] = useState<LearningState | null>(null);
  const [missions, setMissions] = useState<UserDailyMission[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch learning state on focus (refreshes when coming back from lessons)
  useFocusEffect(
    useCallback(() => {
      fetchLearningState();
    }, [])
  );

  const fetchLearningState = async () => {
    try {
      setLoading(true);
      const [state, { data: { user } }] = await Promise.all([
        getCurrentLearningState(),
        supabase.auth.getUser(),
      ]);
      setLearningState(state);

      if (user) {
        const dailyMissions = await fetchDailyMissions(user.id);
        setMissions(dailyMissions);
      }
    } catch (err) {
      console.error('Error fetching learning state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    // Navigate to Courses tab
    navigation.navigate('Courses' as never);
  };

  // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const today = new Date().getDay();

  const days = [
    { day: 'Mon', active: today === 1 },
    { day: 'Tue', active: today === 2 },
    { day: 'Wed', active: today === 3 },
    { day: 'Thu', active: today === 4 },
    { day: 'Fri', active: today === 5 },
    { day: 'Sat', active: today === 6 },
    { day: 'Sun', active: today === 0 },
  ];

  // Calculate progress percentage
  const progressPercent = learningState?.progress || 0;
  const hasProgress = learningState && learningState.completedLessons > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Hustlingo</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flash" size={16} color={colors.text.secondary} />
              <Text style={styles.streakCount}>0</Text>
            </View>
          </View>

          {/* Streak Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.streakHeader}>
              <Ionicons name="flash" size={20} color={colors.text.secondary} />
              <Text style={styles.streakTitle}>Finish 1 lesson to begin your streak</Text>
            </View>
            <View style={styles.daysContainer}>
              {days.map((item, index) => (
                <View key={index} style={styles.dayItem}>
                  <View style={styles.dayIconCircle}>
                    <Ionicons name="flash" size={16} color={colors.text.tertiary} />
                  </View>
                  <Text style={[styles.dayText, item.active && styles.dayTextActive]}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Continue learning card */}
          <Text style={styles.sectionTitle}>
            {hasProgress ? 'Pick up where you left off' : 'Start your journey'}
          </Text>

          <TouchableOpacity style={styles.card} onPress={handleStartLearning} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ margin: 16 }} />
            ) : (
              <>
                <View style={styles.cardImageContainer}>
                  {learningState?.course?.image_url ? (
                    <Image
                      source={{ uri: learningState.course.image_url }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons name="book" size={24} color={colors.text.tertiary} />
                    </View>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {learningState?.nextLesson?.title || learningState?.course?.title || 'Start learning'}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {learningState?.course?.title || 'No course yet'} • {learningState?.completedLessons}/{learningState?.totalLessons} lessons
                  </Text>
                </View>
                <View style={styles.cardButton}>
                  <Ionicons name="play" size={18} color={colors.background} />
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Daily Missions */}
          <View style={styles.missionsSection}>
            <View style={styles.missionsHeader}>
              <View style={styles.missionsHeaderLeft}>
                <Ionicons name="flag" size={20} color={colors.accent} />
                <Text style={styles.missionsTitle}>Daily Missions</Text>
              </View>
              <Text style={styles.missionsCount}>
                {missions.filter(m => m.is_completed).length}/{DAILY_MISSIONS.length}
              </Text>
            </View>

            {DAILY_MISSIONS.map((mission) => {
              const userMission = missions.find(m => m.mission_key === mission.key);
              const isCompleted = userMission?.is_completed ?? false;
              const progress = userMission?.progress ?? 0;

              return (
                <View key={mission.key} style={styles.missionRow}>
                  <View style={[styles.missionCheckbox, isCompleted && styles.missionCheckboxDone]}>
                    {isCompleted && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <View style={styles.missionInfo}>
                    <Text style={[styles.missionTitle, isCompleted && styles.missionTitleDone]}>
                      {mission.title}
                    </Text>
                    <Text style={styles.missionProgress}>
                      {Math.min(progress, mission.target)}/{mission.target}
                    </Text>
                  </View>
                  <View style={styles.missionReward}>
                    <Ionicons name={mission.icon} size={14} color={colors.accent} />
                    <Text style={styles.missionRewardText}>+{mission.reward} XP</Text>
                  </View>
                </View>
              );
            })}
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoContainer: {
    backgroundColor: colors.surface, // Or transparent if preferred
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoText: {
    color: colors.text.primary,
    fontSize: 18,
    fontFamily: 'Inter_700Bold', // Assuming fonts are loaded in App/Login
    fontWeight: 'bold',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakCount: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sectionContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakTitle: {
    color: colors.text.secondary,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
  },
  dayIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  dayTextActive: {
    color: colors.accent,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  cardSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  cardButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  missionsSection: {
    marginTop: 30,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  missionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  missionsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionsTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  missionsCount: {
    color: colors.text.secondary,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  missionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missionCheckboxDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  missionTitleDone: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  missionProgress: {
    color: colors.text.secondary,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  missionReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(95, 203, 15, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  missionRewardText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_500Medium',
  },
});
