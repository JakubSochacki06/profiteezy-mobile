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

export interface LessonStage {
  id: string;
  lesson_id: string | null;
  order_number: number;
  title: string | null;
  content: string | null;
  points: number | null;
  duration: number | null;
  created_at: string;
  updated_at: string;
}

export interface InteractiveTask {
  id: string;
  lesson_id: string;
  type: string | null;
  prompt: string | null;
  data: {
    choices?: string[];
    correct_answer?: number;
    [key: string]: any;
  } | null;
  order_number: number;
  created_at: string | null;
  updated_at: string | null;
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
  superwall_customer_id: string | null;
  subscription_status: string | null;
  created_at?: string;
  updated_at?: string;
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
export async function getCurrentLearningState(): Promise<{
  course: Course | null;
  nextLesson: Lesson | null;
  progress: number;
  completedLessons: number;
  totalLessons: number;
} | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Get the first live course (or the course user has started)
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('is_live', true)
      .limit(1);

    if (courseError || !courses || courses.length === 0) return null;

    const course = courses[0] as Course;
    const courseProgress = await getCourseProgress(course.id);
    const nextLesson = await getNextLesson(course.id);

    return {
      course,
      nextLesson,
      progress: courseProgress.percentage,
      completedLessons: courseProgress.completedCount,
      totalLessons: courseProgress.totalCount,
    };
  } catch (err) {
    console.error('Error in getCurrentLearningState:', err);
    return null;
  }
}

// ===== Daily Missions Helper Functions =====

const DAILY_MISSION_KEYS = ['complete_lesson', 'earn_points'] as const;

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
    if (existing && existing.length > 0) {
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
 * Update progress for a specific daily mission
 */
export async function updateMissionProgress(
  userId: string,
  missionKey: string,
  progress: number,
  target: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = progress >= target;

    const { error } = await supabase
      .from('user_daily_missions')
      .update({
        progress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
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
