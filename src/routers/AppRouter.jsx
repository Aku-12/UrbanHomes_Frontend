import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ChangePassword, ForgotPassword, LandingPage, Login, Register, RoomListingPage, RoomDetailsPage, WishlistPage, BookingPage, BookingConfirmation, ContactPage, AboutPage, ProfilePage, PaymentSuccess, PaymentFailure } from '../pages'
import { DashboardOverview, ManageRooms, BookingsManagement, UsersManagement, AddRoom, EditRoom } from '../pages/admin'
import { WishlistProvider } from '../context'

// Admin Route Protection Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRouter() {
  return (
   <BrowserRouter>
      <WishlistProvider>
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

          <Route path="/rooms" element={<RoomListingPage />} />
          <Route path="/rooms/:id" element={<RoomDetailsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/booking/confirmation" element={<BookingConfirmation />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><DashboardOverview /></AdminRoute>} />
          <Route path="/admin/rooms" element={<AdminRoute><ManageRooms /></AdminRoute>} />
          <Route path="/admin/rooms/add" element={<AdminRoute><AddRoom /></AdminRoute>} />
          <Route path="/admin/rooms/edit/:id" element={<AdminRoute><EditRoom /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><BookingsManagement /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersManagement /></AdminRoute>} />
        </Routes>
      </WishlistProvider>
   </BrowserRouter>
  )
}

export default AppRouter
