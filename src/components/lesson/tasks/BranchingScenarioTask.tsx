import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors } from '../../../theme/colors';
import { BranchingScenarioTask as BranchingScenarioTaskType } from '../../../types/lesson';

interface Props {
  task: BranchingScenarioTaskType;
  onComplete: (isCorrect: boolean) => void;
  registerControls: (canSubmit: boolean, title: string, onSubmit: () => void) => void;
}

export const BranchingScenarioTask: React.FC<Props> = ({ task, onComplete, registerControls }) => {
  const [currentScenarioId, setCurrentScenarioId] = useState(task.startScenarioId);
  const [history, setHistory] = useState<string[]>([task.startScenarioId]);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  const scenarios = task.scenarios || {};
  const currentScenario = scenarios[currentScenarioId];

  const handleChoice = (nextId: string | 'win' | 'lose') => {
    if (nextId === 'win') {
      setResult('win');
      setIsFinished(true);
    } else if (nextId === 'lose') {
      setResult('lose');
      setIsFinished(true);
    } else {
      setCurrentScenarioId(nextId);
      setHistory([...history, nextId]);
    }
  };

  const handleFinish = () => {
    onComplete(result === 'win');
  };

  const handleRetry = () => {
    setCurrentScenarioId(task.startScenarioId);
    setHistory([task.startScenarioId]);
    setResult(null);
    setIsFinished(false);
  };

  // Register controls with parent
  useEffect(() => {
    if (isFinished) {
      if (result === 'win') {
        registerControls(true, "Continue", handleFinish);
      } else {
        registerControls(true, "Restart Scenario", handleRetry);
      }
    } else {
      // During scenario, hide the main button (user uses choices instead)
      registerControls(false, "", () => { });
    }
  }, [isFinished, result]);

  if (!currentScenario && !isFinished) {
    return <Text style={{ color: 'white' }}>Error: Scenario not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>{task.question}</Text>

      {isFinished ? (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, { color: result === 'win' ? colors.success : colors.error }]}>
            {result === 'win' ? "Success!" : "Try Again"}
          </Text>
          <Text style={styles.resultText}>
            {result === 'win'
              ? "You successfully navigated the scenario."
              : "That choice didn't work out."}
          </Text>
        </View>
      ) : (
        <>
          {currentScenario.backgroundImage && (
            <Image
              source={currentScenario.backgroundImage}
              style={styles.scenarioImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.scenarioCard}>
            <Text style={styles.scenarioText}>{currentScenario.text}</Text>

            <View style={styles.choicesContainer}>
              {currentScenario.choices.map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.choiceButton}
                  onPress={() => handleChoice(choice.nextId)}
                >
                  <Text style={styles.choiceText}>{choice.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.text.secondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  scenarioImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  scenarioCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scenarioText: {
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 32,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
  },
  choicesContainer: {
    gap: 16,
  },
  choiceButton: {
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
});
