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
