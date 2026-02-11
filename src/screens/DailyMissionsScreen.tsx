import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Typography } from '../components/Typography';
import { Ionicons } from '@expo/vector-icons';

const CHEST_BLACK_LOCKED = require('../../assets/chests/chestBlackLocked.png');
const CHEST_BLACK_PLUS_LOCKED = require('../../assets/chests/chestBlackPlusLocked.png');

export const DailyMissionsScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>Missions</Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Complete missions to earn rewards!
          </Typography>
          
          {/* Mascot Image Placeholder - In a real app this would be an image */}
          <View style={styles.mascotContainer}>
             <Ionicons name="gift" size={60} color={colors.accent} />
          </View>
        </View>

        {/* Team Challenge Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="label" color="secondary" style={styles.sectionLabel}>
              TEAM CHALLENGE
            </Typography>
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
              <Typography variant="label" color="secondary" style={styles.timerText}>3 D.</Typography>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContentRow}>
              <View style={styles.cardLeftColumn}>
                <Typography variant="h3" style={styles.cardTitle}>
                  Follow your first friend
                </Typography>
                
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: '0%' }]} />
                  <Typography variant="label" style={styles.progressText}>0 / 1</Typography>
                </View>
              </View>

              <View style={styles.chestIcon}>
                <Image source={CHEST_BLACK_PLUS_LOCKED} style={styles.chestImage} resizeMode="contain" />
              </View>
            </View>

            <TouchableOpacity style={styles.button}>
              <Ionicons name="person-add" size={20} color={colors.text.primary} style={styles.buttonIcon} />
              <Typography variant="h3" style={styles.buttonText}>FIND A FRIEND</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Mission Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="label" color="secondary" style={styles.sectionLabel}>
              DAILY MISSION
            </Typography>
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
              <Typography variant="label" color="secondary" style={styles.timerText}>5 H</Typography>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContentRow}>
              <View style={styles.cardLeftColumn}>
                <Typography variant="h3" style={styles.cardTitle}>
                  Earn 10 pts
                </Typography>
                
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: '100%', backgroundColor: colors.accent }]} />
                  <Typography variant="label" style={styles.progressText}>10 / 10</Typography>
                </View>
              </View>
              
              <View style={styles.chestIcon}>
                <Image source={CHEST_BLACK_LOCKED} style={styles.chestImage} resizeMode="contain" />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
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
  mascotContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    transform: [{ rotate: '15deg' }],
  },
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardLeftColumn: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  chestIcon: {
    width: 72,
    height: 72,
    alignSelf: 'flex-end',
    marginBottom: -10,
  },
  chestImage: {
    width: '100%',
    height: '100%',
  },
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
    backgroundColor: colors.surfaceBorder, // Default empty
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
  button: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    letterSpacing: 1,
  },
});
