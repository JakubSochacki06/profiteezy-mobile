import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { WelcomeScreenData } from '../types';

interface WelcomeScreenProps {
  data: WelcomeScreenData;
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  data,
  onContinue,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        {/* Hidden Navbar (for spacing consistency) */}
        <View style={styles.hiddenNavbar} />

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={data.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {data.title}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{data.subtitle}</Text>

        {/* Bottom Section - directly under subtitle */}
        <View style={styles.bottomSection}>
          {/* Continue Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>{data.buttonText}</Text>
          </TouchableOpacity>

          {/* Terms Text */}
          <Text style={styles.termsText}>{data.termsText}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  hiddenNavbar: {
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 + 40 + 16 : 16 + 40 + 16,
    opacity: 0,
  },
  imageContainer: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 32,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 28,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
