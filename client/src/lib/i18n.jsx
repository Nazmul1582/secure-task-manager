/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'

const LANGUAGE_KEY = 'secureTaskManager.language'

export const languages = {
  bn: 'বাংলা',
  en: 'English',
}

const translations = {
  en: {
    account: 'Account',
    accountSecurity: 'Account and security preferences.',
    addTaskWorkspace: 'Add a task to your workspace.',
    alreadyRegistered: 'Already registered?',
    cancel: 'Cancel',
    changePassword: 'Change password',
    createAccount: 'Create account',
    createTask: 'Create task',
    currentPassword: 'Current password',
    dashboard: 'Dashboard',
    darkMode: 'Dark Mode',
    deleteAccount: 'Delete account',
    deleteAccountQuestion: 'Delete account?',
    deleteAccountWarning: 'This will delete your account and you will not be able to sign in again.',
    deleteMyAccount: 'Delete My Account',
    email: 'E-mail',
    kanban: 'Kanban',
    language: 'Language',
    logout: 'Logout',
    name: 'Name',
    newHere: 'New here?',
    newPassword: 'New password',
    notification: 'Notification',
    overview: 'Overview of tasks, deadlines, and productivity.',
    password: 'Password',
    profile: 'Profile',
    saveProfile: 'Save profile',
    saveTask: 'Save task',
    settings: 'Settings',
    signIn: 'Sign in',
    startWorkspace: 'Start with a member workspace.',
    system: 'System',
    tasks: 'Tasks',
    updateTaskDetails: 'Update task details',
    username: 'Username',
    useAccount: 'Use your secureTaskManager account.',
  },
  bn: {
    account: 'অ্যাকাউন্ট',
    accountSecurity: 'অ্যাকাউন্ট ও নিরাপত্তা পছন্দসমূহ।',
    addTaskWorkspace: 'আপনার ওয়ার্কস্পেসে একটি টাস্ক যোগ করুন।',
    alreadyRegistered: 'আগেই নিবন্ধন করেছেন?',
    cancel: 'বাতিল',
    changePassword: 'পাসওয়ার্ড পরিবর্তন',
    createAccount: 'অ্যাকাউন্ট তৈরি করুন',
    createTask: 'টাস্ক তৈরি করুন',
    currentPassword: 'বর্তমান পাসওয়ার্ড',
    dashboard: 'ড্যাশবোর্ড',
    darkMode: 'ডার্ক মোড',
    deleteAccount: 'অ্যাকাউন্ট ডিলিট করুন',
    deleteAccountQuestion: 'অ্যাকাউন্ট ডিলিট করবেন?',
    deleteAccountWarning: 'এতে আপনার অ্যাকাউন্ট ডিলিট হবে এবং আপনি আর সাইন ইন করতে পারবেন না।',
    deleteMyAccount: 'আমার অ্যাকাউন্ট ডিলিট করুন',
    email: 'ই-মেইল',
    kanban: 'কানবান',
    language: 'ভাষা',
    logout: 'লগআউট',
    name: 'নাম',
    newHere: 'নতুন?',
    newPassword: 'নতুন পাসওয়ার্ড',
    notification: 'নোটিফিকেশন',
    overview: 'টাস্ক, ডেডলাইন এবং কাজের অগ্রগতির সারাংশ।',
    password: 'পাসওয়ার্ড',
    profile: 'প্রোফাইল',
    saveProfile: 'প্রোফাইল সংরক্ষণ',
    saveTask: 'টাস্ক সংরক্ষণ',
    settings: 'সেটিংস',
    signIn: 'সাইন ইন',
    startWorkspace: 'মেম্বার ওয়ার্কস্পেস দিয়ে শুরু করুন।',
    system: 'সিস্টেম',
    tasks: 'টাস্কসমূহ',
    updateTaskDetails: 'টাস্কের বিস্তারিত আপডেট করুন',
    username: 'ইউজারনেম',
    useAccount: 'আপনার secureTaskManager অ্যাকাউন্ট ব্যবহার করুন।',
  },
}

const I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || key,
})

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(LANGUAGE_KEY) || 'en')

  const value = useMemo(
    () => ({
      language,
      setLanguage(nextLanguage) {
        const safeLanguage = translations[nextLanguage] ? nextLanguage : 'en'
        localStorage.setItem(LANGUAGE_KEY, safeLanguage)
        setLanguageState(safeLanguage)
      },
      t(key) {
        return translations[language]?.[key] || translations.en[key] || key
      },
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
