import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Image from 'react-bootstrap/Image';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import axios from '../api/axiosInstance';
import NotificationBell from '../components/common/NotificationBell';

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  // === Đăng xuất ===
  const onLogout = async () => {
    try {
      if (user?.token) await axios.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    nav('/login', { replace: true });
  };

  // === Role và Avatar ===
  const roleLower = String(user?.role || '').toLowerCase();
  const isStaff = ['staff', 'admin'].includes(roleLower);

  const avatarUrl = user?.avatarUrl 
    ? user.avatarUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&size=40&background=d4af37&color=fff&bold=true`;

  // Debug: Check if user is logged in
  const isLoggedIn = !!user?.token;

  return (
    <Navbar expand="lg" className="bg-body-tertiary py-3 sticky-top shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 'bold', color: '#d4af37' }}>
          Aurora Palace
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/search">Phòng</Nav.Link>
            <Nav.Link href="#amenities">Tiện nghi</Nav.Link>
            <Nav.Link href="#about">Giới thiệu</Nav.Link>
            <Nav.Link href="#contact">Liên hệ</Nav.Link>
          </Nav>

          {isLoggedIn && (
            <div className="me-3 d-flex align-items-center" style={{ minWidth: '40px', minHeight: '40px' }}>
              <NotificationBell />
            </div>
          )}

          {user?.token ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="border rounded-pill px-2 d-flex align-items-center gap-2"
              >
                <Image src={avatarUrl} alt="avatar" roundedCircle width={28} height={28} />
                <span className="d-none d-sm-inline">
                  {user?.fullName || 'Tài khoản'}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Header>Xin chào, {user?.fullName || 'bạn'}</Dropdown.Header>

                {/* Link tài khoản khách */}
                <Dropdown.Item as={Link} to="/account/bookings">
                  Lịch sử đặt phòng
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/account/profile">
                  Thông tin cá nhân
                </Dropdown.Item>

                {/* Khu quản trị (Staff/Admin) */}
                {isStaff && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/admin">
                      Trang quản trị
                    </Dropdown.Item>
                  </>
                )}

                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout}>Đăng xuất</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Button as={Link} to="/login" variant="outline-dark">
                Đăng nhập
              </Button>
              <Button as={Link} to="/register" variant="dark">
                Đăng ký
              </Button>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
