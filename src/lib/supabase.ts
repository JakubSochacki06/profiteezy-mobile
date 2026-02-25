import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

// These come from .env file (EXPO_PUBLIC_ prefix makes them available in Expo)
// Get your credentials from: https://supabase.com/dashboard/project/_/settings/api
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Missing Supabase credentials! Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// Types for the database
export interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  success_rate: number | null;
  icon: string | null;
  is_live: boolean | null;
  mentor_id: string | null;
  users_earned: string | null;
  slug: string | null;
  budget_needed: string | null;
  time_required: string | null;
  rating: number | null;
  student_count: number | null;
  what_youll_learn: any | null;
  course_includes: any | null;
  video_url: string | null;
  image_url: string | null;
  is_finished: boolean;
  created_at: string;
  updated_at: string;
  lesson_count?: number;
  stage_count?: number;
}

export interface Stage {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order: number;
}

export interface Lesson {
  id: string;
  course_id: string | null;
  stage_id: string | null;
  number: number;
  title: string;
  description: string | null;
  duration: string | null;
  points: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * ============================================================================
 * LESSON STAGES TABLE STRUCTURE
 * ============================================================================
 * 
 * The `lesson_stages` table represents individual screens/steps within a lesson.
 * Each stage can be either:
 * - **Text-only**: Educational content without interaction (task_type = null)
 * - **Text + Task**: Content with an interactive task (task_type is set)
 * 
 * Database Schema:
 * ┌──────────────┬─────────────────────────┬──────────┬─────────────────────┐
 * │ Column       │ Type                    │ Nullable │ Description         │
 * ├──────────────┼─────────────────────────┼──────────┼─────────────────────┤
 * │ id           │ uuid                    │ NO       │ Primary key         │
 * │ lesson_id    │ uuid                    │ YES      │ FK to lessons table │
 * │ order_number │ integer                 │ NO       │ Display order (1,2..)│
 * │ title        │ text                    │ YES      │ Stage heading       │
 * │ content      │ text                    │ YES      │ Markdown/text body  │
 * │ points       │ smallint                │ YES      │ XP earned if task   │
 * │ duration     │ integer                 │ YES      │ Est. seconds        │
 * │ task_type    │ text                    │ YES      │ See TaskType below  │
 * │ task_data    │ jsonb                   │ YES      │ Task config JSON    │
 * │ created_at   │ timestamp with time zone│ YES      │ Auto-set            │
 * │ updated_at   │ timestamp with time zone│ YES      │ Auto-set            │
 * └──────────────┴─────────────────────────┴──────────┴─────────────────────┘
 * 
 * ============================================================================
 * TASK TYPES & EXPECTED task_data STRUCTURES
 * ============================================================================
 * 
 * When `task_type` is set, `task_data` MUST contain the corresponding JSON:
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. MULTIPLE_CHOICE
 * ─────────────────────────────────────────────────────────────────────────────
 * task_type: "multiple_choice"
 * task_data: {
 *   "question": "What is the main benefit of diversification?",
 *   "options": [
 *     "Higher returns guaranteed",
 *     "Reduced risk exposure",
 *     "Lower fees",
 *     "Faster trading"
 *   ],
 *   "correct_index": [1]  // Array of correct indices (supports multi-select)
 * }
 * 
 * Notes:
 * - `correct_index` is an ARRAY to support multiple correct answers
 * - For single-answer questions, use array with one element: [0]
 * - Indices are 0-based
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. DRAG_DROP
 * ─────────────────────────────────────────────────────────────────────────────
 * task_type: "drag_drop"
 * task_data: {
 *   "question": "Arrange these investment steps in order:",
 *   "items": ["Set goals", "Research", "Invest", "Monitor"],
 *   "correct_order": [0, 1, 2, 3]  // Correct sequence of item indices
 * }
 * 
 * Notes:
 * - `items` are shown shuffled in the UI
 * - `correct_order` defines the proper sequence using original indices
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * 3. SORT (Categorization)
 * ─────────────────────────────────────────────────────────────────────────────
 * task_type: "sort"
 * task_data: {
 *   "question": "Categorize these as Assets or Liabilities:",
 *   "categories": ["Assets", "Liabilities"],
 *   "items": [
 *     { "text": "House", "category": "Assets" },
 *     { "text": "Car Loan", "category": "Liabilities" },
 *     { "text": "Stocks", "category": "Assets" },
 *     { "text": "Credit Card Debt", "category": "Liabilities" }
 *   ]
 * }
 * 
 * Notes:
 * - User drags items into category buckets
 * - `category` field must match one of the `categories` exactly
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * 4. FILL_WORD (Fill in the blanks)
 * ─────────────────────────────────────────────────────────────────────────────
 * task_type: "fill_word"
 * task_data: {
 *   "question": "Complete the sentence:",
 *   "segments": ["The stock market is ", null, " by ", null, "."],
 *   "words": ["regulated", "driven", "the SEC", "emotions"],
 *   "correct_words": ["regulated", "the SEC"]
 * }
 * 
 * Notes:
 * - `segments` array: strings are static text, `null` = blank to fill
 * - `words` are the draggable word bank options
 * - `correct_words` are the correct answers in order of blanks
 * - Number of `null` in segments must equal length of `correct_words`
 * 
 * ============================================================================
 * EXAMPLES
 * ============================================================================
 * 
 * Structure:
 * - `title` & `content`: Educational material the user reads/learns
 * - `task_data.question` & rest: Quiz/interaction testing what they learned
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * TEXT-ONLY STAGE (pure learning, no quiz):
 * {
 *   order_number: 1,
 *   title: "What is Passive Income?",
 *   content: "Passive income is money earned with minimal ongoing effort. Unlike a salary where you trade time for money, passive income streams continue generating revenue even when you're not actively working. Common examples include dividends from stocks, rental income, and royalties.",
 *   points: null,
 *   duration: 30,
 *   task_type: null,
 *   task_data: null
 * }
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * MULTIPLE CHOICE STAGE:
 * {
 *   order_number: 2,
 *   title: "Types of Passive Income",
 *   content: "Dividends are payments companies make to shareholders from their profits. When you own stock in a profitable company, you may receive quarterly dividend payments without selling your shares.",
 *   points: 10,
 *   duration: 45,
 *   task_type: "multiple_choice",
 *   task_data: {
 *     question: "Based on what you learned, which is a form of passive income?",
 *     options: ["Salary", "Dividends", "Freelancing", "Consulting"],
 *     correct_index: [1]
 *   }
 * }
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * DRAG & DROP STAGE:
 * {
 *   order_number: 3,
 *   title: "The Investment Process",
 *   content: "Successful investing follows a clear process: First, define your financial goals. Then research your options thoroughly. Only after that should you invest. Finally, monitor your investments regularly to ensure they align with your goals.",
 *   points: 15,
 *   duration: 60,
 *   task_type: "drag_drop",
 *   task_data: {
 *     question: "Arrange the investment steps in the correct order:",
 *     items: ["Set goals", "Research options", "Make investment", "Monitor results"],
 *     correct_order: [0, 1, 2, 3]
 *   }
 * }
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * SORT/CATEGORIZE STAGE:
 * {
 *   order_number: 4,
 *   title: "Assets vs Liabilities",
 *   content: "Assets put money in your pocket - they're things you own that have value or generate income (stocks, real estate, savings). Liabilities take money out - they're debts you owe (car loans, credit card debt, mortgages).",
 *   points: 15,
 *   duration: 60,
 *   task_type: "sort",
 *   task_data: {
 *     question: "Categorize each item based on what you learned:",
 *     categories: ["Assets", "Liabilities"],
 *     items: [
 *       { text: "House you own", category: "Assets" },
 *       { text: "Car Loan", category: "Liabilities" },
 *       { text: "Stock Portfolio", category: "Assets" },
 *       { text: "Credit Card Debt", category: "Liabilities" }
 *     ]
 *   }
 * }
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * FILL IN THE BLANK STAGE:
 * {
 *   order_number: 5,
 *   title: "Market Regulation",
 *   content: "The stock market doesn't operate freely - it's regulated by the Securities and Exchange Commission (SEC). The SEC protects investors by enforcing laws against market manipulation and fraud.",
 *   points: 10,
 *   duration: 45,
 *   task_type: "fill_word",
 *   task_data: {
 *     question: "Complete the sentence based on the lesson:",
 *     segments: ["The stock market is ", null, " by ", null, "."],
 *     words: ["regulated", "driven", "the SEC", "emotions"],
 *     correct_words: ["regulated", "the SEC"]
 *   }
 * }
 */
export interface LessonStage {
  id: string;
  lesson_id: string | null;
  order_number: number;
  title: string | null;
  content: string | null;
  points: number | null;
  duration: number | null;
  /** 
   * Task type - if null, this is a text-only stage.
   * Valid values: 'multiple_choice' | 'drag_drop' | 'sort' | 'fill_word'
   */
  task_type: string | null;
  /** 
   * Task configuration JSON - structure depends on task_type.
   * See documentation above for expected shapes.
   */
  task_data: {
    question?: string;
    options?: string[];
    correct_index?: number[];
    items?: string[] | { text: string; category: string }[];
    correct_order?: number[];
    categories?: string[];
    segments?: (string | null)[];
    words?: string[];
    correct_words?: string[];
    [key: string]: any;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface UserCourse {
  id: string;
  user_id: string | null;
  course_id: string | null;
  progress: number | null;
  is_completed: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface UserLesson {
  id: string;
  user_id: string | null;
  lesson_id: string | null;
  is_completed: boolean | null;
  completed_at: string | null;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface UserDailyMission {
  id: string;
  user_id: string;
  mission_key: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  date: string;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string | null;
  is_completed: boolean;
  completed_at: string | null;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  superwall_customer_id: string | null;
  subscription_status: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatarColor: string;
  isCurrentUser: boolean;
}

// Deterministic avatar color from user id
const AVATAR_COLORS = [
  '#F472B6', '#FB7185', '#A78BFA', '#FBBF24', '#C084FC',
  '#FDA4AF', '#34D399', '#FCD34D', '#818CF8', '#F97316',
  '#22D3EE', '#A3E635', '#E879F9', '#38BDF8', '#FB923C',
];

function avatarColorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Fetch leaderboard data from profiles, ordered by points descending
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, points')
      .order('points', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return (data || []).map((profile, index) => ({
      id: profile.id,
      name: profile.full_name || profile.email?.split('@')[0] || 'Anonymous',
      score: profile.points ?? 0,
      rank: index + 1,
      avatarColor: avatarColorFromId(profile.id),
      isCurrentUser: user?.id === profile.id,
    }));
  } catch (err) {
    console.error('Error in fetchLeaderboard:', err);
    return [];
  }
}

/**
 * Upsert a user profile to the profiles table
 */
export async function upsertProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Error upserting profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in upsertProfile:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get user's total points from all completed lessons
 */
export async function getUserTotalPoints(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('points_earned')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user total points:', error);
      return 0;
    }

    const totalPoints = data?.reduce((acc, curr) => acc + (curr.points_earned || 0), 0) || 0;
    return totalPoints;
  } catch (err) {
    console.error('Error in getUserTotalPoints:', err);
    return 0;
  }
}

// ===== Progress Helper Functions =====

/**
 * Mark a lesson as completed for the current user
 */
export async function markLessonComplete(
  lessonId: string,
  courseId?: string,
  pointsEarned: number = 0
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId || null,
        is_completed: true,
        completed_at: new Date().toISOString(),
        points_earned: pointsEarned,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,lesson_id',
      });

