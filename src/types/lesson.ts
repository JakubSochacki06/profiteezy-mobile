// Task types supported in lesson stages
export type TaskType = 
  | 'multiple_choice' 
  | 'drag_drop' 
  | 'sort' 
  | 'fill_word';

// Task data structures for each task type
export interface MultipleChoiceTaskData {
  question: string;
  options: string[];
  correct_index: number[]; // Array of correct option indices, e.g. [0, 2, 3]
}

export interface DragDropTaskData {
  question: string;
  items: string[];
  correct_order: number[];
}

export interface SortTaskData {
  question: string;
  categories: string[];
  items: { text: string; category: string }[];
}

export interface FillWordTaskData {
  question: string;
  segments: (string | null)[];
  words: string[];
  correct_words: string[];
}

export type TaskData = 
  | MultipleChoiceTaskData 
  | DragDropTaskData 
  | SortTaskData 
  | FillWordTaskData;

// Unified lesson stage - can be text-only or text + task
export interface LessonStage {
  id: string;
  lesson_id: string;
  order_number: number;
  title: string | null;
  content: string;
  points: number | null;
  duration: number | null;
  // Task fields (null means text-only stage)
  task_type: TaskType | null;
  task_data: TaskData | null;
}

// Stage type derived from task_type presence
export type StageType = 'text_only' | 'text_with_task';

// Helper to determine stage type
export function getStageType(stage: LessonStage): StageType {
  return stage.task_type ? 'text_with_task' : 'text_only';
}

// Props for task components
export interface TaskComponentProps<T extends TaskData> {
  taskData: T;
  // Called when user selection changes - reports if task is ready to check
  onReadyChange: (isReady: boolean) => void;
  // Called to register the check answer function
  registerCheckAnswer: (checkFn: () => boolean) => void;
  // Whether the result is being shown (task should be disabled)
  showResult: boolean;
  // Current attempt count (for reset handling)
  attemptCount: number;
}
