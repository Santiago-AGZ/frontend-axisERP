import { useEffect, useRef, useState, useCallback } from 'react'

const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel']

interface UseIdleTimerOptions {
  timeoutMinutes: number
  warningMinutes: number
  onTimeout: () => void
}

export function useIdleTimer({ timeoutMinutes, warningMinutes, onTimeout }: UseIdleTimerOptions) {
  const [showWarning, setShowWarning] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const warningGivenRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  const resetTimer = useCallback(() => {
    clearTimers()
    setShowWarning(false)
    warningGivenRef.current = false

    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000

    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      warningGivenRef.current = true

      let secondsLeft = warningMinutes * 60
      setRemaining(secondsLeft)

      countdownRef.current = setInterval(() => {
        secondsLeft -= 1
        setRemaining(secondsLeft)
        if (secondsLeft <= 0) {
          clearTimers()
          onTimeout()
        }
      }, 1000)
    }, warningMs)
  }, [timeoutMinutes, warningMinutes, onTimeout, clearTimers])

  useEffect(() => {
    resetTimer()

    const handler = () => {
      if (!warningGivenRef.current) {
        resetTimer()
      }
    }

    EVENTS.forEach((event) => document.addEventListener(event, handler, { passive: true }))
    return () => {
      clearTimers()
      EVENTS.forEach((event) => document.removeEventListener(event, handler))
    }
  }, [resetTimer, clearTimers])

  const stayActive = useCallback(() => {
    setShowWarning(false)
    resetTimer()
  }, [resetTimer])

  return { showWarning, remaining, stayActive }
}
