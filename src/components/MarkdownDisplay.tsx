import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface MarkdownDisplayProps {
  content: string;
}

type BlockType = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'paragraph' 
  | 'list_unordered' 
  | 'image' 
  | 'blockquote'
  | 'tips' | 'real_world_example' | 'common_mistake';

interface MarkdownBlock {
  type: BlockType;
  content: string | string[]; // string for most, string[] for lists
  metadata?: any;
}

const { width } = Dimensions.get('window');

export const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ content }) => {

  const parsedBlocks = useMemo(() => {
    if (!content) return [];

    // 1. Split by custom boxes first to preserve them
    const boxRegex = /(::(?:real_world_example|tips|common_mistake)(?:[\s\S]*?)::\/(?:real_world_example|tips|common_mistake))/g;
    const parts = content.split(boxRegex);

    const blocks: MarkdownBlock[] = [];

    parts.forEach(part => {
      // Check for custom boxes
      if (part.startsWith('::real_world_example')) {
        const inner = part.replace(/::real_world_example\s*/, '').replace(/\s*::\/real_world_example/, '');
        blocks.push({ type: 'real_world_example', content: inner.trim() });
      } else if (part.startsWith('::tips')) {
        const inner = part.replace(/::tips\s*/, '').replace(/\s*::\/tips/, '');
        blocks.push({ type: 'tips', content: inner.trim() });
      } else if (part.startsWith('::common_mistake')) {
        const inner = part.replace(/::common_mistake\s*/, '').replace(/\s*::\/common_mistake/, '');
        blocks.push({ type: 'common_mistake', content: inner.trim() });
      } else {
        // Process standard markdown
        const lines = part.split('\n');
        let currentList: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (!line) {
             // End of list if explicit empty line
             if (currentList.length > 0) {
                blocks.push({ type: 'list_unordered', content: [...currentList] });
                currentList = [];
             }
             continue;
          }

          // Headers - Check from longest to shortest match
          if (line.startsWith('###### ')) {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            blocks.push({ type: 'h6', content: line.substring(7).trim() });
          } else if (line.startsWith('##### ')) {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            blocks.push({ type: 'h5', content: line.substring(6).trim() });
          } else if (line.startsWith('#### ')) {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            blocks.push({ type: 'h4', content: line.substring(5).trim() });
          } else if (line.startsWith('### ')) {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            blocks.push({ type: 'h3', content: line.substring(4).trim() });
          } else if (line.startsWith('## ')) {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            blocks.push({ type: 'h2', content: line.substring(3).trim() });
          } else if (line.startsWith('# ')) {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            blocks.push({ type: 'h1', content: line.substring(2).trim() });
          }
          // Blockquotes
          else if (line.startsWith('> ')) {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            blocks.push({ type: 'blockquote', content: line.substring(2).trim() });
          }
          // Images
          else if (line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)) {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (match) {
              blocks.push({ type: 'image', content: match[2], metadata: { alt: match[1] } });
            }
          }
          // Lists
          else if (line.startsWith('- ') || line.startsWith('* ')) {
            currentList.push(line.substring(2).trim());
          }
          // Paragraphs
          else {
            if (currentList.length > 0) { blocks.push({ type: 'list_unordered', content: [...currentList] }); currentList = []; }
            blocks.push({ type: 'paragraph', content: line });
          }
        }
        
        // Flush remaining list
        if (currentList.length > 0) {
            blocks.push({ type: 'list_unordered', content: [...currentList] });
        }
      }
    });

    return blocks;
  }, [content]);

  const renderFormattedText = (text: string, style?: any) => {
    // Handle bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return (
      <Text style={style}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={index} style={{ fontWeight: 'bold', color: colors.text.primary }}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          
          // Handle italic (*text*)
          const subParts = part.split(/(\*[^*]+\*)/g);
          return subParts.map((subPart, subIndex) => {
            if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
              return (
                <Text key={`${index}-${subIndex}`} style={{ fontStyle: 'italic' }}>
                  {subPart.slice(1, -1)}
                </Text>
              );
            }
            return <Text key={`${index}-${subIndex}`}>{subPart}</Text>;
          });
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {parsedBlocks.map((block, index) => {
        switch (block.type) {
          case 'h1':
            return <Text key={index} style={styles.h1}>{block.content}</Text>;
          case 'h2':
            return <Text key={index} style={styles.h2}>{block.content}</Text>;
          case 'h3':
            return <Text key={index} style={styles.h3}>{block.content}</Text>;
          case 'h4':
            return <Text key={index} style={styles.h4}>{block.content}</Text>;
          case 'h5':
            return <Text key={index} style={styles.h5}>{block.content}</Text>;
          case 'h6':
            return <Text key={index} style={styles.h6}>{block.content}</Text>;
          
          case 'paragraph':
            return (
              <View key={index} style={styles.paragraphContainer}>
                {renderFormattedText(block.content as string, styles.paragraph)}
              </View>
            );
            
          case 'blockquote':
            return (
              <View key={index} style={styles.blockquote}>
                <View style={styles.blockquoteBar} />
                <Text style={styles.blockquoteText}>{block.content}</Text>
              </View>
            );

          case 'list_unordered':
            return (
              <View key={index} style={styles.listContainer}>
                {(block.content as string[]).map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={styles.bullet} />
                    {renderFormattedText(item, styles.listItemText)}
                  </View>
                ))}
              </View>
            );

          case 'image':
            return (
              <View key={index} style={styles.imageContainer}>
                <Image 
                  source={{ uri: block.content as string }} 
                  style={styles.image} 
                  resizeMode="cover"
                />
                {block.metadata?.alt && (
                    <Text style={styles.imageCaption}>{block.metadata.alt}</Text>
                )}
              </View>
            );

          case 'tips':
          case 'real_world_example':
          case 'common_mistake':
            const config = getBoxConfig(block.type);
            return (
              <View key={index} style={[styles.boxContainer, { backgroundColor: config.bg, borderColor: config.borderColor }]}>
                <View style={styles.boxHeader}>
                  <Ionicons name={config.icon as any} size={20} color={config.color} />
                  <Text style={[styles.boxTitle, { color: config.color }]}>{config.title}</Text>
                </View>
                <Text style={styles.boxText}>{block.content}</Text>
              </View>
            );
            
          default:
            return null;
        }
      })}
    </View>
  );
};

