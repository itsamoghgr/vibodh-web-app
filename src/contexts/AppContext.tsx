'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface User {
  id: string
  email: string
}

export interface Profile {
  id: string
  email: string
  fullName: string | null
  role: string
  orgId: string
}

export interface Organization {
  id: string
  name: string
  created_at: string
  settings?: any
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  duration?: number
}

interface AppContextType {
  user: User
  profile: Profile
  organization: Organization
  notifications: Notification[]
  activeSection: string
  setActiveSection: (section: string) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
  user: User
  profile: Profile
  organization: Organization
}

export function AppProvider({ children, user, profile, organization }: AppProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeSection, setActiveSection] = useState('dashboard')

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    }
    setNotifications((prev) => [...prev, newNotification])

    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, notification.duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        organization,
        notifications,
        activeSection,
        setActiveSection,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
