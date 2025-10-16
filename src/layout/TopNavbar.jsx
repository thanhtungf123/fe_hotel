import React from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Image from 'react-bootstrap/Image'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import axios from '../api/axiosInstance'

export default function TopNavbar(){
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => {
    try { if (user?.token) await axios.post('/auth/logout'); } catch {}
    logout(); nav('/login');
  };

  const avatarUrl = user?.avatarUrl || `https://i.pravatar.cc/40?u=${user?.accountId || 'guest'}`;

  return (
    <Navbar expand="lg" className="bg-body-tertiary py-3 sticky-top shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">LuxeStay</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/search">Phòng</Nav.Link>
            <Nav.Link href="#amenities">Tiện nghi</Nav.Link>
            <Nav.Link href="#about">Giới thiệu</Nav.Link>
            <Nav.Link href="#contact">Liên hệ</Nav.Link>
          </Nav>

          {user?.token ? (
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" className="border rounded-pill px-2 d-flex align-items-center gap-2">
                <Image src={avatarUrl} roundedCircle width={28} height={28} />
                <span className="d-none d-sm-inline">{user.fullName}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>Xin chào, {user.fullName}</Dropdown.Header>
                <Dropdown.Item as={Link} to="/account/bookings">🧾 Lịch sử đặt phòng</Dropdown.Item>
                <Dropdown.Item as={Link} to="/account/profile">👤 Thông tin cá nhân</Dropdown.Item>
                <Dropdown.Item as={Link} to="/account/password">🔒 Đổi mật khẩu</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout}>Đăng xuất</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Button as={Link} to="/login" variant="outline-dark">Đăng nhập</Button>
              <Button as={Link} to="/register" variant="dark">Đăng ký</Button>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
