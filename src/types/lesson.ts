export type TaskType = 
  | 'drag_drop' 
  | 'multiple_choice' 
  | 'sort' 
  | 'fill_word' 
  | 'free_text' 
  | 'branching_scenario';

export interface BaseTask {
  id: string;
  type: TaskType;
  question: string; // Main instruction or question
}

export interface MultipleChoiceTask extends BaseTask {
  type: 'multiple_choice';
  options: string[];
  correctIndex: number;
}

export interface DragDropTask extends BaseTask {
  type: 'drag_drop';
  items: string[]; // Items to be ordered
  correctOrder: string[]; // The correct order of items
}

export interface SortTask extends BaseTask {
  type: 'sort';
  categories: { id: string; name: string }[];
  items: { id: string; content: string; categoryId: string }[];
}

export interface FillWordTask extends BaseTask {
  type: 'fill_word';
  sentence: string; // Text with placeholders like "{0}", "{1}" or just segments
  // Better structure for rendering:
  segments: (string | null)[]; // null represents a blank
  words: string[]; // The pool of words to drag
  correctWords: string[]; // The correct words for the blanks in order
}

export interface FreeTextTask extends BaseTask {
  type: 'free_text';
  prompt: string;
  placeholder?: string;
  minChars?: number;
}

export interface BranchingScenarioTask extends BaseTask {
  type: 'branching_scenario';
  startScenarioId: string;
  scenarios: {
    [id: string]: {
      text: string;
      choices: { 
        text: string; 
        nextId: string | 'win' | 'lose';
        feedback?: string; 
      }[];
      backgroundImage?: any;
    };
  };
}

export type Task = 
  | MultipleChoiceTask 
  | DragDropTask 
  | SortTask 
  | FillWordTask 
  | FreeTextTask 
  | BranchingScenarioTask;

export interface LessonStage {
  id: string;
  title: string;
  content: string;
  image?: any;
}
