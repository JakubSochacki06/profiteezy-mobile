import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Typography } from '../components/Typography';

interface Challenge {
  id: string;
  title: string;
  duration: string;
  level: string;
  image: any; // Using any for require() images
  bgColor: string; // Background color for image container
}

const CHALLENGES_DATA: Challenge[] = [
  {
    id: '1',
    title: '2026 28-Day AI Challenge',
    duration: '28 days',
    level: 'Beginner',
    image: require('../../assets/questionnaire/questionnaireImage1.png'), // Placeholder
    bgColor: '#E0F2FE', // Light blue-ish
  },
  {
    id: '2',
    title: 'Junior AI Challenge',
    duration: '28 days',
    level: 'Beginner',
    image: require('../../assets/questionnaire/questionnaireImage1.png'), // Placeholder
    bgColor: '#FFFFFF',
  },
  {
    id: '3',
    title: 'AI Art Challenge',
    duration: '14 days',
    level: 'Intermediate',
    image: require('../../assets/questionnaire/questionnaireImage1.png'), // Placeholder
    bgColor: '#F3E8FF', // Light purple-ish
  },
];

export const ChallengesScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Typography variant="h1">Challenges</Typography>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {CHALLENGES_DATA.map((challenge) => (
            <TouchableOpacity 
              key={challenge.id} 
              style={styles.card}
              activeOpacity={0.9}
            >
              <View style={[styles.cardImageContainer, { backgroundColor: challenge.bgColor }]}>
                {/* 
                  In a real app, these would be different images. 
                  For now using a placeholder image logic or icons.
                */}
                 <Image 
                    source={challenge.image} 
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
              </View>
              
              <View style={styles.cardContent}>
                <Typography variant="h3" style={styles.cardTitle}>
                  {challenge.title}
                </Typography>
                <Typography variant="body" color="secondary">
                  {challenge.duration} • {challenge.level}
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImageContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardImage: {
    width: '80%',
    height: '80%',
  },
  cardContent: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    marginBottom: 4,
  },
});
