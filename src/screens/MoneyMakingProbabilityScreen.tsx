import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

// Assets
const thumbUpImage = require('../../assets/emojis/thumbUpEmoji.png');
const motivationImage = require('../../assets/emojis/stockIncreasingEmoji.png');
const potentialImage = require('../../assets/emojis/moneyBagEmoji.png');
const focusImage = require('../../assets/emojis/hourglassEmoji.png');
const knowledgeImage = require('../../assets/emojis/laptopEmoji.png');

interface StatCardProps {
  icon: any;
  title: string;
  value: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <Image source={icon} style={styles.statIcon} resizeMode="contain" />
      <View>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      </View>
    </View>
  </View>
);

export const MoneyMakingProbabilityScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.headerTitle}>
          Here is your Money Making Probability
        </Text>

        {/* Main Card */}
        <View style={styles.mainCard}>
          
          {/* Readiness Score */}
          <View style={styles.readinessHeader}>
            <Text style={styles.readinessTitle}>Readiness score</Text>
            <View style={styles.resultBadge}>
              <Text style={styles.resultText}>Result: Perfect</Text>
            </View>
          </View>

          {/* Progress Bar Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarLabelContainer}>
               <View style={[styles.indicatorContainer, { left: '50%' }]}>
                  <View style={styles.indicatorBadge}>
                    <Text style={styles.indicatorText}>Moderate</Text>
                  </View>
                  <View style={styles.indicatorDotOuter}>
                     <View style={styles.indicatorDotInner} />
                  </View>
               </View>
            </View>
            
            <LinearGradient
              colors={[colors.error, colors.warning, colors.success]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBar}
            />
            
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>UNPREPARED</Text>
              <Text style={styles.progressLabel}>ADEQUATE</Text>
              <Text style={styles.progressLabel}>PREPARED</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Image source={thumbUpImage} style={styles.infoIcon} resizeMode="contain" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Impressive AI Success Score</Text>
              <Text style={styles.infoText}>
                A 2024 PwC study found that AI professionals in the U.S. earn, on average, 25% more than their non-AI-skilled counterparts in similar roles.
              </Text>
            </View>
          </View>
        </View>

        {/* Grid Stats */}
        <View style={styles.gridContainer}>
          <StatCard 
            icon={motivationImage}
            title="Motivation"
            value="High"
          />
          <StatCard 
            icon={potentialImage}
            title="Potential"
            value="High"
          />
          <StatCard 
            icon={focusImage}
            title="Focus"
            value="Procrastination"
            color={colors.text.secondary} // Assuming grey for non-perfect
          />
          <StatCard 
            icon={knowledgeImage}
            title="AI Knowledge"
            value="Intermediate"
            color={colors.text.secondary}
          />
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    marginBottom: 24,
    marginTop: 10,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    // Add shadow if needed, but surface color usually sufficient in dark mode
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  readinessTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.primary,
  },
  resultBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resultText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  progressSection: {
    marginBottom: 24,
    position: 'relative',
  },
  progressBarLabelContainer: {
    height: 30, // Space for the floating label
    marginBottom: 4,
    width: '100%',
    position: 'relative',
  },
  indicatorContainer: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -30 }], // Half of assumed width approx
    bottom: -10, // Overlap the bar
    zIndex: 10,
  },
  indicatorBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  indicatorText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  indicatorDotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  indicatorDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surface, // Or match theme
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: colors.info,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%', // Slightly less than 50% to account for gap
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.background, // Ensure background covers content behind
  },
  continueButton: {
    backgroundColor: colors.info, // Or accent, sticking to image blue button
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFF',
  },
});
