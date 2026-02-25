import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { Button } from '../Button';

interface LessonCompleteModalProps {
  isVisible: boolean;
  onContinue: () => void;
  xpEarned: number;
  correctAnswers: number;
  multiplier?: number;
  currentStreak?: number;
  longestStreak?: number;
}

const MAX_XP = 200;

export const LessonCompleteModal: React.FC<LessonCompleteModalProps> = ({
  isVisible,
  onContinue,
  xpEarned,
  correctAnswers,
  multiplier = 1,
  currentStreak = 0,
  longestStreak = 0,
}) => {
  const insets = useSafeAreaInsets();
  
  // Animation Values
  const progressWidth = useSharedValue(0);
  const opacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  // Calculate target progress percentage (0-100)
  const targetProgress = Math.min((xpEarned / MAX_XP) * 100, 100);

  useEffect(() => {
    if (isVisible) {
      // 1. Reset values first
      progressWidth.value = 0;
      opacity.value = 0;
      contentTranslateY.value = 30;
      
      // 2. Animate Opacity & Slide Up
      opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      contentTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
      
      // 3. Animate Progress Bar filling up after a short delay
      progressWidth.value = withDelay(400, withTiming(targetProgress, { 
        duration: 1000, 
        easing: Easing.out(Easing.cubic) 
      }));
      
    } else {
      opacity.value = 0;
      contentTranslateY.value = 30;
      progressWidth.value = 0;
    }
  }, [isVisible, targetProgress]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (!isVisible) return null;

  return (
    <Modal transparent animationType="fade" visible={isVisible}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Animated.View style={[styles.mainSection, animatedContentStyle]}>
              {/* Header Text */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>Lesson complete!</Text>
                <Text style={styles.subtitle}>Reach your daily goal to get a reward.</Text>
              </View>

              {/* League Image */}
              <View style={styles.imageContainer}>
                <Image 
                  source={require('../../../assets/leagues/League1.png')}
                  style={styles.leagueImage}
                  resizeMode="contain"
                />
              </View>

              {/* League Name */}
              <Text style={styles.leagueName}>Bronze League</Text>
              
              {/* Progress Bar Container */}
              <View style={styles.progressWrapper}>
                <View style={styles.progressBarTrack}>
                  <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
                </View>
                <Text style={styles.xpText}>{xpEarned} / {MAX_XP} XP</Text>
              </View>
            </Animated.View>
          </View>

          {/* Bottom Section: Stats & Button */}
          <Animated.View style={[styles.bottomSection, animatedContentStyle]}>
            {/* Streak Banner */}
            {currentStreak > 0 && (
              <View style={styles.streakBanner}>
                <Image 
                  source={require('../../../assets/streakIcon.png')}
                  style={styles.streakBannerIcon}
                  resizeMode="contain"
                />
                <View style={styles.streakBannerText}>
                  <Text style={styles.streakCount}>{currentStreak} day streak!</Text>
                  {longestStreak > 0 && currentStreak >= longestStreak && currentStreak > 1 && (
                    <Text style={styles.streakRecord}>🎉 New personal best!</Text>
                  )}
                  {longestStreak > currentStreak && (
                    <Text style={styles.streakBest}>Best: {longestStreak} days</Text>
                  )}
                </View>
              </View>
            )}

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                {/* Left Side */}
                <View style={styles.statsLeft}>
                   <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Correct answers</Text>
                      <Text style={styles.statValue}>{correctAnswers}</Text>
                   </View>
                   <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Level 1 multiplier</Text>
                      <Text style={styles.statValue}>x {multiplier}</Text>
                   </View>
                </View>

                {/* Vertical Divider */}
                <View style={styles.verticalDivider} />

                {/* Right Side - Earned */}
                <View style={styles.statsRight}>
                  <Text style={[styles.earnedLabel, { color: colors.accent }]}>EARNED</Text>
                  <Text style={styles.earnedValue}>{xpEarned} XP</Text>
                </View>
              </View>
            </View>

            <Button 
              title="Continue" 
              onPress={onContinue}
              fullWidth
            />
          </Animated.View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainSection: {
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  imageContainer: {
    width: 140,
    height: 140,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueImage: {
    width: '100%',
    height: '100%',
  },
  leagueName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  progressWrapper: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 6,
  },
  xpText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  bottomSection: {
    width: '100%',
    gap: 16,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1F00',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B33',
    padding: 16,
    gap: 14,
  },
  streakBannerIcon: {
    width: 36,
    height: 36,
  },
  streakBannerText: {
    flex: 1,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: -0.3,
  },
  streakRecord: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FBBF24',
    marginTop: 2,
  },
  streakBest: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#1D1D1D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsLeft: {
    flex: 1.2,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  statLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  statsRight: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  earnedValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF', // Specifically requested WHITE for value
  },
});
