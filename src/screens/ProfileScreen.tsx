import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Card } from '../components/Card';
import { ReferralModal } from '../components/ReferralModal';
import { supabase, getUserTotalPoints, fetchStreak } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

const LEAGUE_IMAGE = require('../../assets/leagues/League1.png');

const AVATAR_COLORS = [
  '#F472B6', '#FB7185', '#A78BFA', '#FBBF24', '#C084FC',
  '#FDA4AF', '#34D399', '#FCD34D', '#818CF8', '#F97316',
];

interface Friend {
  id: string;
  full_name: string | null;
  email: string | null;
  points: number;
}

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalXp, setTotalXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const [xp, streakData, referredFriends] = await Promise.all([
          getUserTotalPoints(user.id),
          fetchStreak(user.id),
          supabase
            .from('profiles')
            .select('id, full_name, email, points')
            .eq('referred_by', user.id),
        ]);
        setTotalXp(xp);
        setCurrentStreak(streakData.current_streak);
        setLongestStreak(streakData.longest_streak);
        if (!referredFriends.error && referredFriends.data) {
          setFriends(referredFriends.data as Friend[]);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.settingsButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            {user?.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: user.user_metadata.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={48} color={colors.text.secondary} />
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="pencil" size={12} color={colors.background} />
            </View>
          </View>

          <Text style={styles.userName}>
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </Text>

        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Image source={require('../../assets/streakIcon.png')} style={styles.streakIcon} />
            </View>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>DAYS STREAK</Text>
          </View>

          <View style={[styles.statCard, styles.statCardCenter]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.xpDollarIcon}>$</Text>
            </View>
            <Text style={styles.statValue}>{totalXp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Image source={LEAGUE_IMAGE} style={styles.leagueIcon} />
            </View>
            <Text style={styles.statValue}>Stone</Text>
            <Text style={styles.statLabel}>LEAGUE</Text>
          </View>
        </View>

        {/* Invite Banner */}
        <View style={styles.inviteBanner}>
          <View style={styles.inviteIconContainer}>
            <Image source={require('../../assets/present.png')} style={styles.presentIcon} />
          </View>
          <TouchableOpacity style={styles.inviteContent} onPress={() => setShowReferral(true)} activeOpacity={0.7}>
            <Text style={styles.inviteTitle}>Get 2 weeks of Hustlingo Pro for every friend you invite!</Text>
            <Text style={styles.inviteLink}>Invite friends</Text>
          </TouchableOpacity>
        </View>

        {/* Friends Section */}
        <View style={styles.friendsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <TouchableOpacity onPress={() => setShowReferral(true)}>
              <Text style={styles.sectionAction}>+ Add friends</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.friendsCard} padding="none" variant="default">
            {friends.length === 0 ? (
              <View style={styles.friendItem}>
                <Text style={styles.noFriendsText}>Invite friends to see them here!</Text>
              </View>
            ) : (
              friends.map((friend, index) => (
                <View
                  key={friend.id}
                  style={[
                    styles.friendItem,
                    index === friends.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.friendInfo}>
                    <View style={[styles.friendAvatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                      <Ionicons name="person" size={20} color="#fff" />
                    </View>
                    <Text style={styles.friendName}>
                      {friend.full_name || friend.email?.split('@')[0] || 'User'}
                    </Text>
                  </View>
                  <View style={styles.friendStats}>
                    <Ionicons name="flash" size={14} color="#F59E0B" />
                    <Text style={styles.friendXp}>{friend.points?.toLocaleString() ?? 0}</Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      <ReferralModal visible={showReferral} onClose={() => setShowReferral(false)} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  settingsButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userInfoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.surface,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface,
    // Start of update: make sure cards have consistent height
    height: 120,
    justifyContent: 'center',
  },
  statCardCenter: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  xpDollarIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
  streakIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  leagueIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  statValue: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  friendsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  sectionAction: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  friendsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendXp: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'Inter_700Bold',
  },
  noFriendsText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  inviteBanner: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inviteIconContainer: {
    marginRight: 16,
  },
  inviteContent: {
    flex: 1,
  },
  presentIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  inviteTitle: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Inter_500Medium',
  },
  inviteLink: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  logOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  logOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
