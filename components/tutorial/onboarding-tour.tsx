'use client'

import { useEffect, useState, useCallback } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import './driver-theme.css'

const STORAGE_KEY = 'ai-support-bot-tour-completed'

interface OnboardingTourProps {
  runTour?: boolean
  onTourEnd?: () => void
}

export function OnboardingTour({ 
  runTour = false, 
  onTourEnd 
}: OnboardingTourProps) {
  const [tourCompleted, setTourCompleted] = useState(false)

  const startTutorial = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: '[data-tour="chat-button"]',
          popover: {
            title: 'AI Assistant',
            description: 'Click here to start chatting with our AI assistant! Ask questions about products, get recommendations, or get help with your order.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '[data-tour="dashboard-link"]',
          popover: {
            title: 'Your Dashboard',
            description: 'Visit your dashboard to track API usage, monitor system status, and view detailed analytics.',
            side: 'bottom',
            align: 'start'
          }
        }
      ],
      popoverClass: 'driver-theme-blue',
      onDestroyStarted: () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setTourCompleted(true)
        onTourEnd?.()
      },
      onDestroyed: () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setTourCompleted(true)
        onTourEnd?.()
      },
      onNextClick: (element, step, options) => {
        // If this is the last step, destroy the driver instead of moving to next
        if (options.state.activeIndex === (options.config.steps?.length ?? 0) - 1) {
          driverObj.destroy()
        } else {
          driverObj.moveNext()
        }
      },
      onCloseClick: () => {
        // Close button clicked - destroy the tour and mark as completed
        driverObj.destroy()
      }
    })

    driverObj.drive()
  }, [onTourEnd, setTourCompleted])

  useEffect(() => {
    // Check if user has completed the tour before
    const completed = localStorage.getItem(STORAGE_KEY) === 'true'
    setTourCompleted(completed)

    // Auto-start tour for first-time visitors
    if (!completed && !runTour) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        startTutorial()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [runTour, startTutorial])

  useEffect(() => {
    if (runTour && !tourCompleted) {
      startTutorial()
    }
  }, [runTour, tourCompleted, startTutorial])

  // Don't render anything - driver.js handles its own DOM
  return null
}

// Hook to manually trigger the tour
export function useTutorial() {
  const [runTour, setRunTour] = useState(false)

  const startTour = () => {
    setRunTour(true)
  }

  const resetTour = () => {
    localStorage.removeItem(STORAGE_KEY)
    setRunTour(true)
  }

  return {
    runTour,
    startTour,
    resetTour,
    setRunTour,
  }
}