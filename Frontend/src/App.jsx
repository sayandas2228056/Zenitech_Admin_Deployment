import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/Login'
import AuthOtp from './Pages/AuthOtp'
import Dashboard from './Pages/Dashboard'
import TicketDetails from './Pages/TicketDetails'
import Clients from './Pages/Clients'
import ClientDetails from './Pages/ClientDetails'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './Components/Navbar.jsx'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth-otp" element={<AuthOtp />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:email"
          element={
            <ProtectedRoute>
              <ClientDetails />
            </ProtectedRoute>
          }
        />
        {/* Catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </div>
  )
}

export default App