const getBoxConfig = (type: BlockType) => {
  switch (type) {
    case 'tips':
      return {
        icon: 'bulb-outline',
        title: 'Pro Tip',
        color: colors.success,
        bg: 'rgba(95, 203, 15, 0.1)',
        borderColor: colors.success
      };
    case 'common_mistake':
      return {
        icon: 'warning-outline',
        title: 'Common Mistake',
        color: colors.error,
        bg: 'rgba(239, 68, 68, 0.1)',
        borderColor: colors.error
      };
    case 'real_world_example':
    default:
      return {
        icon: 'briefcase-outline',
        title: 'Real World Example',
        color: colors.info,
        bg: 'rgba(59, 130, 246, 0.1)',
        borderColor: colors.info
      };
  }
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    marginTop: 8,
    fontFamily: 'Inter_700Bold',
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    marginTop: 24,
    fontFamily: 'Inter_700Bold',
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
    fontFamily: 'Inter_700Bold',
  },
  h4: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'Inter_700Bold',
  },
  h5: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  h6: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paragraphContainer: {
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  blockquote: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
    paddingLeft: 16,
  },
  blockquoteBar: {
    width: 4,
    backgroundColor: colors.text.tertiary,
    borderRadius: 2,
    marginRight: 12,
  },
  blockquoteText: {
    flex: 1,
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text.tertiary,
    lineHeight: 24,
  },
  listContainer: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 10,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    color: colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  imageContainer: {
    marginVertical: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
  },
  imageCaption: {
    marginTop: 8,
    fontSize: 14,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  boxContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    marginTop: 8,
  },
  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  boxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boxText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.primary,
    fontFamily: 'Inter_400Regular',
  },
});
