/**
 * Questionnaire types and interfaces
 */

export interface Answer {
  id: string;
  text: string;
  icon?: any; // Image source (require() or uri)
}

export interface Question {
  type?: 'question';
  id: string;
  title: string;
  subtitle?: string;
  answers: Answer[];
  multiSelect?: boolean; // Allow multiple selections
}

export interface WelcomeScreenData {
  image: any; // Image source
  title: string;
  subtitle: string;
  buttonText: string;
  termsText: string;
}

export interface ImageScreenData {
  type: 'image';
  image: any; // Image source
  title?: string;
  titlePosition?: 'top' | 'bottom'; // Where to display the title (default: 'top')
  description?: string; // Text to display under the image
  children?: React.ReactNode; // Custom content to display under description
}

export interface InputScreenData {
  type: 'input';
  id: string;
  title?: string;
  description?: string;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
  multiline?: boolean;
  maxLength?: number;
}

export interface MoneyMakingProbabilityResultData {
  type: 'result';
  title: string;
  scoreTitle?: string; // e.g. "Readiness score"
  resultLabel?: string; // e.g. "Result: Perfect"
  markerLabel?: string; // e.g. "Moderate"
  markerValue?: number; // 0..1 across the bar
  infoTitle?: string;
  infoText?: string;
  stats?: Array<{
    title: string;
    value: string;
    icon?: any;
    muted?: boolean;
  }>;
}

export interface ReviewData {
  id: string;
  name: string;
  text: string;
  stars: number; // 1-5
  image?: any; // Avatar image source
  timeAgo?: string; // e.g. "2 min ago"
}

export interface PersonalPlanScreenData {
  type: 'personal_plan';
  title: string;
  phases: string[]; // e.g. ["Setting your goals", "Preparing to make first dollar"]
  reviews: ReviewData[];
}

export interface SignInScreenData {
  type: 'sign_in';
  title?: string;
  subtitle?: string;
}

export type QuestionnaireStep =
  | Question
  | ImageScreenData
  | InputScreenData
  | MoneyMakingProbabilityResultData
  | PersonalPlanScreenData
  | SignInScreenData;

export interface QuestionnaireData {
  welcome: WelcomeScreenData;
  questions: QuestionnaireStep[];
}

export interface QuestionnaireResult {
  [questionId: string]: string | string[]; // Single or multiple answer IDs
}
