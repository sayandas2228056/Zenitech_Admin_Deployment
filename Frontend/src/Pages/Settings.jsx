import React, { useEffect, useState } from 'react'

const Settings = () => {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [to, setTo] = useState('')
  const [sending, setSending] = useState(false)

  const api = import.meta.env.VITE_ADMIN_API

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${api}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setInfo(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const sendTestEmail = async (e) => {
    e.preventDefault()
    try {
      setSending(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${api}/api/settings/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ to }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.message || 'Failed to send test email')
      }
      alert('✅ Test email sent successfully')
      setTo('')
    } catch (e) {
      alert(`❌ ${e.message}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-600">
            <svg
              className="mr-2 h-5 w-5 animate-spin text-orange-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Loading settings...
          </div>
        ) : error ? (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Environment Info */}
            <div className="rounded-xl bg-white p-5 shadow-md">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Environment
              </h2>
              <div className="text-sm text-gray-700">
                SMTP Configured:{' '}
                <span
                  className={`font-medium ${
                    info?.env?.hasEmailCreds ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {info?.env?.hasEmailCreds ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="mt-2 text-sm font-medium text-gray-800">
                Frontend URLs:
              </div>
              <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                {(info?.env?.frontendUrls || []).map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>

            {/* Test Email */}
            <div className="rounded-xl bg-white p-5 shadow-md">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Send Test Email
              </h2>
              <form
                onSubmit={sendTestEmail}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  placeholder="Recipient email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-md transition-colors ${
                    sending
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30'
                  }`}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
