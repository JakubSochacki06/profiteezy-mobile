import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from '../components';
import { CoursePathScreen } from './CoursePathScreen';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2; // 20 padding left, 20 padding right, 10 gap

interface Course {
  id: string;
  title: string;
  lessons: number;
  levels: number;
  image: any;
  progress: number; // 0 to 1
}

const COURSES_DATA: Course[] = [
  {
    id: '1',
    title: 'Stable Diffusion',
    lessons: 14,
    levels: 2,
    image: require('../../assets/emojis/laptopEmoji.png'),
    progress: 0.1,
  },
  {
    id: '2',
    title: 'DeepSeek',
    lessons: 15,
    levels: 3,
    image: require('../../assets/emojis/laptopEmoji.png'),
    progress: 0.2,
  },
  {
    id: '3',
    title: 'Claude 3.7',
    lessons: 22,
    levels: 3,
    image: require('../../assets/emojis/laptopEmoji.png'),
    progress: 0.05,
  },
  {
    id: '4',
    title: 'ChatGPT',
    lessons: 20,
    levels: 3,
    image: require('../../assets/emojis/laptopEmoji.png'),
    progress: 0.15,
  },
  {
    id: '5',
    title: 'Jasper AI',
    lessons: 14,
    levels: 2,
    image: require('../../assets/emojis/laptopEmoji.png'),
    progress: 0.1,
  },
  {
    id: '6',
    title: 'DALL-E',
    lessons: 16,
    levels: 3,
    image: require('../../assets/emojis/laptopEmoji.png'),
    progress: 0.0,
  },
  {
    id: '7',
    title: 'MidJourney',
    lessons: 18,
    levels: 3,
    image: require('../../assets/emojis/laptopEmoji.png'),
    progress: 0.0,
  },
  {
    id: '8',
    title: 'ChatGPT Mastery',
    lessons: 15,
    levels: 3,
    image: require('../../assets/emojis/laptopEmoji.png'),
    progress: 0.0,
  },
];

export const CoursesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    // Hide tab bar when a course is selected
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: selectedCourse ? { display: 'none' } : undefined,
      });
    }

    const onBackPress = () => {
      if (selectedCourse) {
        setSelectedCourse(null);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedCourse, navigation]);

  if (selectedCourse) {
    return <CoursePathScreen course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => setSelectedCourse(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>
          Lessons {item.lessons} · {item.levels} levels
        </Text>
        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="chevron-back" size={24} color={colors.text.primary} />}
          onPress={() => navigation.navigate('Home' as never)}
          variant="filled"
        />
        <Text style={styles.headerTitle}>Your Mastery path</Text>
      </View>

      <FlatList
        data={COURSES_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface, 
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardImage: {
    width: 60,
    height: 60,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 12,
    fontFamily: 'Inter_500Medium',
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: colors.background, // Darker track
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
});
