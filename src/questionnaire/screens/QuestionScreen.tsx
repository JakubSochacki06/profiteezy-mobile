import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { Question } from '../types';
import { AnswerOption, QuestionnaireScreenWrapper } from '../components';

interface QuestionScreenProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: (selectedAnswers: string | string[]) => void;
  initialSelection?: string | string[];
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  currentStep,
  totalSteps,
  onBack,
  onContinue,
  initialSelection,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(
    new Set(
      initialSelection
        ? Array.isArray(initialSelection)
          ? initialSelection
          : [initialSelection]
        : []
    )
  );

  const handleAnswerPress = (answerId: string) => {
    if (question.multiSelect) {
      const newSelected = new Set(selectedAnswers);
      if (newSelected.has(answerId)) {
        newSelected.delete(answerId);
      } else {
        newSelected.add(answerId);
      }
      setSelectedAnswers(newSelected);
    } else {
      setSelectedAnswers(new Set([answerId]));
    }
  };

  const handleContinue = () => {
    if (selectedAnswers.size === 0) return;
    const result = question.multiSelect
      ? Array.from(selectedAnswers)
      : Array.from(selectedAnswers)[0];
    onContinue(result);
  };

  const canContinue = selectedAnswers.size > 0;

  return (
    <QuestionnaireScreenWrapper
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          {question.subtitle && (
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          )}
        </View>

        <View style={styles.answersContainer}>
          {question.answers.map((answer) => (
            <AnswerOption
              key={answer.id}
              text={answer.text}
              icon={answer.icon}
              selected={selectedAnswers.has(answer.id)}
              onPress={() => handleAnswerPress(answer.id)}
            />
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
  },
  questionHeader: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    marginBottom: 8,
    lineHeight: 32,
  },
  questionSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    lineHeight: 22,
  },
  answersContainer: {
    marginBottom: 20,
  },
});
