import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { DevNoteModal } from '@/components/DevNoteModal';
import { UsageSelectionModal } from '@/components/UsageSelectionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const [showDevNote, setShowDevNote] = useState(false);
  const [isDevNoteStatusLoading, setIsDevNoteStatusLoading] = useState(false);
  const [showUsageSelection, setShowUsageSelection] = useState(false);
  const [isUsageSelectionLoading, setIsUsageSelectionLoading] = useState(false);
  const [onboardingFlowInitialized, setOnboardingFlowInitialized] = useState(false);
  const [onboardingFlowComplete, setOnboardingFlowComplete] = useState(false);

  console.log('🔍 DEBUG: Index component state:', {
    userEmail: user?.email,
    emailConfirmed: user?.email_confirmed_at,
    loading,
    showDevNote,
    showUsageSelection,
    isDevNoteStatusLoading,
    isUsageSelectionLoading,
    onboardingFlowInitialized,
    onboardingFlowComplete
  });

  console.log('Index - User:', user?.email, 'Confirmed:', user?.email_confirmed_at, 'Loading:', loading);

  const theme = {
    text: '#f0f0f0',
    background: isDark ? '#0B0909' : '#003C24',
    primary: isDark ? '#8C8C8C' : '#f0f0f0',
  };

  // Initialize onboarding flow when user is confirmed
  useEffect(() => {
    if (user?.email_confirmed_at && !onboardingFlowInitialized) {
      console.log('🔍 DEBUG: User is authenticated and confirmed, initializing onboarding flow');
      setOnboardingFlowInitialized(true);
      setOnboardingFlowComplete(false);
      initializeOnboardingFlow();
    } else {
      // User is not confirmed, reset all onboarding states
      console.log('🔍 DEBUG: User not confirmed, resetting onboarding states');
      setShowDevNote(false);
      setShowUsageSelection(false);
      setOnboardingFlowInitialized(false);
      setOnboardingFlowComplete(false);
      setIsDevNoteStatusLoading(false);
      setIsUsageSelectionLoading(false);
    }
  }, [user?.email_confirmed_at, onboardingFlowInitialized]);

  const initializeOnboardingFlow = async () => {
    console.log('🔍 DEBUG: Starting onboarding flow initialization');
    try {
      await checkDevNoteStatus();
    } catch (error) {
      console.error('🔍 DEBUG: Error in onboarding flow initialization:', error);
      // If there's an error, complete the onboarding flow to prevent getting stuck
      setOnboardingFlowComplete(true);
    }
  };

  const checkDevNoteStatus = async () => {
    try {
      setIsDevNoteStatusLoading(true);
      console.log('🔍 DEBUG: Checking dev note status...');
      const dontShowDevNote = await AsyncStorage.getItem('do_not_show_dev_note_again');
      console.log('🔍 DEBUG: AsyncStorage value for do_not_show_dev_note_again:', dontShowDevNote);
      if (dontShowDevNote !== 'true') {
        console.log('🔍 DEBUG: Should show dev note, setting showDevNote to true');
        setShowDevNote(true);
        setShowUsageSelection(false); // Don't show usage selection yet
        setOnboardingFlowComplete(false); // Onboarding not complete yet
      } else {
        console.log('🔍 DEBUG: User opted out, not showing dev note');
        setShowDevNote(false);
        // Check usage selection status since dev note is skipped
        await checkUsageSelectionStatus();
      }
      console.log('🔍 DEBUG: Dev note check completed');
    } catch (error) {
      console.error('Error checking dev note status:', error);
      console.log('🔍 DEBUG: Error in checkDevNoteStatus, resetting states');
      setShowDevNote(false);
      setShowUsageSelection(false);
      setOnboardingFlowComplete(true); // Complete flow on error to prevent getting stuck
    } finally {
      setIsDevNoteStatusLoading(false);
    }
  };

  const checkUsageSelectionStatus = async () => {
    try {
      setIsUsageSelectionLoading(true);
      console.log('🔍 DEBUG: Checking usage selection status...');
      const usageModeSelected = await AsyncStorage.getItem('usage_mode_selected');
      console.log('🔍 DEBUG: AsyncStorage value for usage_mode_selected:', usageModeSelected);
      if (usageModeSelected !== 'true') {
        console.log('🔍 DEBUG: Should show usage selection, setting showUsageSelection to true');
        setShowUsageSelection(true);
        setOnboardingFlowComplete(false); // Onboarding not complete yet
      } else {
        console.log('🔍 DEBUG: User already selected usage mode, not showing selection');
        setShowUsageSelection(false);
        setOnboardingFlowComplete(true); // All onboarding steps complete
      }
      console.log('🔍 DEBUG: Usage selection check completed');
    } catch (error) {
      console.error('Error checking usage selection status:', error);
      console.log('🔍 DEBUG: Error in checkUsageSelectionStatus, resetting state');
      setShowUsageSelection(false);
      setOnboardingFlowComplete(true); // Complete flow on error to prevent getting stuck
    } finally {
      setIsUsageSelectionLoading(false);
    }
  };

  const handleDevNoteClose = async (dontShowAgain: boolean) => {
    console.log('🔍 DEBUG: Dev note closing, dontShowAgain:', dontShowAgain);
    try {
      if (dontShowAgain) {
        console.log('🔍 DEBUG: Setting do_not_show_dev_note_again to true');
        await AsyncStorage.setItem('do_not_show_dev_note_again', 'true');
      }
      setShowDevNote(false);
      // After dev note closes, check if we need to show usage selection
      console.log('🔍 DEBUG: Dev note closed, checking usage selection status...');
      await checkUsageSelectionStatus();
      console.log('🔍 DEBUG: Dev note closed');
    } catch (error) {
      console.error('Error saving dev note preference:', error);
      console.log('🔍 DEBUG: Error in handleDevNoteClose, resetting states');
      setShowDevNote(false);
      setShowUsageSelection(false);
      setOnboardingFlowComplete(true); // Complete flow on error
    }
  };

  const handleUsageSelectionComplete = async () => {
    console.log('🔍 DEBUG: Usage selection completed');
    try {
      await AsyncStorage.setItem('usage_mode_selected', 'true');
      setShowUsageSelection(false);
      setOnboardingFlowComplete(true); // Mark onboarding as complete
      console.log('🔍 DEBUG: Usage selection preference saved');
    } catch (error) {
      console.error('Error saving usage selection preference:', error);
      console.log('🔍 DEBUG: Error in handleUsageSelectionComplete, resetting state');
      setShowUsageSelection(false);
      setOnboardingFlowComplete(true); // Complete flow on error
    }
  };
  
  // Show loading screen while auth is loading OR onboarding flow is not initialized OR still checking modal statuses
  if (loading || !onboardingFlowInitialized || isDevNoteStatusLoading || isUsageSelectionLoading) {
    console.log('🔍 DEBUG: Still loading, showing loading screen', {
      authLoading: loading,
      onboardingFlowInitialized,
      isDevNoteStatusLoading,
      isUsageSelectionLoading
    });
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading ARMi...
        </Text>
      </View>
    );
  }

  if (user && user.email_confirmed_at && onboardingFlowInitialized) {
    // If dev note should be shown, show the modal
    if (showDevNote) {
      console.log('🔍 DEBUG: Showing dev note modal');
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <DevNoteModal
            visible={showDevNote}
            onClose={handleDevNoteClose}
          />
        </View>
      );
    }
    
    // If usage selection should be shown, show the modal
    if (showUsageSelection) {
      console.log('🔍 DEBUG: Showing usage selection modal');
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <UsageSelectionModal
            visible={showUsageSelection}
            onComplete={handleUsageSelectionComplete}
          />
        </View>
      );
    }
    
    // Only redirect to main app if onboarding flow is complete
    if (onboardingFlowComplete) {
      console.log('🔍 DEBUG: All onboarding modals handled, redirecting to main app');
      return <Redirect href="/(tabs)" />;
    } else {
      console.log('🔍 DEBUG: Onboarding flow not complete, waiting...');
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Preparing your experience...
          </Text>
        </View>
      );
    }
  }

  if (user && !user.email_confirmed_at) {
    return <Redirect href="/auth/verify-email" />;
  }

  return <Redirect href="/auth/sign-in" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
});