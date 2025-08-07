import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationServiceClass {
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async scheduleReminderNotification(reminder: {
    id: number;
    title: string;
    description?: string;
    scheduledFor: string;
    profileName?: string;
  }) {
    try {
      if (!this.isInitialized) {
        const initialized = await this.init();
        if (!initialized) {
          throw new Error('Notifications not initialized');
        }
      }

      // Parse the scheduled date and ensure it's in the future
      const scheduledDate = new Date(reminder.scheduledFor);
      const now = new Date();

      console.log('Scheduling notification for:', scheduledDate.toLocaleString());
      console.log('Current time:', now.toLocaleString());
      console.log('Time difference (ms):', scheduledDate.getTime() - now.getTime());
      
      // Enhanced debugging
      console.log('🔍 DETAILED DEBUG - Scheduled Date ISO:', scheduledDate.toISOString());
      console.log('🔍 DETAILED DEBUG - Current Date ISO:', now.toISOString());
      console.log('🔍 DETAILED DEBUG - Time difference (ms):', scheduledDate.getTime() - now.getTime());
      console.log('🔍 DETAILED DEBUG - Time difference (minutes):', (scheduledDate.getTime() - now.getTime()) / (1000 * 60));
      
      if (scheduledDate <= now) {
        console.warn('Cannot schedule notification for past date:', scheduledDate);
        return null;
      }

      // Create notification content
      const notificationContent: Notifications.NotificationContentInput = {
        title: reminder.title,
        body: reminder.description || (reminder.profileName ? `Reminder about ${reminder.profileName}` : 'You have a reminder'),
        data: {
          reminderId: reminder.id,
          type: 'reminder',
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };
      
      console.log('🔍 DETAILED DEBUG - Notification Content:', JSON.stringify(notificationContent, null, 2));

      // Schedule the notification with proper trigger
      const triggerObject = {
        year: scheduledDate.getFullYear(),
        month: scheduledDate.getMonth(), // 0-indexed (0 = January, 11 = December)
        day: scheduledDate.getDate(),
        hour: scheduledDate.getHours(),
        minute: scheduledDate.getMinutes(),
        second: scheduledDate.getSeconds(),
        ...(Platform.OS === 'android' && { channelId: 'reminders' }),
      };
      
      console.log('🔍 DETAILED DEBUG - Trigger Object:', JSON.stringify(triggerObject, null, 2));
      console.log('🔍 DETAILED DEBUG - Trigger Date Components:', {
        year: triggerObject.year,
        month: triggerObject.month,
        day: triggerObject.day,
        hour: triggerObject.hour,
        minute: triggerObject.minute,
        second: triggerObject.second,
        platform: Platform.OS
      });
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: triggerObject,
      });

      console.log(`Scheduled notification ${notificationId} for reminder ${reminder.id} at ${scheduledDate.toLocaleString()}`);
      console.log('🔍 DETAILED DEBUG - Returned notification ID:', notificationId);
      
      // Verify the notification was scheduled correctly
      const scheduledNotifications = await this.getScheduledNotifications();
      console.log('🔍 DETAILED DEBUG - All scheduled notifications count:', scheduledNotifications.length);
      const ourNotification = scheduledNotifications.find(n => n.identifier === notificationId);
      if (ourNotification) {
        console.log('Notification verified in schedule:', ourNotification.trigger);
        console.log('🔍 DETAILED DEBUG - Our notification trigger details:', JSON.stringify(ourNotification.trigger, null, 2));
      } else {
        console.log('🔍 DETAILED DEBUG - Our notification NOT found in scheduled list!');
      }
      
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled notification ${notificationId}`);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Handle notification responses (when user taps on notification)
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Handle notifications received while app is in foreground
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

const NotificationService = new NotificationServiceClass();
export default NotificationService;