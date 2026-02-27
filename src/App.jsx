import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './styles/toastify-custom.css'
import TopNavbar from './layout/TopNavbar'
import Footer from './layout/Footer'
import Chatbot from './components/chatbot/Chatbot'
import Home from './pages/Home'
import Search from './pages/Search'
import RoomDetail from './pages/RoomDetail'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// --- User Account Pages ---
import BookingHistory from './pages/account/BookingHistory'
import Profile from './pages/account/Profile'

// --- Admin Pages ---
import Admin from './pages/Admin'
import ShowCreateAccount from './pages/admin/ShowCreateAccount'
import ShowEditAccount from './pages/admin/ShowEditAccount'
import CancelRequests from './pages/admin/CancelRequests'
import ShowCreateEmployee from './pages/admin/ShowCreateEmployee'
import ShowEditEmployee from './pages/admin/ShowEditEmployee'
import Employee from './pages/Employee'
import ShowCreateAccountEmployee from './pages/employee/ShowCreateAccount'
import ShowAccountHistory from './pages/admin/ShowAccountHistory'
import ShowCreateServices from './pages/admin/ShowCreateServices'
import AdminSchedule from "./pages/admin/AdminSchedule";
import AdminCreateSchedule from './pages/admin/AdminCreateSchedule'
import AdminEditSchedule from './pages/admin/AdminEditSchedule'
import Reports from './pages/admin/Reports'
import Statistics from './pages/admin/Statistics'
// --- Booking ---
import Booking from './pages/Booking'

// --- Payment ---
import PaymentSuccess from './pages/payment/PaymentSuccess'
import PaymentCancel from './pages/payment/PaymentCancel'
import PaymentHistory from './pages/payment/PaymentHistory'

export default function App() {
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
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
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User Account */}
        <Route path="/account/bookings" element={<BookingHistory />} />
        <Route path="/account/profile" element={<Profile />} />

        {/* Admin Management */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/account/create" element={<ShowCreateAccount />} />
        <Route path="/admin/accounts/:id" element={<ShowEditAccount />} />
        <Route path="/admin/cancel-requests" element={<CancelRequests />} />
        <Route path="/admin/employee/create" element={<ShowCreateEmployee />} />
        <Route path="/admin/employees/:id" element={<ShowEditEmployee />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/employee/account/create" element={<ShowCreateAccountEmployee />} />
        <Route path="/admin/accountHistory/:id" element={<ShowAccountHistory />} />
        <Route path="/admin/service/create" element={<ShowCreateServices />} />
        <Route path="/admin/schedules" element={<AdminSchedule />} />
        <Route path="/admin/schedules/create" element={<AdminCreateSchedule />} />
        <Route path="/admin/schedules/:shiftId" element={<AdminEditSchedule />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/statistics" element={<Statistics />} />


        {/* Payment */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/payment/history" element={<PaymentHistory />} />
      </Routes>
      <Footer />
      <Chatbot />
    </div>
  )
}
