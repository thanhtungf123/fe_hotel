import React from 'react'
export default function Footer(){
    return (
      <footer className="bg-body-tertiary mt-5 pt-5 pb-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="mb-3">LuxeStay</h5>
              <p>Khách sạn sang trọng với dịch vụ đẳng cấp quốc tế, mang đến trải nghiệm nghỉ dưỡng tuyệt vời nhất.</p>
              <div className="d-flex gap-3 fs-4">
                <span>📘</span><span>📸</span><span>🐦</span>
              </div>
            </div>
            <div className="col-md-4">
              <h6 className="mb-3">Liên kết nhanh</h6>
              <ul className="list-unstyled">
                <li><a href="#">Trang chủ</a></li>
                <li><a href="#rooms">Phòng nghỉ</a></li>
                <li><a href="#amenities">Tiện nghi</a></li>
                <li><a href="#about">Giới thiệu</a></li>
                <li><a href="#contact">Liên hệ</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="mb-3">Liên hệ</h6>
              <ul className="list-unstyled">
                <li>📍 123 Đường ABC, Quận 1, TP.HCM, Việt Nam</li>
                <li>📞 +84 123 456 789</li>
                <li>✉️ info@luxestay.com</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-muted mt-4 small">© 2025 LuxeStay Hotel. Tất cả quyền được bảo lưu.</div>
        </div>
      </footer>
    )
  }
  //đây là footer
  