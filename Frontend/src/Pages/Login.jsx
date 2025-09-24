import React, { useState } from 'react'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../assets/Logo.jpg'

const Login = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = email.trim()
    const allowedEmails = new Set([
      'sayan@zenitech.in',
      'haider@zenitech.in',
      'info@zenitech.in',
      'rahaman@zenitech.in',
    ])
    const emailLc = trimmed.toLowerCase()
    const isAllowed = allowedEmails.has(emailLc)
    if (!isAllowed) {
      setError('This email is not authorized. Please use your assigned Zenitech email.')
      return
    }
    setError('')
    setLoading(true)
    const adminApi = import.meta.env.VITE_ADMIN_API;
    fetch(`${adminApi}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailLc }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || 'Failed to request OTP')
        }
      })
      .then(() => {
        setLoading(false)
        navigate('/auth-otp', { state: { email: emailLc } })
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message || 'Failed to request OTP')
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
              Welcome Back 👋
            </h1>
            <motion.p
              className="mt-2 text-slate-600 text-sm md:text-base"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
            >
              Sign in using your authorized Zenitech email to continue.
            </motion.p>
            <div className="mx-auto mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-indigo-500 to-rose-400"></div>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
          >
            <div>
              <label className="mb-2 ml-1 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative group">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your.name@zenitech.in"
                  className={`w-full rounded-xl border bg-white/90 backdrop-blur-sm pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 ${
                    error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'
                  }`}
                  required
                />
              </div>
              {error && <p className="mt-2 ml-1 text-sm text-red-600">{error}</p>}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3.5 font-medium text-white shadow-md transition-all ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-base">Processing...</span>
                </>
              ) : (
                <>
                  <span className="text-base">Continue</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
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

export default Login
