import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Heart, Users, Briefcase, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface UsageSelectionModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function UsageSelectionModal({ visible, onComplete }: UsageSelectionModalProps) {
  const { isDark, setUsageMode } = useTheme();
  const [selectedMode, setSelectedMode] = useState<'personal' | 'social' | 'professional' | null>(null);

  const theme = {
    text: '#f0f0f0',
    background: isDark ? '#0B0909' : '#003C24',
    primary: isDark ? '#8C8C8C' : '#f0f0f0',
    secondary: isDark ? '#4A5568' : '#012d1c',
    accent: isDark ? '#44444C' : '#002818',
    cardBackground: isDark ? '#1A1A1A' : '#002818',
    border: isDark ? '#333333' : '#012d1c',
    isDark,
  };

  const usageOptions = [
    {
      key: 'personal' as const,
      title: 'Personal',
      subtitle: 'Built for your real ones — family, close friends, and the ones who matter most. Because thoughtful isn\'t accidental.',
      icon: Heart,
      color: '#EC4899',
      label: 'People'
    },
    {
      key: 'social' as const,
      title: 'Social',
      subtitle: 'Call it what you want — a lineup, a rotation, a vibe. For the socially active who like to keep their options in play.',
      icon: Users,
      color: '#3B82F6',
      label: 'Roster'
    },
    {
      key: 'professional' as const,
      title: 'Professional',
      subtitle: 'Made for the movers and shakers — colleagues, clients, and industry contacts. Keep it sharp, organized, and always a step ahead.',
      icon: Briefcase,
      color: '#059669',
      label: 'Network'
    }
  ];

  const handleContinue = async () => {
    if (selectedMode) {
      await setUsageMode(selectedMode);
      onComplete();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.modal, { backgroundColor: theme.cardBackground }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <View style={styles.headerContent}>
                <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
                  <Users size={24} color="#FFFFFF" />
                </View>
                <View style={styles.headerText}>
                  <Text style={[styles.title, { color: theme.text }]}>Choose Your Style</Text>
                  <Text style={[styles.subtitle, { color: theme.primary }]}>How do you want to use ARMi?</Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Welcome Message */}
              <View style={styles.section}>
                <Text style={[styles.welcomeText, { color: theme.text }]}>
                  Let's personalize your experience. Choose the style that best fits how you want to manage your relationships.
                </Text>
              </View>

              {/* Usage Options */}
              <View style={styles.optionsContainer}>
                {usageOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedMode === option.key;
                  
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.usageOption,
                        { 
                          backgroundColor: theme.accent,
                          borderColor: isSelected ? option.color : theme.border,
                          borderWidth: isSelected ? 2 : 1
                        }
                      ]}
                      onPress={() => setSelectedMode(option.key)}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionLeft}>
                          <View style={[styles.optionIconContainer, { backgroundColor: option.color }]}>
                            <IconComponent size={20} color="#FFFFFF" />
                          </View>
                          <View style={styles.optionText}>
                            <View style={styles.titleRow}>
                              <Text style={[styles.optionTitle, { color: theme.text }]}>
                                {option.title}
                              </Text>
                              <View style={[styles.labelBadge, { backgroundColor: theme.cardBackground }]}>
                                <Text style={[styles.labelText, { color: theme.text }]}>
                                  "{option.label}"
                                </Text>
                              </View>
                            </View>
                            <Text style={[styles.optionSubtitle, { color: theme.primary }]}>
                              {option.subtitle}
                            </Text>
                          </View>
                        </View>
                        
                        {isSelected && (
                          <View style={[styles.checkContainer, { backgroundColor: option.color }]}>
                            <ArrowRight size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Info Box */}
              <View style={[styles.infoBox, { backgroundColor: theme.accent, borderColor: theme.border }]}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>Don't worry!</Text>
                <Text style={[styles.infoText, { color: theme.primary }]}>
                  You can always change this later in Settings → Usage if you want to try a different style.
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { backgroundColor: selectedMode ? theme.secondary : theme.accent },
                  !selectedMode && styles.buttonDisabled
                ]}
                onPress={handleContinue}
                disabled={!selectedMode}
              >
                <Text style={[
                  styles.continueButtonText,
                  { color: selectedMode ? '#FFFFFF' : theme.primary }
                ]}>
                  {selectedMode ? 'Continue' : 'Select a style to continue'}
                </Text>
                {selectedMode && (
                  <ArrowRight size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  usageOption: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  optionText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});