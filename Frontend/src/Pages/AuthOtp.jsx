import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import Logo from '../assets/Logo.jpg'
import { useAuth } from '../context/AuthContext'

const DIGITS = 6

const AuthOtp = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const emailFromState = location?.state?.email || ''

  const [otp, setOtp] = useState(Array(DIGITS).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef(Array(DIGITS).fill(null))

  const isComplete = useMemo(() => otp.every((d) => d !== ''), [otp])

  useEffect(() => {
    // focus first input on mount
    inputsRef.current?.[0]?.focus?.()
  }, [])

  const handleChange = (idx, val) => {
    const v = val.replace(/\D/g, '') // keep digits only
    if (!v) {
      const next = [...otp]
      next[idx] = ''
      setOtp(next)
      return
    }
    const next = [...otp]
    next[idx] = v.charAt(0)
    setOtp(next)
    setError('')
    if (idx < DIGITS - 1) {
      inputsRef.current[idx + 1]?.focus?.()
    }
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (otp[idx] === '' && idx > 0) {
        inputsRef.current[idx - 1]?.focus?.()
      }
      const next = [...otp]
      next[idx] = ''
      setOtp(next)
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus?.()
    if (e.key === 'ArrowRight' && idx < DIGITS - 1) inputsRef.current[idx + 1]?.focus?.()
  }

  const handlePaste = (e) => {
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '')
    if (!text) return
    const next = Array(DIGITS)
      .fill('')
      .map((_, i) => text[i] || '')
    setOtp(next)
    // focus last filled input
    const lastIdx = Math.min(text.length, DIGITS) - 1
    if (lastIdx >= 0) inputsRef.current[lastIdx]?.focus?.()
  }

  const maskedEmail = useMemo(() => {
    if (!emailFromState) return ''
    const [user, domain] = emailFromState.split('@')
    if (!user || !domain) return emailFromState
    const maskedUser = user.length > 2 ? `${user[0]}***${user.slice(-1)}` : `${user[0]}*`
    return `${maskedUser}@${domain}`
  }, [emailFromState])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isComplete) {
      setError('Please enter the 6-digit OTP sent to your email.')
      return
    }
    setLoading(true)
    const code = otp.join('')
    const adminApi = import.meta.env.VITE_ADMIN_API;
    fetch(`${adminApi}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailFromState, code }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.message || 'Invalid or expired OTP')
        }
        return data
      })
      .then((data) => {
        const { token, user } = data
        login(user, token)
        setLoading(false)
        navigate('/dashboard')
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message || 'OTP verification failed')
      })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-indigo-100 via-pink-50 to-orange-100">
      {/* Decorative Blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />

      {/* Main Card */}
      <div className="w-full max-w-md z-10">
        <motion.div
          className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/40 p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            >
              <img
                src={Logo}
                alt="Zenitech Solutions Logo"
                className="h-16 w-16 rounded-full object-cover shadow-md border border-slate-200"
              />
              <h2 className="inline-flex items-baseline gap-2 whitespace-nowrap text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                <span className="text-orange-500">Zenitech</span>
                <span className="text-indigo-600">Solutions</span>
              </h2>
            </motion.div>
            <h1 className="mt-5 text-2xl md:text-3xl font-semibold text-slate-900">
              Verify OTP
            </h1>
            <motion.p
              className="mt-2 text-slate-600 text-sm md:text-base"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
            >
              {maskedEmail ? (
                <>
                  Enter the 6-digit code sent to <span className="font-medium text-indigo-600">{maskedEmail}</span>
                </>
              ) : (
                'Enter the 6-digit code sent to your email.'
              )}
            </motion.p>
            <div className="mx-auto mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-indigo-500 to-rose-400"></div>
          </div>

          {/* OTP Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
          >
            <div className="flex justify-between gap-2">
              {Array.from({ length: DIGITS }).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={otp[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className={`w-12 h-12 md:w-14 md:h-14 text-center rounded-xl border bg-white/90 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 ${
                    error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'
                  }`}
                />
              ))}
            </div>
            {error && <p className="-mt-2 ml-1 text-sm text-red-600">{error}</p>}

            <motion.button
              type="submit"
              disabled={loading || !isComplete}
              whileHover={{ scale: !loading && isComplete ? 1.02 : 1 }}
              whileTap={{ scale: !loading && isComplete ? 0.98 : 1 }}
              className={`group relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-medium text-white shadow-md transition-all ${
                loading || !isComplete
                  ? 'bg-indigo-400/70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/30'
              }`}
            >
              <span className="text-base">Verify & Continue</span>
              <ShieldCheck className="h-5 w-5" />
              <span className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-white/30 transition"></span>
            </motion.button>
          </motion.form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">Secure access via OTP verification</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-600"></span>
              <span className="text-xs font-medium text-green-700">Encrypted Connection</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthOtp