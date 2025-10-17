import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TopNavbar from './layout/TopNavbar'
import Footer from './layout/Footer'
import Home from './pages/Home'
import Search from './pages/Search'
import RoomDetail from './pages/RoomDetail'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Admin from './pages/Admin';
import ShowCreateAccount from './pages/admin/ShowCreateAccount'
import ShowEditAccount from './pages/admin/ShowEditAccount'

// +++ NEW
import Booking from './pages/Booking'

export default function App(){
  return (
    <div>
      <TopNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        
        {/* User Account */}
        <Route path="/admin" element={<Admin />} /> 
        <Route path="/admin/account/create" element={<ShowCreateAccount />} />
        <Route path="/admin/accounts/:id" element={<ShowEditAccount />} />

        {/* Booking */}
        <Route path="/booking/:id" element={<Booking />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </div>
  )
}
