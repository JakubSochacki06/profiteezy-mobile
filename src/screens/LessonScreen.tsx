import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { IconButton } from '../components';
import { Task, LessonStage } from '../types/lesson';
import { supabase, markLessonComplete } from '../lib/supabase';

// Task Components
import { MultipleChoiceTask } from '../components/lesson/tasks/MultipleChoiceTask';
import { DragDropTask } from '../components/lesson/tasks/DragDropTask';
import { SortTask } from '../components/lesson/tasks/SortTask';
import { FillWordTask } from '../components/lesson/tasks/FillWordTask';
import { FreeTextTask } from '../components/lesson/tasks/FreeTextTask';
import { BranchingScenarioTask } from '../components/lesson/tasks/BranchingScenarioTask';

interface LessonScreenProps {
  lessonId?: string;
  courseId?: string;
  onClose: () => void;
  onComplete: () => void;
  title?: string;
}

const { width } = Dimensions.get('window');

export const LessonScreen: React.FC<LessonScreenProps> = ({
  lessonId,
  courseId,
  onClose,
  onComplete,
  title = "Lesson"
}) => {
  const insets = useSafeAreaInsets();

  // Data fetching state
  const [lessonStages, setLessonStages] = useState<LessonStage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1); // -1 means we are in lesson stages

  // Task state management - lifted up from task components
  const [canContinue, setCanContinue] = useState(true); // For lesson phases, always true
  const [buttonTitle, setButtonTitle] = useState('Continue');
  const [taskSubmitHandler, setTaskSubmitHandler] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (lessonId) {
      fetchLessonData();
    } else {
      setLoading(false);
      setError('No lesson ID provided');
    }
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== FETCHING LESSON DATA ===');
      console.log('Lesson ID:', lessonId);

      // Fetch lesson stages (content slides)
      const { data: stagesData, error: stagesError } = await supabase
        .from('lesson_stages')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_number', { ascending: true });

      if (stagesError) throw stagesError;

      console.log('=== LESSON STAGES ===');
      console.log(`Found ${stagesData?.length || 0} stages`);

      // Fetch interactive tasks (quizzes)
      const { data: tasksData, error: tasksError } = await supabase
        .from('interactive_tasks')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_number', { ascending: true });

      if (tasksError) throw tasksError;

      console.log('=== INTERACTIVE TASKS ===');
      console.log(`Found ${tasksData?.length || 0} tasks`);

      // Transform stages data
      const transformedStages: LessonStage[] = (stagesData || []).map((stage: any) => ({
        id: stage.id,
        title: stage.title || '',
        content: stage.content || '',
        image: undefined, // lesson_stages don't have images in this DB
      }));

      // Transform tasks data - map database format to component format
      const transformedTasks: Task[] = (tasksData || []).map((task: any) => {
        const taskType = task.type || 'multiple_choice';
        const data = task.data || {};
        console.log(`Task [${taskType}]:`, JSON.stringify(data));

        switch (taskType) {
          case 'multiple_choice':
            return {
              id: task.id,
              type: 'multiple_choice',
              question: task.prompt || '',
              options: data.choices || data.options || [],
              correctIndex: data.correct_answer ?? data.correctIndex ?? 0,
            } as Task;
          case 'drag_drop':
            return {
              id: task.id,
              type: 'drag_drop',
              question: task.prompt || '',
              items: data.items || [],
              correctOrder: data.correct_order || data.correctOrder || [],
            } as Task;
          case 'sort': {
            // DB format: categories is an object { "CategoryName": { items: [...] } }
            // Component expects: categories as [{ id, name }], items as [{ id, content, categoryId }]
            const dbCategories = data.categories || {};
            const sortCategories = Object.keys(dbCategories).map(name => ({
              id: name,
              name,
            }));
            // Build item-to-category mapping from the categories object
            const categoryItemMap: Record<string, string> = {};
            Object.entries(dbCategories).forEach(([catName, catData]: [string, any]) => {
              (catData?.items || []).forEach((item: string) => {
                categoryItemMap[item] = catName;
              });
            });
            const sortItems = (data.items || []).map((item: string, i: number) => ({
              id: `item-${i}`,
              content: item,
              categoryId: categoryItemMap[item] || '',
            }));
            return {
              id: task.id,
              type: 'sort',
              question: task.prompt || '',
              categories: sortCategories,
              items: sortItems,
            } as Task;
          }
          case 'fill_word': {
            // DB format: sentences is string[] with "___" as blanks, answers is string[]
            // Component expects: segments as (string | null)[] where null = blank
            const dbSentences: string[] = data.sentences || [];
            const fillSegments: (string | null)[] = [];
            if (dbSentences.length > 0) {
              dbSentences.forEach((sentence: string, i: number) => {
                if (i > 0) fillSegments.push('\n\n');
                const parts = sentence.split('___');
                parts.forEach((part: string, j: number) => {
                  if (part) fillSegments.push(part);
                  if (j < parts.length - 1) fillSegments.push(null);
                });
              });
            }
            return {
              id: task.id,
              type: 'fill_word',
              question: task.prompt || '',
              sentence: dbSentences.join(' ') || data.sentence || '',
              segments: fillSegments.length > 0 ? fillSegments : data.segments || [],
              words: data.words || [],
              correctWords: data.answers || data.correct_words || data.correctWords || [],
            } as Task;
          }
          case 'free_text':
            return {
              id: task.id,
              type: 'free_text',
              question: task.prompt || '',
              prompt: data.prompt || task.prompt || '',
              placeholder: data.placeholder,
              minChars: data.min_chars || data.minChars,
            } as Task;
          case 'branching_scenario':
            return {
              id: task.id,
              type: 'branching_scenario',
              question: task.prompt || '',
              startScenarioId: data.start_scenario_id || data.startScenarioId || '',
              scenarios: data.scenarios || {},
            } as Task;
          default:
            return {
              id: task.id,
              type: taskType,
              question: task.prompt || '',
              ...data,
            } as Task;
        }
      });

      console.log('=== TRANSFORMED DATA ===');
      console.log(`Stages: ${transformedStages.length}, Tasks: ${transformedTasks.length}`);

      setLessonStages(transformedStages);
      setTasks(transformedTasks);
    } catch (err: any) {
      console.error('=== ERROR FETCHING LESSON DATA ===');
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch lesson data');
    } finally {
      setLoading(false);
    }
  };

  // Derived state
  const isLessonPhase = currentTaskIndex === -1;
  const totalSteps = lessonStages.length || 1;
  const currentProgressStep = isLessonPhase ? currentStageIndex + 1 : totalSteps;
  const progress = (currentProgressStep / totalSteps) * 100;

  // Save lesson progress to database
  const saveLessonProgress = useCallback(async () => {
    if (!lessonId) return;
    
    console.log('=== SAVING LESSON PROGRESS ===');
    console.log('Lesson ID:', lessonId, 'Course ID:', courseId);
    
    const result = await markLessonComplete(lessonId, courseId, 0);
    
    if (result.success) {
      console.log('Lesson progress saved successfully');
    } else {
      console.error('Failed to save lesson progress:', result.error);
    }
  }, [lessonId, courseId]);

  // Handlers
  const handleLessonContinue = () => {
    if (currentStageIndex < lessonStages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
    } else if (tasks.length > 0) {
      // Move to tasks
      setCurrentTaskIndex(0);
    } else {
      // No tasks, complete the lesson and save progress
      saveLessonProgress().then(() => onComplete());
    }
  };

  const handleTaskComplete = useCallback(async (isCorrect: boolean) => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      // All tasks done, save progress and complete
      await saveLessonProgress();
      onComplete();
    }
  }, [currentTaskIndex, tasks.length, onComplete, saveLessonProgress]);

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

  // parser for custom content
  const parseLessonContent = useCallback((content: string) => {
    if (!content) return [];

    // 1. First split by the complex custom boxes
    const boxRegex = /(::(?:real_world_example|tips|common_mistake)(?:[\s\S]*?)::\/(?:real_world_example|tips|common_mistake))/g;
    const parts = content.split(boxRegex);

    const finalBlocks: Array<{ type: string, content: string }> = [];

    parts.forEach(part => {
      // Check for custom boxes first
      if (part.startsWith('::real_world_example')) {
        const inner = part.replace(/::real_world_example\s*/, '').replace(/\s*::\/real_world_example/, '');
        finalBlocks.push({ type: 'real_world_example', content: inner.trim() });
      } else if (part.startsWith('::tips')) {
        const inner = part.replace(/::tips\s*/, '').replace(/\s*::\/tips/, '');
        finalBlocks.push({ type: 'tips', content: inner.trim() });
      } else if (part.startsWith('::common_mistake')) {
        const inner = part.replace(/::common_mistake\s*/, '').replace(/\s*::\/common_mistake/, '');
        finalBlocks.push({ type: 'common_mistake', content: inner.trim() });
      } else {
        // 2. For regular text, check for headers line-by-line
        const lines = part.split('\n');
        let currentTextBuffer = '';

        lines.forEach(line => {
          const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
          const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (headerMatch) {
            // If we have buffered text, push it first
            if (currentTextBuffer.trim()) {
              finalBlocks.push({ type: 'text', content: currentTextBuffer.trim() });
              currentTextBuffer = '';
            }
            // Push the header
            finalBlocks.push({ type: 'header', content: headerMatch[2].trim() });
          } else if (imageMatch) {
            if (currentTextBuffer.trim()) {
              finalBlocks.push({ type: 'text', content: currentTextBuffer.trim() });
              currentTextBuffer = '';
            }
            finalBlocks.push({ type: 'image', content: imageMatch[2].trim() });
          } else {
            // Preserve newlines for text flow, but might want to handle lists better later
            currentTextBuffer += line + '\n';
          }
        });

        if (currentTextBuffer.trim()) {
          finalBlocks.push({ type: 'text', content: currentTextBuffer.trim() });
        }
      }
    });

    return finalBlocks.filter(b => b.content);
  }, []);

  const renderFormattedText = (text: string, baseStyle: any) => {
    // Handle bold text **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return (
      <Text style={baseStyle}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={index} style={{ fontWeight: 'bold', color: colors.text.primary }}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  // Render Lesson Content
  const renderLessonContent = () => {
    if (lessonStages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No content yet</Text>
          <Text style={styles.emptySubtitle}>This lesson doesn't have any content</Text>
        </View>
      );
    }

    const stage = lessonStages[currentStageIndex];
    const contentBlocks = parseLessonContent(stage.content);

    return (
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{stage.title}</Text>

        {contentBlocks.map((block, index) => {
          if (block.type === 'header') {
            return (
              <Text key={index} style={styles.subHeader}>
                {block.content}
              </Text>
            );
          }

          if (block.type === 'image') {
            return (
              <View key={index} style={styles.contentImageContainer}>
                <Image
                  source={{ uri: block.content }}
                  style={styles.contentImage}
                  resizeMode="contain"
                />
              </View>
            );
          }

          if (block.type === 'text') {
            return (
              <View key={index} style={{ marginBottom: 20 }}>
                {renderFormattedText(block.content, styles.text)}
              </View>
            );
          } // Parse specific boxes

          let boxConfig: {
            icon: string;
            title: string;
            color: string;
            bg: string;
            borderColor: string;
          } = {
            icon: 'information-circle-outline',
            title: 'Info',
            color: colors.info,
            bg: 'rgba(59, 130, 246, 0.1)', // info with opacity
            borderColor: colors.info
          };

          if (block.type === 'real_world_example') {
            boxConfig = {
              icon: 'briefcase-outline',
              title: 'Real World Example',
              color: colors.info,
              bg: 'rgba(59, 130, 246, 0.1)',
              borderColor: colors.info
            };
          } else if (block.type === 'tips') {
            boxConfig = {
              icon: 'bulb-outline',
              title: 'Pro Tip',
              color: colors.success,
              bg: 'rgba(95, 203, 15, 0.1)',
              borderColor: colors.success
            };
          } else if (block.type === 'common_mistake') {
            boxConfig = {
              icon: 'warning-outline',
              title: 'Common Mistake',
              color: colors.error,
              bg: 'rgba(239, 68, 68, 0.1)',
              borderColor: colors.error
            };
          }

          return (
            <View key={index} style={[
              styles.boxContainer,
              { backgroundColor: boxConfig.bg, borderColor: boxConfig.borderColor }
            ]}>
              <View style={styles.boxHeader}>
                <Ionicons name={boxConfig.icon as any} size={20} color={boxConfig.color} />
                <Text style={[styles.boxTitle, { color: boxConfig.color }]}>
                  {boxConfig.title}
                </Text>
              </View>
              {renderFormattedText(block.content, styles.boxText)}
            </View>
          );
        })}

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
    if (tasks.length === 0 || currentTaskIndex >= tasks.length) {
      return null;
    }

    const task = tasks[currentTaskIndex];
    if (!task) return null;

    const key = task.id;

    let taskComponent: React.ReactNode;
    switch (task.type) {
      case 'multiple_choice':
        taskComponent = <MultipleChoiceTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
        break;
      case 'drag_drop':
        taskComponent = <DragDropTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
        break;
      case 'sort':
        taskComponent = <SortTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
        break;
      case 'fill_word':
        taskComponent = <FillWordTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
        break;
      case 'free_text':
        taskComponent = <FreeTextTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
        break;
      case 'branching_scenario':
        taskComponent = <BranchingScenarioTask key={key} task={task} onComplete={handleTaskComplete} registerControls={registerTaskControls} />;
        break;
      default:
        taskComponent = <Text style={{ color: 'white' }}>Unknown Task Type: {(task as any).type}</Text>;
    }

    return (
      <View style={{ flex: 1 }}>
        {taskComponent}
        <TouchableOpacity
          style={styles.devSkipButton}
          onPress={() => handleTaskComplete(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-forward-outline" size={16} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <IconButton
            icon={<Ionicons name="close" size={24} color={colors.text.primary} />}
            onPress={onClose}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <IconButton
            icon={<Ionicons name="close" size={24} color={colors.text.primary} />}
            onPress={onClose}
          />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
        </View>
      </View>
    );
  }

  // Determine button title for lesson phase
  const currentButtonTitle = isLessonPhase ? 'Continue' : buttonTitle;
  const isButtonDisabled = isLessonPhase ? (lessonStages.length === 0) : !canContinue;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="close" size={24} color={colors.text.primary} />}
          onPress={onClose}
        />

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.rewardsContainer}>
          {[...Array(Math.min(tasks.length, 3) || 3)].map((_, index) => {
            const isCompleted = !isLessonPhase && currentTaskIndex > index;
            return (
              <Text
                key={index}
                style={[
                  styles.rewardText,
                  { color: isCompleted ? colors.accent : colors.text.tertiary }
                ]}
              >
                $
              </Text>
            );
          })}
        </View>
      </View>

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
    lineHeight: 26,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    gap: 4,
  },
  rewardText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: 'Inter_500Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 12,
    marginBottom: 12,
    fontFamily: 'Inter_700Bold',
  },
  boxContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  boxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boxText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  contentImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contentImage: {
    width: width - 48,
    height: (width - 48) * 0.6,
    borderRadius: 12,
  },
  devSkipButton: {
    position: 'absolute',
    bottom: 8,
    right: 24,
    opacity: 0.4,
  },
});
