import { computed } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'

export const motionSpring = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
  mass: 0.8
} as const

export const motionEase = [0.22, 1, 0.36, 1] as const

export function useMotionPresets() {
  const reducedMotion = usePreferredReducedMotion()
  const shouldReduceMotion = computed(() => reducedMotion.value === 'reduce')

  const fadeIn = computed(() =>
    shouldReduceMotion.value
      ? {
          initial: { opacity: 1 },
          enter: { opacity: 1 }
        }
      : {
          initial: { opacity: 0, y: 8 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.22, ease: motionEase } }
        }
  )

  const softScale = computed(() =>
    shouldReduceMotion.value
      ? {
          initial: { opacity: 1, scale: 1 },
          enter: { opacity: 1, scale: 1 }
        }
      : {
          initial: { opacity: 0, scale: 0.98 },
          enter: { opacity: 1, scale: 1, transition: motionSpring }
        }
  )

  return {
    shouldReduceMotion,
    fadeIn,
    softScale
  }
}
