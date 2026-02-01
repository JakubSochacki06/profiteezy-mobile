import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { QuestionnaireScreenWrapper } from '../components';
import { MoneyMakingProbabilityResultData } from '../types';

const thumbUpImage = require('../../../assets/emojis/thumbUpEmoji.png');
const defaultIcons = {
  motivation: require('../../../assets/emojis/stockIncreasingEmoji.png'),
  potential: require('../../../assets/emojis/moneyBagEmoji.png'),
  focus: require('../../../assets/emojis/hourglassEmoji.png'),
  knowledge: require('../../../assets/emojis/laptopEmoji.png'),
};

interface Props {
  data: MoneyMakingProbabilityResultData;
  onContinue: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export const MoneyMakingProbabilityResultScreen: React.FC<Props> = ({
  data,
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const marker = Math.max(0, Math.min(1, data.markerValue ?? 0.5));

  const stats =
    data.stats ?? [
      { title: 'Motivation', value: 'High', icon: defaultIcons.motivation },
      { title: 'Potential', value: 'High', icon: defaultIcons.potential },
    ];

  return (
    <QuestionnaireScreenWrapper
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onContinue}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        centerContent={true}
      >
        {/* <Text style={styles.headerTitle}>{data.title}</Text> */}

        <View style={styles.mainCard}>
          <View style={styles.readinessHeader}>
            <Text style={styles.readinessTitle}>{data.scoreTitle ?? 'Readiness score'}</Text>
            <View style={styles.resultBadge}>
              <Text style={styles.resultText}>{data.resultLabel ?? 'Result: Perfect'}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBarLabelContainer}>
              <View style={[styles.indicatorContainer, { left: `${marker * 100}%` }]}>
                <View style={styles.indicatorBadge}>
                  <Text style={styles.indicatorText}>{data.markerLabel ?? 'Moderate'}</Text>
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

          <View style={styles.infoCard}>
            <Image source={thumbUpImage} style={styles.infoIcon} resizeMode="contain" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{data.infoTitle ?? 'Impressive Money Success Score'}</Text>
              <Text style={styles.infoText}>
                {
                  'People with similar choices to yours are 73% more likely to achieve their financial goals within the first 6 months. You\'re on the right track!'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.gridContainer}>
          {stats.slice(0, 2).map((s) => (
            <View key={s.title} style={styles.statCard}>
              <View style={styles.statHeader}>
                {s.icon ? <Image source={s.icon} style={styles.statIcon} resizeMode="contain" /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.statTitle}>{s.title}</Text>
                  <Text style={[styles.statValue, s.muted ? { color: colors.text.secondary } : null]}>
                    {s.value}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </QuestionnaireScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  readinessTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },
  resultBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  resultText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  progressSection: {
    marginBottom: 20,
    position: 'relative',
  },
  progressBarLabelContainer: {
    height: 34,
    marginBottom: 2,
    width: '100%',
    position: 'relative',
  },
  indicatorContainer: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -30 }],
    bottom: -10,
    zIndex: 10,
  },
  indicatorBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    // color: colors.background,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  indicatorText: {
    color: colors.text.primary,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  indicatorDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surface,
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
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 22,
    height: 22,
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
    color: '#FFF',
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
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
    width: 30,
    height: 30,
    marginRight: 12,
  },
  statTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },
});
