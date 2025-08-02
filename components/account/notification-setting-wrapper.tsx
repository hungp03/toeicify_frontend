'use client';

import { useState } from 'react';
import NotificationSettings from './notification-setting';

export default function NotificationSettingsWrapper() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    studyReminders: true,
    weeklyProgress: true,
    marketingEmails: false,
  });

  return (
    <NotificationSettings
      preferences={preferences}
      onChange={setPreferences}
    />
  );
}
