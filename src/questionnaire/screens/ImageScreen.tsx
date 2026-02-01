import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { ImageScreenData } from '../types';
import { QuestionnaireScreenWrapper } from '../components';

interface ImageScreenProps {
  data: ImageScreenData;
  onContinue: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export const ImageScreen: React.FC<ImageScreenProps> = ({
  data,
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  return (
    <QuestionnaireScreenWrapper
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onContinue}
    >
      {/* Title at top */}
      {data.title && (!data.titlePosition || data.titlePosition === 'top') && (
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
        </View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={data.image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Title at bottom */}
      {data.title && data.titlePosition === 'bottom' && (
        <View style={styles.headerBottom}>
          <Text style={styles.title}>{data.title}</Text>
        </View>
      )}

      {/* Description under image */}
      {data.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{data.description}</Text>
        </View>
      )}

      {/* Custom children */}
      {data.children && (
        <View style={styles.childrenContainer}>{data.children}</View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />
    </QuestionnaireScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerBottom: {
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
  spacer: {
    flex: 1,
  },
  imageContainer: {
    paddingHorizontal: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  descriptionContainer: {
    paddingHorizontal: 50,
    paddingTop: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  childrenContainer: {
    paddingHorizontal: 40,
    paddingTop: 12,
  },
});