    if (error) {
      console.error('Error marking lesson complete:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in markLessonComplete:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all completed lesson IDs for a specific course
 */
export async function getCompletedLessons(courseId: string): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('is_completed', true);

    if (error) {
      console.error('Error fetching completed lessons:', error);
      return [];
    }

    return (data || []).map(row => row.lesson_id);
  } catch (err) {
    console.error('Error in getCompletedLessons:', err);
    return [];
  }
}

/**
 * Get the user's overall progress for a course
 */
export async function getCourseProgress(courseId: string): Promise<{
  completedCount: number;
  totalCount: number;
  percentage: number;
  lastCompletedLessonId: string | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { completedCount: 0, totalCount: 0, percentage: 0, lastCompletedLessonId: null };
    }

    // Get total lessons in course
    const { count: totalCount, error: lessonsError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    if (lessonsError) throw lessonsError;

    // Get completed lessons
    const { data: completedData, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id, completed_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    if (progressError) throw progressError;

    const completedCount = completedData?.length || 0;
    const total = totalCount || 0;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const lastCompletedLessonId = completedData?.[0]?.lesson_id || null;

    return {
      completedCount,
      totalCount: total,
      percentage,
      lastCompletedLessonId,
    };
  } catch (err) {
    console.error('Error in getCourseProgress:', err);
    return { completedCount: 0, totalCount: 0, percentage: 0, lastCompletedLessonId: null };
  }
}

/**
 * Get the next lesson the user should do in a course
 * Returns the first uncompleted lesson, or null if all completed
 */
export async function getNextLesson(courseId: string): Promise<Lesson | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return first lesson if not authenticated
      const { data: firstLesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('number', { ascending: true })
        .limit(1)
        .single();
      return firstLesson || null;
    }

