import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { Task, LessonStage } from '../types/lesson';

// Task Components
import { MultipleChoiceTask } from '../components/lesson/tasks/MultipleChoiceTask';
import { DragDropTask } from '../components/lesson/tasks/DragDropTask';
import { SortTask } from '../components/lesson/tasks/SortTask';
import { FillWordTask } from '../components/lesson/tasks/FillWordTask';
import { FreeTextTask } from '../components/lesson/tasks/FreeTextTask';
import { BranchingScenarioTask } from '../components/lesson/tasks/BranchingScenarioTask';

interface LessonScreenProps {
  onClose: () => void;
  onComplete: () => void;
  title?: string;
}

const { width } = Dimensions.get('window');

// --- Dummy Data ---

const LESSON_STAGES: LessonStage[] = [
  {
    id: '1',
    title: 'What is ChatGPT?',
    content: "Hey there! Today, we're diving into the world of ChatGPT, an advanced large language model (LLM). It's like a super-smart chatbot that can understand and generate human-like text.",
    image: require('../../assets/questionnaire/questionnaireImage1.png'),
  },
  {
    id: '2',
    title: 'How does it work?',
    content: "ChatGPT has been trained on a massive amount of text from the internet. It predicts the next word in a sentence, much like autocomplete on your phone, but way more advanced.",
    image: require('../../assets/emojis/laptopEmoji.png'),
  },
  {
    id: '3',
    title: 'Prompt Engineering',
    content: "The quality of the answer depends on the quality of your question. This is called 'Prompt Engineering'. Being specific helps you get better results.",
  },
  {
    id: '4',
    title: 'Safety & Limitations',
    content: "While powerful, ChatGPT can sometimes make mistakes (hallucinations). It's important to verify information, especially for critical tasks.",
    image: require('../../assets/emojis/confusedEmoji.png'),
  },
];

const TASKS: Task[] = [
  {
    id: 't1',
    type: 'multiple_choice',
    question: "What does LLM stand for?",
    options: ["Large Learning Model", "Large Language Model", "Long Language Machine", "Little Learning Machine"],
    correctIndex: 1,
  },
  {
    id: 't2',
    type: 'drag_drop',
    question: "Order the steps of using an LLM:",
    items: ["Model Processes", "Receive Answer", "Write Prompt", "Send Request"],
    correctOrder: ["Write Prompt", "Send Request", "Model Processes", "Receive Answer"],
  },
  {
    id: 't3',
    type: 'sort',
    question: "Categorize the capabilities:",
    categories: [
      { id: 'c1', name: 'Can Do' },
      { id: 'c2', name: 'Cannot Do' }
    ],
    items: [
      { id: 'i1', content: "Write a poem", categoryId: 'c1' },
      { id: 'i2', content: "Predict the future", categoryId: 'c2' },
      { id: 'i3', content: "Summarize text", categoryId: 'c1' },
      { id: 'i4', content: "Access real-time private thoughts", categoryId: 'c2' }
    ]
  },
  {
    id: 't4',
    type: 'fill_word',
    question: "Complete the sentence:",
    sentence: "Prompt engineering is the art of asking ___ questions to get ___ results.",
    segments: ["Prompt engineering is the art of asking ", null, " questions to get ", null, " results."],
    words: ["better", "worse", "random", "specific", "vague"],
    correctWords: ["specific", "better"]
  },
  {
    id: 't5',
    type: 'free_text',
    question: "Write a prompt:",
    prompt: "Write a short prompt asking for a healthy dinner recipe.",
    minChars: 20
  },
  {
    id: 't6',
    type: 'branching_scenario',
    question: "Scenario: Learning Python",
    startScenarioId: 'start',
    scenarios: {
      'start': {
        text: "You want to learn Python. How do you ask ChatGPT?",
        choices: [
          { text: "Teach me Python.", nextId: 's1_broad' },
          { text: "Create a 4-week study plan for a Python beginner.", nextId: 'win' }
        ]
      },
      's1_broad': {
        text: "ChatGPT gives you a generic definition of Python. It's too broad. Try again.",
        choices: [
          { text: "Try again with more specific details.", nextId: 'start' }
        ]
      }
    }
  }
];

