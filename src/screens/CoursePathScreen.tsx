import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const NODE_SIZE = 90;
const PADDING = 40;
const NODE_MARGIN_BOTTOM = 40; // Gap between rows
const CONTAINER_WIDTH = width - (PADDING * 2);
const CORNER_RADIUS = 50; // Radius for curved line corners (bigger, more visible curve)
const LINE_WIDTH = 3; // Width of connecting lines

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article';
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

const COURSE_DATA: Chapter[] = [
  {
    id: 'chapter-1',
    title: 'Basics of ChatGPT',
    lessons: [
      {
        id: '1',
        title: 'ChatGPT as an LLM',
        description: 'What is ChatGPT and How Does It Work?',
        type: 'article',
        duration: '5 min',
        isCompleted: true,
        isLocked: false,
      },
      {
        id: '2',
        title: 'Core Capabilities',
        description: 'Understanding what ChatGPT can actually do for you.',
        type: 'video',
        duration: '8 min',
        isCompleted: false,
        isLocked: false,
      },
      {
        id: '3',
        title: 'Prompt Engineering',
        description: 'The art of asking the right questions.',
        type: 'article',
        duration: '10 min',
        isCompleted: false,
        isLocked: true,
      },
    ],
  },
  {
    id: 'chapter-2',
    title: 'Advanced Techniques',
    lessons: [
      {
        id: '4',
        title: 'Context Windows',
        description: 'How much can ChatGPT remember?',
        type: 'video',
        duration: '6 min',
        isCompleted: false,
        isLocked: true,
      },
      {
        id: '5',
        title: 'Advanced Settings',
        description: 'Temperature, Top P and other parameters.',
        type: 'article',
        duration: '12 min',
        isCompleted: false,
        isLocked: true,
      },
    ],
  },
  {
    id: 'chapter-3',
    title: 'Real-World Applications',
    lessons: [
      {
        id: '6',
        title: 'Case Studies',
        description: 'Case studies of successful ChatGPT usage.',
        type: 'video',
        duration: '15 min',
        isCompleted: false,
        isLocked: true,
      },
    ],
  },
];

interface CoursePathScreenProps {
  course: any;
  onBack: () => void;
}

export const CoursePathScreen: React.FC<CoursePathScreenProps> = ({ course, onBack }) => {
  const insets = useSafeAreaInsets();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handleLessonPress = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      setSelectedLesson(lesson);
    }
  };

  const closeModal = () => {
    setSelectedLesson(null);
  };

  // Calculate completion rate
  const totalLessons = COURSE_DATA.reduce((acc, chapter) => acc + chapter.lessons.length, 0);
  const completedLessons = COURSE_DATA.reduce(
    (acc, chapter) => acc + chapter.lessons.filter((l) => l.isCompleted).length,
    0
  );
  const completionRate = Math.round((completedLessons / totalLessons) * 100);

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
                { alignItems: isLeft ? 'flex-start' : 'flex-end' }
              ]}
            >
              {/* Connector Lines with curved corners */}
              {!isLast && (
                <>
                  {/* Horizontal Line connecting to vertical line */}
                  <View style={[
                    styles.connectorHorizontal,
                    isLeft ? { 
                      left: NODE_SIZE / 2 + 60, // Start after the node wrapper (120/2)
                    } : { 
                      right: NODE_SIZE / 2 + 60, // Start after the node wrapper (120/2)
                    },
                  ]} />
                  
                  {/* Corner piece - curved connection */}
                  <View style={[
                    styles.connectorCorner,
                    isLeft ? { 
                      right: 60 - LINE_WIDTH, // Position at the right side
                      borderRightWidth: LINE_WIDTH,
                      borderBottomWidth: LINE_WIDTH,
                      borderBottomRightRadius: CORNER_RADIUS,
                    } : { 
                      left: 60 - LINE_WIDTH, // Position at the left side
                      borderLeftWidth: LINE_WIDTH,
                      borderBottomWidth: LINE_WIDTH,
                      borderBottomLeftRadius: CORNER_RADIUS,
                    },
                  ]} />
                  
                  {/* Vertical Line dropping down to next row */}
                  <View style={[
                    styles.connectorVertical,
                    isLeft ? { 
                      right: 60 - LINE_WIDTH, // Align with next node center
                    } : { 
                      left: 60 - LINE_WIDTH, // Align with next node center
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
                  disabled={lesson.isLocked}
                >
                  <Ionicons 
                    name={lesson.type === 'video' ? 'play' : 'book'} 
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
            </View>
          );
        })}
      </View>
    );
  };

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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {COURSE_DATA.map((chapter, chapterIndex) => (
          <View key={chapter.id} style={styles.chapterContainer}>
            {/* Chapter Header */}
            <View style={styles.chapterHeader}>
              <View style={styles.chapterBadge}>
                <Text style={styles.chapterBadgeText}>
                  AI MASTERY • {course.title.toUpperCase()}: LEVEL {chapterIndex + 1}
                </Text>
              </View>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
            </View>

            {/* Lessons Path */}
            {renderPath(chapter.lessons)}
          </View>
        ))}
      </ScrollView>

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <Modal
          transparent
          visible={!!selectedLesson}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={closeModal}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons 
                    name={selectedLesson.type === 'video' ? 'play' : 'book'} 
                    size={32} 
                    color={colors.text.primary} 
                  />
                </View>
              </View>
              
              <Text style={styles.modalTitle}>{selectedLesson.title}</Text>
              <Text style={styles.modalDescription}>{selectedLesson.description}</Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.readButton}>
                  <Ionicons name="document-text-outline" size={20} color={colors.text.primary} />
                  <Text style={styles.readButtonText}>Read</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.listenButton}>
                  <Ionicons name="volume-high-outline" size={20} color={colors.text.primary} />
                  <Text style={styles.listenButtonText}>Listen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
  scrollContent: {
    paddingVertical: 24,
  },
  chapterContainer: {
    marginBottom: 40,
  },
  chapterHeader: {
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  chapterBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chapterBadgeText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  chapterTitle: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  pathContainer: {
    paddingHorizontal: PADDING,
  },
  lessonRow: {
    width: '100%',
    marginBottom: NODE_MARGIN_BOTTOM,
    position: 'relative',
    minHeight: NODE_SIZE + 40, // Ensure space for title
  },
  nodeWrapper: {
    alignItems: 'center',
    width: 120, // Fixed width for alignment consistency
    zIndex: 2, // Above lines
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
  // Lines
  connectorHorizontal: {
    position: 'absolute',
    top: NODE_SIZE / 2 - LINE_WIDTH / 2, // Center the line vertically on node center
    width: CONTAINER_WIDTH - NODE_SIZE - 120 + CORNER_RADIUS, // Span to corner
    height: LINE_WIDTH,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  connectorCorner: {
    position: 'absolute',
    top: NODE_SIZE / 2 - LINE_WIDTH / 2, // Start from node center
    width: CORNER_RADIUS,
    height: CORNER_RADIUS,
    borderColor: colors.border,
    zIndex: 1,
  },
  connectorVertical: {
    position: 'absolute',
    top: NODE_SIZE / 2 - LINE_WIDTH / 2 + CORNER_RADIUS, // Start after corner
    height: NODE_SIZE + NODE_MARGIN_BOTTOM - CORNER_RADIUS + LINE_WIDTH, // Reach next node center
    width: LINE_WIDTH,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  modalDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  readButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  readButtonText: {
    color: colors.text.primary,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
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
});
