import React from 'react';
import { motion } from 'framer-motion';
import { Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import showToast from '../../utils/toast';

export default function NotificationDropdown({ 
  notifications, 
  loading, 
  onClose, 
  onNotificationRead,
  onRefresh 
}) {
  const navigate = useNavigate();
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      showToast.success('Đã đánh dấu tất cả là đã đọc');
      onNotificationRead();
    } catch (error) {
      showToast.error('Không thể đánh dấu đã đọc');
    }
  };
  
  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    
    // Navigate if has action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };
  
  const getNotificationIcon = (type) => {
    const icons = {
      BOOKING_SUCCESS: '',
      BOOKING_CONFIRMED: '',
      PAYMENT_REMINDER: '',
      CHECKIN_REMINDER: '',
      CHECKIN_OVERDUE: '',
      CHECKIN_SUCCESS: '',
      CHECKOUT_SUCCESS: '',
      CANCELLATION_APPROVED: '',
      CANCELLATION_REJECTED: '',
      REFUND_PROCESSING: '',
      REFUND_COMPLETED: ''
    };
    return icons[type] || '';
  };
  
  const getPriorityColor = (priority) => {
    const colors = {
      URGENT: '#dc3545',
      HIGH: '#fd7e14',
      NORMAL: '#0d6efd',
      LOW: '#6c757d'
    };
    return colors[priority] || colors.NORMAL;
  };
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };
  
  return (
    <motion.div
      className="notification-dropdown"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: '380px',
        maxHeight: '500px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        zIndex: 1050,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        className="notification-header"
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)'
        }}
      >
        <h6 className="mb-0 text-white fw-bold">
          <i className="bi bi-bell-fill me-2"></i>
          Thông báo
        </h6>
        <div className="d-flex gap-2">
          <Button
            variant="link"
            size="sm"
            className="text-white p-0"
            onClick={onRefresh}
            style={{ textDecoration: 'none' }}
          >
            <i className="bi bi-arrow-clockwise" style={{ fontSize: '1.1rem' }}></i>
          </Button>
          {notifications.some(n => !n.isRead) && (
            <Button
              variant="link"
              size="sm"
              className="text-white p-0"
              onClick={handleMarkAllAsRead}
              style={{ textDecoration: 'none', fontSize: '0.85rem' }}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div 
        className="notification-list"
        style={{
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      >
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" />
            <div className="mt-2 small text-muted">Đang tải...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-bell-slash" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
            <div className="mt-3 text-muted">Không có thông báo</div>
          </div>
        ) : (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
              whileHover={{ backgroundColor: '#f8f9fa' }}
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor: notification.isRead ? 'white' : '#f8f9ff',
                transition: 'background-color 0.2s ease',
                position: 'relative'
              }}
            >
              {/* Priority indicator */}
              {!notification.isRead && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: getPriorityColor(notification.priority)
                  }}
                />
              )}
              
              <div className="d-flex gap-3">
                <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div 
                      className="fw-semibold"
                      style={{ 
                        fontSize: '0.9rem',
                        color: '#212529'
                      }}
                    >
                      {notification.title}
                    </div>
                    {!notification.isRead && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#0d6efd',
                          flexShrink: 0,
                          marginLeft: '8px'
                        }}
                      />
                    )}
                  </div>
                  <div 
                    className="small text-muted"
                    style={{
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      marginBottom: '6px'
                    }}
                  >
                    {notification.message}
                  </div>
                  <div 
                    className="small"
                    style={{
                      fontSize: '0.75rem',
                      color: '#6c757d'
                    }}
                  >
                    <i className="bi bi-clock me-1"></i>
                    {formatTimeAgo(notification.createdAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {/* Footer */}
      {notifications.length > 0 && (
        <div 
          className="notification-footer"
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e9ecef',
            textAlign: 'center'
          }}
        >
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              navigate('/account/notifications');
              onClose();
            }}
            style={{
              textDecoration: 'none',
              color: '#C9A24A',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </motion.div>
  );
}

