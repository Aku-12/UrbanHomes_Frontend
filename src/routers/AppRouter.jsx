import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ChangePassword, ForgotPassword, LandingPage, Login, Register } from '../pages'

function AppRouter() {
  return (
   <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              borderRadius: '8px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/change-password" element={<ChangePassword />} />
         
          <Route path="/rooms" element={<div className="p-8">Rooms - Coming Soon</div>} />
          <Route path="/contact" element={<div className="p-8">Contact - Coming Soon</div>} />
          <Route path="/about" element={<div className="p-8">About Us - Coming Soon</div>} />
          <Route path="/dashboard" element={<div className="p-8">Dashboard - Coming Soon</div>} />
        </Routes>
   </BrowserRouter>
  )
}

export default AppRouter
