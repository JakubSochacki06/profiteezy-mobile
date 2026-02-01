import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { QuestionnaireNavbar } from './QuestionnaireNavbar';
import { QuestionnaireButton } from './QuestionnaireButton';

interface QuestionnaireScreenWrapperProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueText?: string;
  hideNavbar?: boolean;
  hideButton?: boolean;
}

export const QuestionnaireScreenWrapper: React.FC<QuestionnaireScreenWrapperProps> = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  onContinue,
  continueDisabled = false,
  continueText = 'Continue',
  hideNavbar = false,
  hideButton = false,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        {/* Navbar - always same position */}
        {!hideNavbar && (
          <QuestionnaireNavbar
            onBack={onBack}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        )}

        {/* Content area - fills the middle */}
        <View style={styles.content}>
          {children}
        </View>

        {/* Button - always same position at bottom */}
        {!hideButton && (
          <QuestionnaireButton
            onPress={onContinue}
            disabled={continueDisabled}
            text={continueText}
          />
        )}
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
  content: {
    flex: 1,
  },
});
