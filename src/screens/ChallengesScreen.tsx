import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { fetchLeaderboard, LeaderboardEntry } from '../lib/supabase';

// League images
const LEAGUE_IMAGES = {
  league1: require('../../assets/leagues/League1.png'),
  league2: require('../../assets/leagues/League2.png'),
  league3: require('../../assets/leagues/League3.png'),
  league4: require('../../assets/leagues/League4.png'),
  league5: require('../../assets/leagues/League5.png'),
  unavailable: require('../../assets/leagues/LeagueUnavailable.png'),
};

const LEAGUES = [
  { id: 'stone', name: 'Stone', image: LEAGUE_IMAGES.league1, locked: false, active: true },
  { id: 'silver', name: 'Silver', image: LEAGUE_IMAGES.league2, locked: true, active: false },
  { id: 'gold', name: 'Gold', image: LEAGUE_IMAGES.league3, locked: true, active: false },
  { id: 'platinum', name: 'Platinum', image: LEAGUE_IMAGES.league4, locked: true, active: false },
  { id: 'diamond', name: 'Diamond', image: LEAGUE_IMAGES.league5, locked: true, active: false },
];

export const ChallengesScreen = () => {
  const insets = useSafeAreaInsets();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        setLoading(true);
        const data = await fetchLeaderboard();
        if (!cancelled) {
          setLeaderboard(data);
          setLoading(false);
        }
      };
      load();
      return () => { cancelled = true; };
    }, [])
  );

  const renderLeagueHeader = () => (
    <View style={styles.leagueContainer}>
      <View style={styles.leagueIconsRow}>
        {LEAGUES.map((league) => (
          <View
            key={league.id}
            style={[
              styles.leagueIconWrapper,
              league.active && styles.leagueIconActive,
            ]}
          >
            <Image
              source={league.locked ? LEAGUE_IMAGES.unavailable : league.image}
              style={[styles.leagueImage, league.locked && { opacity: 0.3 }]}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>

      <View style={styles.leagueInfoRow}>
        <Text style={styles.leagueName}>Stone League</Text>
        <Text style={styles.timerText}>30d 0h 0m</Text>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    let RankComponent;

    if (item.rank === 1) {
      RankComponent = <Ionicons name="trophy" size={24} color="#FBBF24" />;
    } else if (item.rank === 2) {
      RankComponent = <Ionicons name="trophy" size={24} color="#9CA3AF" />;
    } else if (item.rank === 3) {
      RankComponent = <Ionicons name="trophy" size={24} color="#B45309" />;
    } else {
      RankComponent = <Text style={styles.rankText}>{item.rank}</Text>;
    }

    const rowBg = index % 2 === 0 ? colors.background : colors.surface;

    return (
      <View style={[styles.rankItem, { backgroundColor: rowBg }]}>
        <View style={styles.rankLeft}>
          <View style={styles.rankIconContainer}>
            {RankComponent}
          </View>

          <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>

          <Text style={[styles.userName, item.isCurrentUser && styles.userNameHighlight]}>
            {item.name}{item.isCurrentUser ? ' (You)' : ''}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.pointsIcon}>$</Text>
          <Text style={styles.scoreText}>{item.score.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="podium-outline" size={64} color={colors.text.tertiary} />
        <Text style={styles.emptyText}>No one on the leaderboard yet.{'\n'}Be the first!</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          {renderLeagueHeader()}
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderLeagueHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  loadingContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  leagueContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 0,
  },
  leagueIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leagueIconWrapper: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueIconActive: {
    transform: [{ scale: 1.15 }],
  },
  leagueImage: {
    width: 48,
    height: 48,
  },
  leagueInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leagueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  timerText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: 'Inter_500Medium',
  },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rankIconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Inter_700Bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  userNameHighlight: {
    color: colors.accent,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
});
