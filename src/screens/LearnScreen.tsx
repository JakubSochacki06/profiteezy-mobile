import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const LearnScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Learn</Text>
          </View>

          {/* Content Placeholder */}
          <View style={styles.placeholderContainer}>
            <Ionicons name="book-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.placeholderTitle}>Learning Content</Text>
            <Text style={styles.placeholderText}>
              Your courses and lessons will appear here
            </Text>
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
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  placeholderTitle: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginTop: 20,
    marginBottom: 10,
  },
  placeholderText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
