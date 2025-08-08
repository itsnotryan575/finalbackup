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
  const [isDevNoteStatusLoading, setIsDevNoteStatusLoading] = useState(true);
  const [showUsageSelection, setShowUsageSelection] = useState(false);
  const [isUsageSelectionLoading, setIsUsageSelectionLoading] = useState(true);

  console.log('🔍 DEBUG: Index component state:', {
    userEmail: user?.email,
    emailConfirmed: user?.email_confirmed_at,
    loading,
    showDevNote,
    showUsageSelection,
    isDevNoteStatusLoading,
    isUsageSelectionLoading
  });

  console.log('Index - User:', user?.email, 'Confirmed:', user?.email_confirmed_at, 'Loading:', loading);

  const theme = {
    text: '#f0f0f0',
    background: isDark ? '#0B0909' : '#003C24',
    primary: isDark ? '#8C8C8C' : '#f0f0f0',
  };

  // Check dev note status every time user authentication status changes
  useEffect(() => {
    if (user?.email_confirmed_at) {
      console.log('🔍 DEBUG: User is authenticated and confirmed, checking dev note status');
      checkDevNoteStatus();
    } else {
      // User is not confirmed, don't show dev note and clear loading state
      console.log('🔍 DEBUG: User not confirmed, clearing modal states');
      setShowDevNote(false);
      setIsDevNoteStatusLoading(false);
      setShowUsageSelection(false);
      setIsUsageSelectionLoading(false);
    }
  }, [user?.email_confirmed_at]);

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
      } else {
        console.log('🔍 DEBUG: User already selected usage mode, not showing selection');
        setShowUsageSelection(false);
      }
      console.log('🔍 DEBUG: Usage selection check completed');
    } catch (error) {
      console.error('Error checking usage selection status:', error);
      console.log('🔍 DEBUG: Error in checkUsageSelectionStatus, resetting state');
      setShowUsageSelection(false);
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
    }
  };

  const handleUsageSelectionComplete = async () => {
    console.log('🔍 DEBUG: Usage selection completed');
    try {
      await AsyncStorage.setItem('usage_mode_selected', 'true');
      setShowUsageSelection(false);
      console.log('🔍 DEBUG: Usage selection preference saved');
    } catch (error) {
      console.error('Error saving usage selection preference:', error);
      console.log('🔍 DEBUG: Error in handleUsageSelectionComplete, resetting state');
      setShowUsageSelection(false);
    }
  };
  
  if (loading || isDevNoteStatusLoading || isUsageSelectionLoading) {
    console.log('🔍 DEBUG: Still loading, showing loading screen');
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading ARMi...
        </Text>
      </View>
    );
  }

  if (user && user.email_confirmed_at) {
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
    
    console.log('🔍 DEBUG: All onboarding modals handled, redirecting to main app');
    // All onboarding modals have been handled, redirect to main app
    return <Redirect href="/(tabs)" />;
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