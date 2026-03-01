import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../../theme/colors';
import { WelcomeScreenData } from '../types';
import { QuestionnaireButton } from '../components';

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
        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={data.image}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Title */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{data.title}</Text>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>{data.subtitle}</Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Button - same as other questionnaire screens */}
        <QuestionnaireButton
          onPress={onContinue}
          text={data.buttonText}
        />
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
  spacer: {
    flex: 1,
  },
  imageContainer: {
    width: '95%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    borderRadius: 28,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    transform: [{ rotate: '45deg' }, { scale: 1.1 }],
  },
  textContainer: {
    paddingHorizontal: 50,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitleContainer: {
    paddingHorizontal: 50,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
