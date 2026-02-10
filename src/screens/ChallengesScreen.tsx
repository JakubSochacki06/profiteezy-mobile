import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Text,
  StatusBar,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../components/Typography';

// League images
const LEAGUE_IMAGES = {
  league1: require('../../assets/leagues/League1.png'),
  league2: require('../../assets/leagues/League2.png'),
  league3: require('../../assets/leagues/League3.png'),
  league4: require('../../assets/leagues/League4.png'),
  league5: require('../../assets/leagues/League5.png'),
  unavailable: require('../../assets/leagues/LeagueUnavailable.png'),
};

// Mock Data for Leaderboard
const LEADERBOARD_DATA = [
  { id: '1', name: 'Carolina', score: 3644, rank: 1, avatarColor: '#F472B6' },
  { id: '2', name: 'Valfera', score: 2004, rank: 2, avatarColor: '#FB7185' },
  { id: '3', name: 'Noah Brown', score: 1686, rank: 3, avatarColor: '#A78BFA' },
  { id: '4', name: 'DeiMudder', score: 1405, rank: 4, avatarColor: '#FBBF24' },
  { id: '5', name: 'Maryam', score: 1380, rank: 5, avatarColor: '#C084FC' },
  { id: '6', name: 'RenatoW97', score: 1250, rank: 6, avatarColor: '#FDA4AF' },
  { id: '7', name: 'Ksu', score: 1226, rank: 7, avatarColor: '#34D399' },
  { id: '8', name: 'BENJIHAD', score: 1185, rank: 8, avatarColor: '#FCD34D' },
  { id: '9', name: 'ref', score: 1180, rank: 9, avatarColor: '#818CF8' },
];

const LEAGUES = [
  { id: 'stone', name: 'Stone', image: LEAGUE_IMAGES.league1, locked: false, active: true },
  { id: 'silver', name: 'Silver', image: LEAGUE_IMAGES.league2, locked: true, active: false },
  { id: 'gold', name: 'Gold', image: LEAGUE_IMAGES.league3, locked: true, active: false },
  { id: 'platinum', name: 'Platinum', image: LEAGUE_IMAGES.league4, locked: true, active: false },
  { id: 'diamond', name: 'Diamond', image: LEAGUE_IMAGES.league5, locked: true, active: false },
];

export const ChallengesScreen = () => {
  const insets = useSafeAreaInsets();

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
        <Text style={styles.timerText}>0d 20h 36m</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: typeof LEADERBOARD_DATA[0] }) => {
    let RankComponent;

    if (item.rank === 1) {
      RankComponent = <Ionicons name="trophy" size={24} color="#FBBF24" />; // Gold
    } else if (item.rank === 2) {
      RankComponent = <Ionicons name="trophy" size={24} color="#9CA3AF" />; // Silver
    } else if (item.rank === 3) {
      RankComponent = <Ionicons name="trophy" size={24} color="#B45309" />; // Bronze
    } else {
      RankComponent = <Text style={styles.rankText}>{item.rank}</Text>;
    }

    return (
      <View style={styles.rankItem}>
        <View style={styles.rankLeft}>
          <View style={styles.rankIconContainer}>
            {RankComponent}
          </View>

          <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>

          <Text style={styles.userName}>{item.name}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Ionicons name="flash" size={16} color="#FBBF24" style={{ marginRight: 4 }} />
          <Text style={styles.scoreText}>{item.score}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      <FlatList
        data={LEADERBOARD_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderLeagueHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
});
