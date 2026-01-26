import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { usePlacement } from 'expo-superwall';
import { colors } from '../theme/colors';

export const HomeScreen = () => {
  const { registerPlacement, state } = usePlacement({
    onPresent: (info) => {
      console.log('Paywall presented:', info.name);
    },
    onDismiss: (info, result) => {
      console.log('Paywall dismissed:', result.type);
      if (result.type === 'purchased') {
        Alert.alert('Success!', 'Thank you for your purchase!');
      }
    },
    onSkip: (reason) => {
      console.log('Paywall skipped:', reason.type);
    },
    onError: (error) => {
      console.error('Paywall error:', error);
      Alert.alert('Error', `Failed to present paywall: ${error}`);
    },
  });

  const handleUnlockPremium = async () => {
    await registerPlacement({
      placement: 'campaign_trigger', // Default placement name from Superwall
      feature: () => {
        // This function only runs if no paywall is shown (user is allowed through)
        Alert.alert('Feature Unlocked', 'You have access to premium features!');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profiteezy</Text>
          <Text style={styles.subtitle}>Your Profit Management Solution</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome! 👋</Text>
          <Text style={styles.cardText}>
            Start tracking your business profits and make data-driven decisions.
          </Text>
        </View>

        {/* Paywall Demo Button */}
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={handleUnlockPremium}
          activeOpacity={0.8}
        >
          <Text style={styles.premiumButtonText}>✨ Unlock Premium Features</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$0</Text>
            <Text style={styles.statLabel}>Total Profit</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Track Profits</Text>
              <Text style={styles.featureDescription}>
                Monitor your business profits in real-time
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📈</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Analytics</Text>
              <Text style={styles.featureDescription}>
                Get detailed insights and reports
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💰</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Revenue Tracking</Text>
              <Text style={styles.featureDescription}>
                Track all your revenue streams
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  premiumButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
