import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'

// ─── Requirement definitions ────────────────────────────────────────────────
const REQUIREMENTS = [
  { id: 'minLen',    label: 'Minimum 8 characters',      test: (p) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',     label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number (0–9)',           test: (p) => /\d/.test(p) },
  { id: 'special',   label: 'One special character',      test: (p) => /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(p) },
]

/**
 * Derives strength level from the number of passing requirements.
 * 0-2 → weak | 3-4 → medium | 5 → strong
 */
function getStrength(passedCount) {
  if (passedCount <= 2) return 'weak'
  if (passedCount <= 4) return 'medium'
  return 'strong'
}

const STRENGTH_META = {
  weak:   { label: 'Weak Password',   color: '#ef4444', barColor: '#ef4444', emoji: '🔴', bars: 1 },
  medium: { label: 'Medium Password', color: '#f59e0b', barColor: '#f59e0b', emoji: '🟡', bars: 2 },
  strong: { label: 'Strong Password', color: '#22c55e', barColor: '#22c55e', emoji: '🟢', bars: 3 },
}

// ─── Component ───────────────────────────────────────────────────────────────
/**
 * @param {{ password: string }} props
 */
function PasswordStrengthMeter({ password }) {
  const results = useMemo(
    () => REQUIREMENTS.map((req) => ({ ...req, passed: req.test(password) })),
    [password]
  )

  const passedCount = results.filter((r) => r.passed).length
  const strength = getStrength(passedCount)
  const meta = STRENGTH_META[strength]

  // Don't render anything when the field is empty
  if (!password) return null

  return (
    <AnimatePresence>
      <motion.div
        key="strength-meter"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="overflow-hidden"
        aria-live="polite"
        aria-label="Password strength indicator"
      >
        <div className="mt-3 p-3 rounded-xl bg-white/40 dark:bg-gray-700/40 border border-white/30 dark:border-gray-600/30 backdrop-blur-sm">

          {/* ── Strength bar ── */}
          <div className="flex gap-1.5 mb-2.5">
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden"
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{
                    width: meta.bars >= bar ? '100%' : '0%',
                    backgroundColor: meta.barColor,
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>

          {/* ── Strength label ── */}
          <motion.p
            key={strength}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-semibold mb-2"
            style={{ color: meta.color }}
          >
            {meta.emoji} {meta.label}
          </motion.p>

          {/* ── Requirement checklist ── */}
          <ul className="flex flex-col gap-1" role="list">
            {results.map((req) => (
              <motion.li
                key={req.id}
                layout
                className="flex items-center gap-1.5 text-xs"
              >
                <motion.span
                  animate={{
                    backgroundColor: req.passed ? '#22c55e' : '#ef4444',
                    scale: req.passed ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                >
                  {req.passed
                    ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    : <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  }
                </motion.span>
                <span
                  className="transition-colors duration-200"
                  style={{ color: req.passed ? '#16a34a' : '#6b7280' }}
                >
                  {req.label}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export { REQUIREMENTS, getStrength }
export default PasswordStrengthMeter
