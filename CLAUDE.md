# Profiteezy Mobile

A mobile duolingo like learning platform for making money online (side hustles). Built with React Native, Expo, and Supabase.

## Tech Stack

- **Framework:** React Native 0.81 + Expo SDK 54 (New Architecture enabled)
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (auth, database, real-time)
- **Auth:** Google Sign-In via `@react-native-google-signin/google-signin` + Supabase Auth
- **Navigation:** React Navigation v7 (bottom tabs)
- **Monetization:** Superwall (`expo-superwall`) for paywalls
- **Fonts:** Inter (via `@expo-google-fonts/inter`)
- **Icons:** Ionicons (via `@expo/vector-icons`)
- **Animations:** `react-native-reanimated`, `react-native-gesture-handler`

## Project Structure

```
App.tsx                  # Root: SuperwallProvider > SafeAreaProvider > NavigationContainer
index.ts                 # Entry point
src/
├── components/          # Reusable UI components
│   ├── Button.tsx       # Variants: primary, secondary, outline, ghost
│   ├── Card.tsx         # Variants: default, elevated, outlined
│   ├── Typography.tsx   # Variants: h1-h3, body, caption, label
│   ├── IconButton.tsx   # Icon-only button with variants
│   └── lesson/tasks/    # Interactive lesson task components
│       ├── MultipleChoiceTask.tsx
│       ├── DragDropTask.tsx
│       ├── SortTask.tsx
│       ├── FillWordTask.tsx
│       ├── FreeTextTask.tsx
│       └── BranchingScenarioTask.tsx
├── hooks/
│   └── usePaywall.ts    # Superwall paywall integration hook
├── lib/
│   └── supabase.ts      # Supabase client config + DB type definitions
├── navigation/
│   └── MainTabNavigator.tsx  # Bottom tabs: Home, Challenges, Courses, Profile
├── questionnaire/       # Onboarding flow (self-contained)
│   ├── QuestionnaireNavigator.tsx  # State-based navigation
│   ├── data.ts          # Question/screen definitions
│   ├── types.ts         # Questionnaire type definitions
│   ├── components/      # AnswerOption, ContinueButton, Navbar, ScreenWrapper
│   └── screens/         # Welcome, Question, Image, Input, Score, PersonalPlan
├── screens/             # Main app screens
│   ├── LoginScreen.tsx       # Auth landing page with animated UI
│   ├── HomeScreen.tsx        # Streak tracker + resume learning
│   ├── ChallengesScreen.tsx  # Challenge cards list
│   ├── CoursesScreen.tsx     # Course grid (fetches from Supabase)
│   ├── CoursePathScreen.tsx  # Visual lesson path with zigzag nodes
│   ├── LessonScreen.tsx     # Lesson content + interactive tasks
│   └── LearnScreen.tsx      # Placeholder
├── theme/
│   └── colors.ts        # Dark theme color palette
└── types/
    └── lesson.ts        # Lesson & task type definitions
```

## Navigation Flow

```
LoginScreen
├── Questionnaire (onboarding)
│   Welcome → Questions → Score → PersonalPlan
└── MainTabNavigator (after auth)
    ├── Home
    ├── Challenges
    ├── Courses → CoursePathScreen → LessonScreen
    └── Profile
```

## Supabase Database Tables

- **courses** - Course catalog (title, difficulty, is_live, slug, etc.)
- **stages** - Course sections/modules (course_id, title, order)
- **lessons** - Individual lessons (stage_id, course_id, number, duration, points)
- **lesson_stages** - Lesson content slides (lesson_id, order_number, content)
- **interactive_tasks** - Quiz/tasks per lesson (type, prompt, data JSON)
- **user_courses** - User progress per course (progress %, is_completed)
- **user_lessons** - User progress per lesson (is_completed, points_earned)

## Theme & Styling

- **Dark theme** with background `#1D1D1D`, surface `#292929`
- **Accent color:** `#5FCB0F` (green)
- Styling via React Native `StyleSheet` API (no styling library)
- Spacing based on 8px grid, border-radius 12-16px
- Colors imported from `src/theme/colors.ts`

## Interactive Task Types

Six task types used in lessons: `multiple_choice`, `drag_drop`, `sort`, `fill_word`, `free_text`, `branching_scenario`

## Commands

```bash
npx expo start          # Start dev server
npx expo start --dev-client  # Start with dev client
npx expo run:android    # Run on Android
npx expo run:ios        # Run on iOS
```

## Conventions

- Functional components with hooks (no class components)
- Local `useState` for screen-level state
- Supabase queries done inline in screens with loading/error states
- Platform-specific adjustments via `Platform.OS` checks
- Safe area handled with `react-native-safe-area-context`
- Bundle ID: `com.profiteezy.app`
