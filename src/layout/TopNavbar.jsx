import React from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import axios from '../api/axiosInstance'

export default function TopNavbar(){
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => {
    const token = user?.token;
    try { 
      if (token) await axios.post('/auth/logout'); 
    } catch (_) { /* ignore */ }
    logout();
    nav('/login');
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary py-3 sticky-top shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">LuxeStay</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link href="#rooms">Phòng</Nav.Link>
            <Nav.Link href="#amenities">Tiện nghi</Nav.Link>
            <Nav.Link href="#about">Giới thiệu</Nav.Link>
            <Nav.Link href="#contact">Liên hệ</Nav.Link>
          </Nav>

          {user?.token ? (
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">Hi, {user.fullName}</span>
              <Button variant="outline-dark" onClick={onLogout}>Đăng xuất</Button>
              <Button variant="danger" as={Link} to="/search">Đặt phòng</Button>
              {user?.role === 'admin' && (
                <>
                  <Button as={Link} to="/admin" variant="primary">Admin</Button>
                  <Button as={Link} to="/employees" variant="secondary">Employee</Button>
                </>
              )}

              {user?.role === 'employee' && (
                <Button as={Link} to="/employee" variant="secondary">Employee</Button>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Button as={Link} to="/login" variant="outline-dark">Đăng nhập</Button>
              <Button as={Link} to="/register" variant="dark">Đăng ký</Button>
            </div>
          )}

          {/* {user?.role === 'admin' && (
            <Button as={Link} to="/admin" variant="primary" className="ms-2">Admin</Button>
          )} */}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
