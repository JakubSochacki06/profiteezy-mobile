import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { IconButton } from '../components';
import { 
  LessonStage, 
  getStageType,
  MultipleChoiceTaskData,
  DragDropTaskData,
  SortTaskData,
  FillWordTaskData,
} from '../types/lesson';
import { supabase, markLessonComplete } from '../lib/supabase';
import { MarkdownDisplay } from '../components/MarkdownDisplay';

// Inline task components
import { InlineMultipleChoice } from '../components/lesson/tasks/InlineMultipleChoice';
import { InlineDragDrop } from '../components/lesson/tasks/InlineDragDrop';
import { InlineSort } from '../components/lesson/tasks/InlineSort';
import { InlineFillWord } from '../components/lesson/tasks/InlineFillWord';
import { FeedbackModal } from '../components/lesson/FeedbackModal'; // Import modal

interface LessonScreenProps {
  lessonId?: string;
  courseId?: string;
  onClose: () => void;
  onComplete: () => void;
  title?: string;
}

const MAX_ATTEMPTS = 2;

export const LessonScreen: React.FC<LessonScreenProps> = ({
  lessonId,
  courseId,
  onClose,
  onComplete,
  title = "Lesson"
}) => {
  const insets = useSafeAreaInsets();

  // Data fetching state
  const [stages, setStages] = useState<LessonStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation state
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  
  // Task state for current stage
  const [attemptCount, setAttemptCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isTaskReady, setIsTaskReady] = useState(false);
  
  // Ref to store the check answer function from task component
  const checkAnswerRef = useRef<(() => boolean) | null>(null);

  // Current stage
  const currentStage = stages[currentStageIndex];
  const stageType = currentStage ? getStageType(currentStage) : 'text_only';
  const totalStages = stages.length;
  const progress = totalStages > 0 ? ((currentStageIndex + 1) / totalStages) * 100 : 0;

  useEffect(() => {
    if (lessonId) {
      fetchLessonData();
    } else {
      setLoading(false);
      setError('No lesson ID provided');
    }
  }, [lessonId]);

  // Reset task state when stage changes
  useEffect(() => {
    setAttemptCount(0);
    setShowResult(false);
    setIsCorrect(false);
    setIsTaskReady(false);
    checkAnswerRef.current = null;
  }, [currentStageIndex]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: stagesData, error: stagesError } = await supabase
        .from('lesson_stages')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_number', { ascending: true });

      if (stagesError) throw stagesError;

      const transformedStages: LessonStage[] = (stagesData || []).map((stage: any) => ({
        id: stage.id,
        lesson_id: stage.lesson_id,
        order_number: stage.order_number,
        title: stage.title,
        content: stage.content || '',
        points: stage.points,
        duration: stage.duration,
        task_type: stage.task_type,
        task_data: stage.task_data,
      }));

      setStages(transformedStages);
    } catch (err: any) {
      console.error('Error fetching lesson data:', err);
      setError(err.message || 'Failed to fetch lesson data');
    } finally {
      setLoading(false);
    }
  };

  // Save lesson progress to database
  const saveLessonProgress = useCallback(async () => {
    if (!lessonId) return;
    
    const result = await markLessonComplete(lessonId, courseId, 0);
    
    if (!result.success) {
      console.error('Failed to save lesson progress:', result.error);
    }
  }, [lessonId, courseId]);

  // Handle ready state change from task
  const handleReadyChange = useCallback((ready: boolean) => {
    setIsTaskReady(ready);
  }, []);

  // Register check answer function from task
  const registerCheckAnswer = useCallback((checkFn: () => boolean) => {
    checkAnswerRef.current = checkFn;
  }, []);

  // Handle check answer button press
  const handleCheckAnswer = useCallback(() => {
    if (checkAnswerRef.current) {
      const correct = checkAnswerRef.current();
      setIsCorrect(correct);
      setShowResult(true);
      
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
    }
  }, [attemptCount]);

  // Handle retry (for wrong answers when attempts remain)
  const handleRetry = useCallback(() => {
    setShowResult(false);
    setIsCorrect(false);
    setIsTaskReady(false); // Reset ready state usually? Or keep selection? Let's keep selection but hide modal
  }, []);

  // Handle continue to next stage
  const handleContinue = useCallback(async () => {
    setShowResult(false); // Hide modal immediately
    
    if (currentStageIndex < stages.length - 1) {
      // Small delay to allow modal to close smoothly? Or just switch content?
      // Just switch content for now, React updates are fast enough
      setCurrentStageIndex(currentStageIndex + 1);
    } else {
      // Lesson complete
      await saveLessonProgress();
      onComplete();
    }
  }, [currentStageIndex, stages.length, saveLessonProgress, onComplete]);

  // Render task component based on type
  const renderTask = () => {
    if (!currentStage || !currentStage.task_type || !currentStage.task_data) {
      return null;
    }

    const commonProps = {
      onReadyChange: handleReadyChange,
      registerCheckAnswer: registerCheckAnswer,
      showResult, // Pass showResult to disable inputs
      attemptCount,
    };

    switch (currentStage.task_type) {
      case 'multiple_choice':
        return (
          <InlineMultipleChoice
            taskData={currentStage.task_data as MultipleChoiceTaskData}
            {...commonProps}
          />
        );
      case 'drag_drop':
        return (
          <InlineDragDrop
            taskData={currentStage.task_data as DragDropTaskData}
            {...commonProps}
          />
        );
      case 'sort':
        return (
          <InlineSort
            taskData={currentStage.task_data as SortTaskData}
            {...commonProps}
          />
        );
      case 'fill_word':
        return (
          <InlineFillWord
            taskData={currentStage.task_data as FillWordTaskData}
            {...commonProps}
          />
        );
      default:
        return (
          <Text style={styles.errorText}>Unknown task type: {currentStage.task_type}</Text>
        );
    }
  };

  // Render stage content
  const renderStageContent = () => {
    if (!currentStage) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No content yet</Text>
          <Text style={styles.emptySubtitle}>This lesson doesn't have any content</Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          // Add extra padding at bottom if modal is visible so content isn't covered?
          // Actually modal is absolute, so content behind is fine. But we might want to scroll up.
          { paddingBottom: showResult ? 200 : 100 } 
        ]}
        showsVerticalScrollIndicator={false}
      >
        {currentStage.title && (
          <Text style={styles.title}>{currentStage.title}</Text>
        )}
        
        <MarkdownDisplay content={currentStage.content} />

        {/* Render inline task if this is a text+task stage */}
        {stageType === 'text_with_task' && (
          <View style={styles.taskContainer}>
            {renderTask()}
          </View>
        )}
      </ScrollView>
    );
  };

  // Determine footer button config
  const getFooterConfig = () => {
    // If modal is showing, hide the main footer button (or disable it, but hiding is cleaner since modal has buttons)
    if (showResult && stageType === 'text_with_task') {
      return null; 
    }

    const isLastStage = currentStageIndex === stages.length - 1;
    
    if (stageType === 'text_only') {
      return {
        title: isLastStage ? 'Complete' : 'Continue',
        disabled: false,
        onPress: handleContinue,
      };
    }

    // Text + task stage, not showing result yet
    return {
      title: 'Check Answer',
      disabled: !isTaskReady,
      onPress: handleCheckAnswer,
    };
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

  const footerConfig = getFooterConfig();
  const canRetry = attemptCount < MAX_ATTEMPTS;

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

        <View style={styles.stageIndicator}>
          <Text style={styles.stageText}>
            {currentStageIndex + 1}/{totalStages}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentArea}>
        {renderStageContent()}
      </View>

      {/* Footer - Only show if modal is NOT visible (for tasks) or always for text-only */}
      {footerConfig && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Button
            title={footerConfig.title}
            onPress={footerConfig.onPress}
            fullWidth
            disabled={footerConfig.disabled}
          />
        </View>
      )}

      {/* Feedback Modal */}
      {stageType === 'text_with_task' && (
        <FeedbackModal 
          isVisible={showResult}
          isCorrect={isCorrect}
          onNext={handleContinue}
          onRetry={handleRetry}
          canRetry={canRetry}
          points={currentStage.points || 10}
        />
      )}
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
    // paddingBottom is dynamic now
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  taskContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: colors.background,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  stageIndicator: {
    minWidth: 48,
    alignItems: 'center',
  },
  stageText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: 'Inter_500Medium',
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
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
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
});
