import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase, getCompletedLessons } from '../lib/supabase';

const { width } = Dimensions.get('window');
const NODE_SIZE = 90;
const PADDING = 40;
const NODE_MARGIN_BOTTOM = 0;
const CONTAINER_WIDTH = width - (PADDING * 2);
const CORNER_RADIUS = 20;
const LINE_WIDTH = 5;

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  number: number;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Stage {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface CoursePathScreenProps {
  course: any;
  onBack: () => void;
  onStartLesson?: (lessonId: string) => void;
}

export const CoursePathScreen: React.FC<CoursePathScreenProps> = ({ course, onBack, onStartLesson }) => {
  const insets = useSafeAreaInsets();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  
  // Data fetching state
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, [course.id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== FETCHING COURSE DATA ===');
      console.log('Course ID:', course.id);

      // Fetch stages for this course
      const { data: stagesData, error: stagesError } = await supabase
        .from('stages')
        .select('*')
        .eq('course_id', course.id)
        .order('order', { ascending: true });

      if (stagesError) throw stagesError;

      console.log('=== STAGES ===');
      console.log(JSON.stringify(stagesData, null, 2));

      // Fetch lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course.id)
        .order('number', { ascending: true });

      if (lessonsError) throw lessonsError;

      console.log('=== LESSONS ===');
      console.log(JSON.stringify(lessonsData, null, 2));

      // Fetch user's completed lessons for this course
      const completedLessonIds = await getCompletedLessons(course.id);
      const completedSet = new Set(completedLessonIds);
      
      console.log('=== COMPLETED LESSONS ===');
      console.log('Completed:', completedLessonIds);

      // Build a flat list of all lessons in order to determine unlock status
      const allLessonsOrdered: { id: string; stageIndex: number; lessonIndex: number }[] = [];
      (stagesData || []).forEach((stage: any, stageIndex: number) => {
        const stageLessons = (lessonsData || [])
          .filter((lesson: any) => lesson.stage_id === stage.id)
          .sort((a: any, b: any) => a.number - b.number);
        stageLessons.forEach((lesson: any, lessonIndex: number) => {
          allLessonsOrdered.push({ id: lesson.id, stageIndex, lessonIndex });
        });
      });

      // Determine which lessons are unlocked:
      // A lesson is unlocked if:
      // 1. It's the first lesson (index 0 in allLessonsOrdered), OR
      // 2. The previous lesson is completed
      const unlockedSet = new Set<string>();
      for (let i = 0; i < allLessonsOrdered.length; i++) {
        const lesson = allLessonsOrdered[i];
        if (i === 0) {
          // First lesson is always unlocked
          unlockedSet.add(lesson.id);
        } else {
          // Unlock if previous lesson is completed
          const prevLesson = allLessonsOrdered[i - 1];
          if (completedSet.has(prevLesson.id)) {
            unlockedSet.add(lesson.id);
          }
        }
      }

      // Group lessons by stage with progress
      const stagesWithLessons: Stage[] = (stagesData || []).map((stage: any) => {
        const stageLessons = (lessonsData || [])
          .filter((lesson: any) => lesson.stage_id === stage.id)
          .map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            duration: lesson.duration,
            number: lesson.number,
            isCompleted: completedSet.has(lesson.id),
            isLocked: !unlockedSet.has(lesson.id),
          }));

        return {
          id: stage.id,
          title: stage.title,
          description: stage.description,
          order: stage.order,
          lessons: stageLessons,
        };
      });

      console.log('=== STAGES WITH LESSONS ===');
      stagesWithLessons.forEach(s => {
        console.log(`Stage: ${s.title} (${s.lessons.length} lessons)`);
        s.lessons.forEach(l => console.log(`  - ${l.title} [${l.isCompleted ? 'DONE' : l.isLocked ? 'LOCKED' : 'UNLOCKED'}]`));
      });

      setStages(stagesWithLessons);
    } catch (err: any) {
      console.error('=== ERROR FETCHING COURSE DATA ===');
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonPress = (lesson: Lesson) => {
    setSelectedLessonId(selectedLessonId === lesson.id ? null : lesson.id);
  };

  // Calculate completion rate
  const totalLessons = stages.reduce((acc, stage) => acc + stage.lessons.length, 0);
  const completedLessons = stages.reduce(
    (acc, stage) => acc + stage.lessons.filter((l) => l.isCompleted).length,
    0
  );
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const renderPath = (lessons: Lesson[]) => {
    return (
      <View style={styles.pathContainer}>
        {lessons.map((lesson, index) => {
          const isLeft = index % 2 === 0;
          const isLast = index === lessons.length - 1;
          
          return (
            <View 
              key={lesson.id} 
              style={[
                styles.lessonRow,
                { 
                  alignItems: isLeft ? 'flex-start' : 'flex-end',
                  zIndex: selectedLessonId === lesson.id ? 100 : 1
                }
              ]}
            >
              {/* Connector Lines with curved corners */}
              {!isLast && (
                <>
                  <View style={[
                    styles.connectorHorizontal,
                    isLeft ? { 
                      left: NODE_SIZE / 2 + 60,
                    } : { 
                      right: NODE_SIZE / 2 + 60,
                    },
                  ]} />
                  
                  <View style={[
                    styles.connectorCorner,
                    isLeft ? { 
                      right: 60 - LINE_WIDTH,
                      borderRightWidth: LINE_WIDTH,
                      borderTopWidth: LINE_WIDTH,
                      borderTopRightRadius: CORNER_RADIUS,
                    } : { 
                      left: 60 - LINE_WIDTH,
                      borderLeftWidth: LINE_WIDTH,
                      borderTopWidth: LINE_WIDTH,
                      borderTopLeftRadius: CORNER_RADIUS,
                    },
                  ]} />
                  
                  <View style={[
                    styles.connectorVertical,
                    isLeft ? { 
                      right: 60 - LINE_WIDTH,
                    } : { 
                      left: 60 - LINE_WIDTH,
                    },
                  ]} />
                </>
              )}

              {/* Node Wrapper */}
              <View style={styles.nodeWrapper}>
                <TouchableOpacity
                  style={[
                    styles.node,
                    lesson.isCompleted ? styles.nodeCompleted : 
                    lesson.isLocked ? styles.nodeLocked : styles.nodeActive
                  ]}
                  onPress={() => handleLessonPress(lesson)}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="book" 
                    size={32} 
                    color={lesson.isLocked ? colors.text.tertiary : colors.text.primary} 
                  />
                  {lesson.isCompleted && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color={colors.text.primary} />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={[
                  styles.nodeTitle,
                  lesson.isLocked && styles.nodeTitleLocked
                ]} numberOfLines={2}>
                  {lesson.title}
                </Text>
              </View>

              {/* Inline Popup */}
              {selectedLessonId === lesson.id && (
                <View style={[styles.inlinePopup, isLeft ? styles.popupLeft : styles.popupRight]}>
                  <View style={[styles.popupArrow, isLeft ? styles.arrowLeft : styles.arrowRight]} />
                  
                  <Text style={styles.popupTitle}>{lesson.title}</Text>
                  <Text style={styles.popupDescription}>{lesson.description || 'No description available'}</Text>
                  {lesson.duration && (
                    <Text style={styles.popupDuration}>{lesson.duration}</Text>
                  )}
                  
                  <View style={styles.popupButtons}>
                    {lesson.isLocked ? (
                      <TouchableOpacity style={[styles.listenButton, styles.lockedButton]} disabled>
                        <Ionicons name="lock-closed-outline" size={20} color="#A1A1AA" />
                        <Text style={[styles.listenButtonText, styles.lockedButtonText]}>Locked</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.listenButton}
                        onPress={() => onStartLesson && onStartLesson(lesson.id)}
                      >
                        <Ionicons name="play-circle-outline" size={20} color={colors.background} />
                        <Text style={styles.listenButtonText}>Start</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.stickyHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerCourseName} numberOfLines={1}>{course.title}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading course...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.stickyHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerCourseName} numberOfLines={1}>{course.title}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCourseData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Sticky Header */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerCourseName} numberOfLines={1}>{course.title}</Text>
        <View style={styles.completionBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
          <Text style={styles.completionText}>{completionRate}%</Text>
        </View>
      </View>

      {/* Path Content */}
      <View style={{flex: 1}}>

        {stages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No lessons yet</Text>
            <Text style={styles.emptySubtitle}>This course doesn't have any lessons yet</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Subtle $ pattern — scrolls with content */}
            {(() => {
              const cols = 5;
              const spacing = width / cols;
              const totalLessons = stages.reduce((acc, s) => acc + s.lessons.length, 0);
              const estimatedHeight = stages.length * 200 + totalLessons * (NODE_SIZE + 40) + 200;
              const rows = Math.ceil(estimatedHeight / spacing);
              const count = rows * cols;
              return (
                <View style={styles.patternContainer} pointerEvents="none">
                  {Array.from({ length: count }).map((_, i) => {
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    return (
                      <Text
                        key={i}
                        style={[
                          styles.patternChar,
                          {
                            left: col * spacing + spacing / 2 - 16,
                            top: row * spacing,
                          },
                        ]}
                      >
                        $
                      </Text>
                    );
                  })}
                </View>
              );
            })()}

            {stages.map((stage, stageIndex) => (
              <View key={stage.id} style={styles.chapterContainer}>
                {/* Stage Header */}
                <View style={styles.chapterHeader}>
                  <Text style={styles.chapterTitle}>{stage.title}</Text>
                  {stage.description && (
                    <Text style={styles.chapterDescription} numberOfLines={2}>
                      {stage.description}
                    </Text>
                  )}
                  <View style={styles.chapterBadge}>
                    <Text style={styles.chapterBadgeText}>
                      STAGE {stageIndex + 1} • {stage.lessons.length} LESSONS
                    </Text>
                  </View>
                </View>

                {/* Lessons Path */}
                {stage.lessons.length > 0 ? (
                  renderPath(stage.lessons)
                ) : (
                  <Text style={styles.noLessonsText}>No lessons in this stage yet</Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickyHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerCourseName: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completionText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  patternChar: {
    position: 'absolute',
    fontSize: 24,
    color: colors.text.tertiary,
    opacity: 0.05,
    fontFamily: 'Inter_700Bold',
  },
  scrollContent: {
    paddingVertical: 24,
  },
  chapterContainer: {
    marginBottom: 40,
  },
  chapterHeader: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  chapterBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(95, 203, 15, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(95, 203, 15, 0.2)',
  },
  chapterBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chapterTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  chapterDescription: {
    color: colors.text.secondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
    lineHeight: 20,
  },
  pathContainer: {
    paddingHorizontal: PADDING,
  },
  lessonRow: {
    width: '100%',
    marginBottom: NODE_MARGIN_BOTTOM,
    position: 'relative',
    minHeight: NODE_SIZE + 40,
  },
  nodeWrapper: {
    alignItems: 'center',
    width: 120,
    zIndex: 2,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: colors.background,
  },
  nodeActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  nodeCompleted: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  nodeLocked: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  nodeTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  nodeTitleLocked: {
    color: colors.text.tertiary,
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  connectorHorizontal: {
    position: 'absolute',
    top: NODE_SIZE / 2 - LINE_WIDTH / 2,
    width: CONTAINER_WIDTH - 120 - 3*CORNER_RADIUS,
    height: LINE_WIDTH,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  connectorCorner: {
    position: 'absolute',
    top: NODE_SIZE / 2 - LINE_WIDTH / 2,
    width: CORNER_RADIUS,
    height: CORNER_RADIUS,
    borderColor: colors.border,
    zIndex: 1,
  },
  connectorVertical: {
    position: 'absolute',
    top: NODE_SIZE / 2 - LINE_WIDTH / 2 + CORNER_RADIUS,
    height: NODE_SIZE + NODE_MARGIN_BOTTOM - CORNER_RADIUS + LINE_WIDTH,
    width: LINE_WIDTH,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  inlinePopup: {
    position: 'absolute',
    top: NODE_SIZE - 15,
    width: CONTAINER_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    zIndex: 100,
  },
  popupLeft: {
    left: 0,
  },
  popupRight: {
    right: 0,
  },
  popupArrow: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.surfaceBorder,
    transform: [{ rotate: '45deg' }],
  },
  arrowLeft: {
    left: 60 - 10,
  },
  arrowRight: {
    right: 60 - 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  popupDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  popupDuration: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  listenButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accent,
    gap: 8,
  },
  listenButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  lockedButton: {
    backgroundColor: '#3F3F46',
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockedButtonText: {
    color: '#A1A1AA',
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    fontFamily: 'Inter_600SemiBold',
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
  noLessonsText: {
    color: colors.text.tertiary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: PADDING,
  },
});
