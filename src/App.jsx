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
import Employee from './pages/Employee';
import Account from './pages/Account';

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
        <Route path="/account" element={<Account />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/admin" element={<Admin />} /> 

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
