import React, { useState } from 'react';
import { QuestionnaireData, QuestionnaireResult } from './types';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { QuestionScreen } from './screens/QuestionScreen';
import { ImageScreen } from './screens/ImageScreen';
import { InputScreen } from './screens/InputScreen';
import { ReadinessScoreScreen } from './screens/ReadinessScoreScreen';
import { PersonalPlanScreen } from './screens/PersonalPlanScreen';

interface QuestionnaireNavigatorProps {
  data: QuestionnaireData;
  onComplete: (results: QuestionnaireResult) => void;
  onSkip?: () => void;
  startIndex?: number;
}

export const QuestionnaireNavigator: React.FC<QuestionnaireNavigatorProps> = ({
  data,
  onComplete,
  onSkip,
  startIndex,
}) => {
  // -1 = welcome screen, 0+ = question index
  const [currentIndex, setCurrentIndex] = useState(startIndex ?? -1);
  const [answers, setAnswers] = useState<QuestionnaireResult>({});

  const totalSteps = data.questions.length;

  const handleWelcomeContinue = () => {
    setCurrentIndex(0);
  };

  const handleQuestionBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(-1);
    }
  };

  const handleQuestionContinue = (selectedAnswers: string | string[]) => {
    const currentStep = data.questions[currentIndex];
    
    // Save the answer (only for questions and inputs, not image screens)
    let newAnswers = answers;
    if (currentStep.type !== 'image' && 'id' in currentStep) {
      newAnswers = {
        ...answers,
        [currentStep.id]: selectedAnswers,
      };
      setAnswers(newAnswers);
    }

    // Move to next question or complete
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions answered
      onComplete(newAnswers);
    }
  };

  const handleInputContinue = (inputValue: string) => {
    const currentStep = data.questions[currentIndex];
    
    // Save the input value (only for input screens with id)
    let newAnswers = answers;
    if ('id' in currentStep) {
      newAnswers = {
        ...answers,
        [currentStep.id]: inputValue,
      };
      setAnswers(newAnswers);
    }

    // Move to next question or complete
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions answered
      onComplete(newAnswers);
    }
  };

  const handleImageContinue = () => {
    // Move to next question or complete
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions answered
      onComplete(answers);
    }
  };

  // Render welcome screen
  if (currentIndex === -1) {
    return (
      <WelcomeScreen
        data={data.welcome}
        onContinue={handleWelcomeContinue}
      />
    );
  }

  // Render current step (question, image screen, or input screen)
  const currentStep = data.questions[currentIndex];
  
  // Check if it's an image screen
  if (currentStep.type === 'image') {
    return (
      <ImageScreen
        key={currentIndex}
        data={currentStep}
        onBack={handleQuestionBack}
        currentStep={currentIndex + 1}
        totalSteps={totalSteps}
        onContinue={handleImageContinue}
      />
    );
  }

  // Check if it's an input screen
  if (currentStep.type === 'input') {
    return (
      <InputScreen
        key={currentIndex}
        data={currentStep}
        onBack={handleQuestionBack}
        currentStep={currentIndex + 1}
        totalSteps={totalSteps}
        onContinue={handleInputContinue}
      />
    );
  }

  // Check if it's a result screen
  if (currentStep.type === 'result') {
    return (
      <ReadinessScoreScreen
        key={currentIndex}
        data={currentStep}
        onBack={handleQuestionBack}
        currentStep={currentIndex + 1}
        totalSteps={totalSteps}
        onContinue={handleImageContinue}
      />
    );
  }

  // Check if it's a personal plan screen
  if (currentStep.type === 'personal_plan') {
    return (
      <PersonalPlanScreen
        key={currentIndex}
        data={currentStep}
        onBack={handleQuestionBack}
        currentStep={currentIndex + 1}
        totalSteps={totalSteps}
        onContinue={handleImageContinue}
      />
    );
  }

  // Otherwise render question screen
  return (
    <QuestionScreen
      key={currentStep.id}
      question={currentStep}
      currentStep={currentIndex + 1}
      totalSteps={totalSteps}
      onBack={handleQuestionBack}
      onContinue={handleQuestionContinue}
      initialSelection={answers[currentStep.id]}
    />
  );
};
