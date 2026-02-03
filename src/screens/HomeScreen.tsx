import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Button } from '../components';

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Profiteezy</Text>
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

          {/* Pick up where you left off */}
          <Text style={styles.sectionTitle}>Pick up where you left off</Text>
          
          <View style={styles.card}>
            <View style={styles.cardImageContainer}>
              <Image 
                source={require('../../assets/questionnaire/questionnaireImage1.png')} 
                style={styles.cardImage}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardSubtitle}>4 units • 4 hours</Text>
              <Text style={styles.cardTitle}>First Steps to Profit with AI</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '0%' }]} />
              </View>
              
              <Button 
                title="Start learning" 
                onPress={() => console.log('Start learning pressed')}
                fullWidth
              />
            </View>
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImageContainer: {
    height: 180,
    backgroundColor: '#F5F5F5', // Light background for image to pop if needed
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '60%',
    height: '80%',
  },
  cardContent: {
    padding: 20,
  },
  cardSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
});