    // Get all lessons ordered by number
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('number', { ascending: true });

    if (lessonsError || !lessons) return null;

    // Get completed lesson IDs
    const completedLessonIds = await getCompletedLessons(courseId);
    const completedSet = new Set(completedLessonIds);

    // Find first uncompleted lesson
    for (const lesson of lessons) {
      if (!completedSet.has(lesson.id)) {
        return lesson as Lesson;
      }
    }

    // All lessons completed, return null
    return null;
  } catch (err) {
    console.error('Error in getNextLesson:', err);
    return null;
  }
}

/**
 * Get the user's current learning state for the home screen
 */
export async function getCurrentLearningState(courseId?: string): Promise<{
  course: Course | null;
  nextLesson: Lesson | null;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  totalPoints: number;
} | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    let course: Course | null = null;

    if (courseId) {
       const { data: specificCourse, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
        
       if (!error && specificCourse) {
         course = specificCourse as Course;
       }
    }

    if (!course) {
      // Get the first live course (fallback)
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_live', true)
        .limit(1);

      if (courseError || !courses || courses.length === 0) return null;
      course = courses[0] as Course;
    }

    const courseProgress = await getCourseProgress(course.id);
    const nextLesson = await getNextLesson(course.id);
    const totalPoints = user ? await getUserTotalPoints(user.id) : 0;

    return {
      course,
      nextLesson,
      progress: courseProgress.percentage,
      completedLessons: courseProgress.completedCount,
      totalLessons: courseProgress.totalCount,
      totalPoints,
    };
  } catch (err) {
    console.error('Error in getCurrentLearningState:', err);
    return null;
  }
}

