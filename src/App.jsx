import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TopNavbar from './layout/TopNavbar'
import Footer from './layout/Footer'
import Home from './pages/Home'
import Search from './pages/Search'
import RoomDetail from './pages/RoomDetail'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// --- User Account Pages ---
import BookingHistory from './pages/account/BookingHistory'
import Profile from './pages/account/Profile'
import ChangePassword from './pages/account/ChangePassword'

// --- Admin Pages ---
import Admin from './pages/Admin'
import ShowCreateAccount from './pages/admin/ShowCreateAccount'
import ShowEditAccount from './pages/admin/ShowEditAccount'
import CancelRequests from './pages/admin/CancelRequests'

// --- Booking ---
import Booking from './pages/Booking'

export default function App(){
  return (
    <div>
      <TopNavbar />
      <Routes>
        {/* General */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />

        {/* Booking */}
        <Route path="/booking/:id" element={<Booking />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Account */}
        <Route path="/account/bookings" element={<BookingHistory />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/account/password" element={<ChangePassword />} />

        {/* Admin Management */}
        <Route path="/admin" element={<Admin />} /> 
        <Route path="/admin/account/create" element={<ShowCreateAccount />} />
        <Route path="/admin/accounts/:id" element={<ShowEditAccount />} />
        <Route path="/admin/cancel-requests" element={<CancelRequests />} />
      </Routes>
      <Footer />
    </div>
  )
}
