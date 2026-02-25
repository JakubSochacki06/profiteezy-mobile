import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import {
  supabase,
  fetchDailyMissions,
  UserDailyMission,
  MISSION_DEFINITIONS,
  MissionDefinition,
} from '../lib/supabase';

const CHEST_BLACK_LOCKED = require('../../assets/chests/chestBlackLocked.png');
const CHEST_BLACK_PLUS_LOCKED = require('../../assets/chests/chestBlackPlusLocked.png');
const CHEST_BLACK_UNLOCKED = require('../../assets/chests/chestBlackUnlocked.png');

/** Calculate hours remaining until midnight local time */
function getHoursUntilReset(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}H`;
  return `${minutes}M`;
}

export const DailyMissionsScreen = () => {
  const insets = useSafeAreaInsets();
  const [missions, setMissions] = useState<UserDailyMission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMissions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const data = await fetchDailyMissions(user.id);
        setMissions(data);
      }
    } catch (err) {
      console.error('Error loading missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, [])
  );

  /** Get the DB row for a mission key */
  const getMissionProgress = (key: string): UserDailyMission | undefined =>
    missions.find((m) => m.mission_key === key);

  const completedCount = missions.filter((m) => m.is_completed).length;
  const totalCount = MISSION_DEFINITIONS.length;
  const timeLeft = getHoursUntilReset();

  // Split missions: first = featured top, rest = regular daily missions
  const topMission = MISSION_DEFINITIONS[0]; // invite_friend
  const dailyMissions = MISSION_DEFINITIONS.slice(1); // earn_points, complete_lessons, correct_first_try

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Missions
          </Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Complete daily missions to earn rewards!
          </Typography>

          {/* Progress summary */}
          <View style={styles.headerBadge}>
            <View style={styles.checkmarkContainer}>
              <Ionicons
                name="checkmark"
                size={20}
                color={colors.accent}
              />
              <Ionicons
                name="checkmark"
                size={20}
                color={colors.accent}
                style={styles.checkmarkBold}
              />
            </View>
            <Typography variant="h3" color="accent">
              {completedCount}/{totalCount}
            </Typography>
          </View>
        </View>

        {/* Featured Top Mission – Invite your first friend */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography
              variant="label"
              color="secondary"
              style={styles.sectionLabel}
            >
              FRIEND CHALLENGE
            </Typography>
          </View>

          <MissionCard
            definition={topMission}
            progress={getMissionProgress(topMission.key)}
            variant="featured"
          />
        </View>

        {/* Daily Missions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography
              variant="label"
              color="secondary"
              style={styles.sectionLabel}
            >
              DAILY MISSIONS
            </Typography>
            <View style={styles.timerContainer}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Typography
                variant="label"
                color="secondary"
                style={styles.timerText}
              >
                {timeLeft}
              </Typography>
            </View>
          </View>

          {dailyMissions.map((def) => (
            <MissionCard
              key={def.key}
              definition={def}
              progress={getMissionProgress(def.key)}
              variant="default"
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ─────────────────────── Mission Card Component ───────────────────────

interface MissionCardProps {
  definition: MissionDefinition;
  progress?: UserDailyMission;
  variant: 'featured' | 'default';
}

const MissionCard: React.FC<MissionCardProps> = ({
  definition,
  progress,
  variant,
}) => {
  const current = progress?.progress ?? 0;
  const target = definition.target;
  const isCompleted = progress?.is_completed ?? false;
  const percentage = Math.min((current / target) * 100, 100);

  const isFeatured = variant === 'featured';

  const progressBarColor = isCompleted ? colors.accent : colors.text.tertiary;

  const chestImage = isFeatured
    ? CHEST_BLACK_PLUS_LOCKED
    : isCompleted
    ? CHEST_BLACK_UNLOCKED
    : CHEST_BLACK_LOCKED;

  return (
    <View style={styles.card}>
      <View style={styles.cardContentRow}>
        <View style={styles.cardLeftColumn}>
          {/* Title */}
          <Typography
            variant="h3"
            style={styles.cardTitle}
            color={isCompleted ? 'accent' : 'primary'}
          >
            {definition.title}
          </Typography>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${percentage}%`,
                  backgroundColor: progressBarColor,
                },
              ]}
            />
            <Typography variant="label" style={styles.progressText}>
              {current} / {target}
            </Typography>
          </View>
        </View>

        <View style={styles.chestIcon}>
          <Image
            source={chestImage}
            style={styles.chestImage}
            resizeMode="contain"
          />
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
            </View>
          )}
        </View>
      </View>

      {/* Featured card gets a green action button */}
      {isFeatured && !isCompleted && (
        <View style={styles.buttonContainer}>
          <Button
            title="INVITE A FRIEND"
            onPress={() => {}}
            variant="primary"
            size="medium"
            fullWidth
            leftIcon={<Ionicons name="person-add" size={20} color={colors.background} />}
          />
        </View>
      )}
    </View>
  );
};

// ─────────────────────── Styles ───────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
  },

  // Header
  header: {
    marginBottom: 30,
    position: 'relative',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: '70%',
  },
  headerBadge: {
    position: 'absolute',
    right: 0,
    top: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkmarkContainer: {
    position: 'relative',
    width: 20,
    height: 20,
  },
  checkmarkBold: {
    position: 'absolute',
    left: 0.5,
    top: 0.5,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontWeight: 'bold',
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardLeftColumn: {
    flex: 1,
    marginRight: 16,
  },

  // Mission title
  cardTitle: {
    fontSize: 16,
    marginBottom: 12,
  },

  // Chest
  chestIcon: {
    width: 56,
    height: 56,
    alignSelf: 'flex-end',
    marginBottom: -4,
    position: 'relative',
  },
  chestImage: {
    width: '100%',
    height: '100%',
  },
  completedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.background,
    borderRadius: 10,
  },

  // Progress bar
  progressBarContainer: {
    height: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: colors.surfaceBorder,
  },
  progressText: {
    textAlign: 'center',
    zIndex: 1,
    color: colors.text.primary,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Button container
  buttonContainer: {
    marginTop: 12,
  },
});