export const LessonScreen: React.FC<LessonScreenProps> = ({ 
  onClose, 
  onComplete,
  title = "What is ChatGPT?" 
}) => {
  const insets = useSafeAreaInsets();
  
  // State
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1); // -1 means we are in lesson stages
  
  // Task state management - lifted up from task components
  const [canContinue, setCanContinue] = useState(true); // For lesson phases, always true
  const [buttonTitle, setButtonTitle] = useState('Continue');
  const [taskSubmitHandler, setTaskSubmitHandler] = useState<(() => void) | null>(null);

  // Derived state
  const isLessonPhase = currentTaskIndex === -1;
  const totalSteps = LESSON_STAGES.length + TASKS.length;
  const currentStep = isLessonPhase ? currentStageIndex + 1 : LESSON_STAGES.length + currentTaskIndex + 1;
  const progress = (currentStep / totalSteps) * 100;

  // Handlers
  const handleLessonContinue = () => {
    if (currentStageIndex < LESSON_STAGES.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
    } else {
      // Move to tasks
      setCurrentTaskIndex(0);
    }
  };

  const handleTaskComplete = useCallback((isCorrect: boolean) => {
    // Logic for incorrect answers can be added here (e.g. tracking score)
    // For now, we just move to next
    if (currentTaskIndex < TASKS.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      // All done
      onComplete();
    }
  }, [currentTaskIndex, onComplete]);

  // Called by task components to register their submit handler
  const registerTaskControls = useCallback((
    canSubmit: boolean, 
    title: string, 
    onSubmit: () => void
  ) => {
    setCanContinue(canSubmit);
    setButtonTitle(title);
    setTaskSubmitHandler(() => onSubmit);
  }, []);

  const handleButtonPress = () => {
    if (isLessonPhase) {
      handleLessonContinue();
    } else if (taskSubmitHandler) {
      taskSubmitHandler();
    }
  };
  
  // Render Lesson Content
  const renderLessonContent = () => {
    const stage = LESSON_STAGES[currentStageIndex];
    return (
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{stage.title}</Text>
        <Text style={styles.text}>{stage.content}</Text>
        
        {stage.image && (
          <View style={styles.imageContainer}>
            <Image 
              source={stage.image} 
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
        )}
      </ScrollView>
    );
  };

  // Render Task Content
  const renderTaskContent = () => {
    const task = TASKS[currentTaskIndex];
    
    // We wrap tasks in a key to reset state when task changes
    const key = task.id;

    switch (task.type) {
      case 'multiple_choice':
        return <MultipleChoiceTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
      case 'drag_drop':
        return <DragDropTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
      case 'sort':
        return <SortTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
      case 'fill_word':
        return <FillWordTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
      case 'free_text':
        return <FreeTextTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
      case 'branching_scenario':
        return <BranchingScenarioTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
      default:
        return <Text style={{color: 'white'}}>Unknown Task Type</Text>;
    }
  };

  // Determine button title for lesson phase
  const currentButtonTitle = isLessonPhase ? 'Continue' : buttonTitle;
  const isButtonDisabled = isLessonPhase ? false : !canContinue;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Main Content */}
      <View style={styles.contentArea}>
        {isLessonPhase ? renderLessonContent() : renderTaskContent()}
      </View>

      {/* Footer - Always at bottom */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Button 
          title={currentButtonTitle}
          onPress={handleButtonPress}
          fullWidth
          disabled={isButtonDisabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 24,
    fontFamily: 'Inter_700Bold',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  illustration: {
    width: width * 0.8,
    height: width * 0.8,
    maxHeight: 300,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
