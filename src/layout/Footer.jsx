import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-dark text-light mt-auto">
      {/* Main Footer */}
      <div className="py-5" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <Container>
          <Row className="g-4">
            {/* Brand Section */}
            <Col md={4} lg={3}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                variants={fadeInUp}
              >
                <h4 className="fw-bold mb-3" style={{ 
                  color: '#d4af37',
                  fontFamily: 'Playfair Display, serif'
                }}>
                  Aurora Palace
                </h4>
                <p className="text-white-50 mb-4">
                  Khách sạn sang trọng với dịch vụ đẳng cấp quốc tế, mang đến trải nghiệm nghỉ dưỡng tuyệt vời nhất cho quý khách.
                </p>
                <div className="d-flex gap-3">
                  <motion.a
                    href="#"
                    className="text-white-50"
                    style={{ fontSize: '1.5rem' }}
                    whileHover={{ scale: 1.2, color: '#d4af37' }}
                    transition={{ duration: 0.2 }}
                  >
                    📘
                  </motion.a>
                  <motion.a
                    href="#"
                    className="text-white-50"
                    style={{ fontSize: '1.5rem' }}
                    whileHover={{ scale: 1.2, color: '#d4af37' }}
                    transition={{ duration: 0.2 }}
                  >
                    📸
                  </motion.a>
                  <motion.a
                    href="#"
                    className="text-white-50"
                    style={{ fontSize: '1.5rem' }}
                    whileHover={{ scale: 1.2, color: '#d4af37' }}
                    transition={{ duration: 0.2 }}
                  >
                    🐦
                  </motion.a>
                  <motion.a
                    href="#"
                    className="text-white-50"
                    style={{ fontSize: '1.5rem' }}
                    whileHover={{ scale: 1.2, color: '#d4af37' }}
                    transition={{ duration: 0.2 }}
                  >
                    📱
                  </motion.a>
                </div>
              </motion.div>
            </Col>

            {/* Quick Links */}
            <Col md={4} lg={2}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                variants={fadeInUp}
              >
                <h6 className="mb-3 fw-semibold" style={{ color: '#d4af37' }}>
                  Liên kết nhanh
                </h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/" className="text-white-50 text-decoration-none d-flex align-items-center gap-2">
                      <span>→</span> Trang chủ
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/search" className="text-white-50 text-decoration-none d-flex align-items-center gap-2">
                      <span>→</span> Phòng nghỉ
                    </Link>
                  </li>
                  <li className="mb-2">
                    <a href="#amenities" className="text-white-50 text-decoration-none d-flex align-items-center gap-2">
                      <span>→</span> Tiện nghi
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#about" className="text-white-50 text-decoration-none d-flex align-items-center gap-2">
                      <span>→</span> Giới thiệu
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#contact" className="text-white-50 text-decoration-none d-flex align-items-center gap-2">
                      <span>→</span> Liên hệ
                    </a>
                  </li>
                </ul>
              </motion.div>
            </Col>

            {/* Contact Info */}
            <Col md={4} lg={3}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                variants={fadeInUp}
              >
                <h6 className="mb-3 fw-semibold" style={{ color: '#d4af37' }}>
                  Liên hệ
                </h6>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-start gap-3">
                    <span className="fs-5">📍</span>
                    <span className="text-white-50">
                      123 Đường ABC, Quận 1<br />
                      TP.HCM, Việt Nam
                    </span>
                  </li>
                  <li className="mb-3 d-flex align-items-center gap-3">
                    <span className="fs-5">📞</span>
                    <span className="text-white-50">
                      <a href="tel:+84123456789" className="text-white-50 text-decoration-none">
                        +84 123 456 789
                      </a>
                    </span>
                  </li>
                  <li className="mb-3 d-flex align-items-center gap-3">
                    <span className="fs-5">✉️</span>
                    <span className="text-white-50">
                      <a href="mailto:info@luxestay.com" className="text-white-50 text-decoration-none">
                        info@luxestay.com
                      </a>
                    </span>
                  </li>
                  <li className="d-flex align-items-center gap-3">
                    <span className="fs-5">🌐</span>
                    <span className="text-white-50">
                      <a href="https://luxestay.com" className="text-white-50 text-decoration-none">
                        www.luxestay.com
                      </a>
                    </span>
                  </li>
                </ul>
              </motion.div>
            </Col>

            {/* Services */}
            <Col md={12} lg={4}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                variants={fadeInUp}
              >
                <h6 className="mb-3 fw-semibold" style={{ color: '#d4af37' }}>
                  Dịch vụ đặc biệt
                </h6>
                <Row className="g-2">
                  <Col xs={6} sm={6} md={6}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span>💆</span>
                      <span className="text-white-50 small">Spa & Wellness</span>
                    </div>
                  </Col>
                  <Col xs={6} sm={6} md={6}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span>🎉</span>
                      <span className="text-white-50 small">Tổ chức sự kiện</span>
                    </div>
                  </Col>
                  <Col xs={6} sm={6} md={6}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span>🚗</span>
                      <span className="text-white-50 small">Đưa đón sân bay</span>
                    </div>
                  </Col>
                </Row>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-top border-secondary py-3">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <p className="mb-0 text-white-50 small">
                © {currentYear} Aurora Palace Hotel. Tất cả quyền được bảo lưu.
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="d-flex gap-4 justify-content-md-end">
                <a href="#" className="text-white-50 text-decoration-none small">
                  Chính sách bảo mật
                </a>
                <a href="#" className="text-white-50 text-decoration-none small">
                  Điều khoản sử dụng
                </a>
                <a href="#" className="text-white-50 text-decoration-none small">
                  Hỗ trợ 24/7
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}