// ===== Daily Missions Helper Functions =====

export const DAILY_MISSION_KEYS = [
  'invite_friend',
  'earn_points',
  'complete_lessons',
  'correct_first_try',
] as const;

export type MissionKey = typeof DAILY_MISSION_KEYS[number];

export interface MissionDefinition {
  key: MissionKey;
  title: string;
  target: number;
  icon: string; // Ionicons name
}

/** Static mission definitions – same every day */
export const MISSION_DEFINITIONS: MissionDefinition[] = [
  { key: 'invite_friend', title: 'Invite your first friend', target: 1, icon: 'person-add' },
  { key: 'earn_points', title: 'Earn 100 points', target: 100, icon: 'cash-outline' },
  { key: 'complete_lessons', title: 'Complete 3 lessons', target: 3, icon: 'book-outline' },
  { key: 'correct_first_try', title: 'Get 5 perfect answers', target: 5, icon: 'checkmark-circle-outline' },
];

export const TOTAL_DAILY_MISSIONS = MISSION_DEFINITIONS.length;

/**
 * Fetch today's daily missions for the user, creating default rows if none exist
 */
export async function fetchDailyMissions(userId: string): Promise<UserDailyMission[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Try to fetch existing missions for today
    const { data: existing, error: fetchError } = await supabase
      .from('user_daily_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    if (fetchError) {
      console.error('Error fetching daily missions:', fetchError);
      return [];
    }

    // If missions already exist for today, return them
    if (existing && existing.length === DAILY_MISSION_KEYS.length) {
      return existing as UserDailyMission[];
    }

    // Otherwise, create default missions for today
    const defaultMissions = DAILY_MISSION_KEYS.map((key) => ({
      user_id: userId,
      mission_key: key,
      progress: 0,
      is_completed: false,
      date: today,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('user_daily_missions')
      .upsert(defaultMissions, { onConflict: 'user_id,mission_key,date' })
      .select();

    if (insertError) {
      console.error('Error inserting daily missions:', insertError);
      return [];
    }

    return (inserted || []) as UserDailyMission[];
  } catch (err) {
    console.error('Error in fetchDailyMissions:', err);
    return [];
  }
}

/**
 * Update progress for a specific daily mission (increment by a delta)
 */
export async function updateMissionProgress(
  userId: string,
  missionKey: string,
  delta: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const definition = MISSION_DEFINITIONS.find((m) => m.key === missionKey);
    if (!definition) return { success: false, error: 'Unknown mission key' };

    // Fetch current progress
    const { data: current, error: fetchErr } = await supabase
      .from('user_daily_missions')
      .select('progress, is_completed')
      .eq('user_id', userId)
      .eq('mission_key', missionKey)
      .eq('date', today)
      .single();

    if (fetchErr || !current) {
      // Mission row may not exist yet – create it via fetchDailyMissions
      await fetchDailyMissions(userId);
      // Then try fetching again
      const { data: retry } = await supabase
        .from('user_daily_missions')
        .select('progress, is_completed')
        .eq('user_id', userId)
        .eq('mission_key', missionKey)
        .eq('date', today)
        .single();
      if (!retry) return { success: false, error: 'Could not find or create mission row' };
      // Fall through with retry data
      Object.assign(current ?? {}, retry);
    }

    // If already completed, no need to update
    if (current?.is_completed) return { success: true };

    const newProgress = Math.min((current?.progress ?? 0) + delta, definition.target);
    const isCompleted = newProgress >= definition.target;

    const { error } = await supabase
      .from('user_daily_missions')
      .update({
        progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('mission_key', missionKey)
      .eq('date', today);

    if (error) {
      console.error('Error updating mission progress:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in updateMissionProgress:', err);
    return { success: false, error: err.message };
  }
}

// ===== Streak Helper Functions =====

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

/**
 * Fetch the user's current streak data.
 * Uses a server-side function that automatically checks if the streak
 * is still alive (i.e. last activity was today or yesterday).
 */
export async function fetchStreak(userId: string): Promise<StreakData> {
  try {
    const { data, error } = await supabase.rpc('get_user_streak', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching streak:', error);
      return { current_streak: 0, longest_streak: 0, last_activity_date: null };
    }

    const row = data?.[0];
    return {
      current_streak: row?.current_streak ?? 0,
      longest_streak: row?.longest_streak ?? 0,
      last_activity_date: row?.last_activity_date ?? null,
    };
  } catch (err) {
    console.error('Error in fetchStreak:', err);
    return { current_streak: 0, longest_streak: 0, last_activity_date: null };
  }
}

/**
 * Update the user's streak after completing a lesson.
 * Uses a server-side function that handles all the date logic atomically:
 *   - Same day → no change
 *   - Consecutive day → increment
 *   - Gap → reset to 1
 * Returns the updated streak data.
 */
export async function updateStreak(userId: string): Promise<StreakData> {
  try {
    const { data, error } = await supabase.rpc('update_user_streak', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error updating streak:', error);
      return { current_streak: 0, longest_streak: 0, last_activity_date: null };
    }

    const row = data?.[0];
    return {
      current_streak: row?.current_streak ?? 0,
      longest_streak: row?.longest_streak ?? 0,
      last_activity_date: row?.last_activity_date ?? null,
    };
  } catch (err) {
    console.error('Error in updateStreak:', err);
    return { current_streak: 0, longest_streak: 0, last_activity_date: null };
  }
}

/**
 * Batch-update multiple mission progresses after a lesson is completed.
 * Called once at end of lesson with the stats from that session.
 */
export async function updateMissionsAfterLesson(
  userId: string,
  stats: {
    pointsEarned: number;
    lessonsCompleted: number;
    firstTryCorrectCount: number;
  }
): Promise<void> {
  try {
    const promises: Promise<any>[] = [];

    if (stats.pointsEarned > 0) {
      promises.push(updateMissionProgress(userId, 'earn_points', stats.pointsEarned));
    }

    if (stats.lessonsCompleted > 0) {
      promises.push(updateMissionProgress(userId, 'complete_lessons', stats.lessonsCompleted));
    }

    if (stats.firstTryCorrectCount > 0) {
      promises.push(updateMissionProgress(userId, 'correct_first_try', stats.firstTryCorrectCount));
    }

    await Promise.all(promises);
  } catch (err) {
    console.error('Error updating missions after lesson:', err);
  }
}
