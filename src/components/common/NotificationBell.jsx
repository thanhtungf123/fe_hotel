import React, { useState, useEffect, useRef } from 'react';
import { Badge } from 'react-bootstrap';
import { AnimatePresence } from 'framer-motion';
import axios from '../../api/axiosInstance';
import NotificationDropdown from './NotificationDropdown';
import '../../styles/notification.css';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  
  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      // Check if user is logged in
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      if (!auth?.token) {
        setUnreadCount(0);
        return;
      }
      
      const { data } = await axios.get('/notifications/unread/count');
      setUnreadCount(data.count || 0);
    } catch (error) {
      // Silently fail - don't show error to user
      // Just set count to 0
      console.warn('Failed to fetch unread count:', error.response?.status, error.response?.data);
      setUnreadCount(0);
    }
  };
  
  // Fetch notifications
  const fetchNotifications = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Check if user is logged in
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      if (!auth?.token) {
        setNotifications([]);
        return;
      }
      
      const { data } = await axios.get('/notifications?page=0&size=10');
      setNotifications(data.items || []);
    } catch (error) {
      console.warn('Failed to fetch notifications:', error.response?.status, error.response?.data);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Load notifications when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      fetchNotifications();
    }
  }, [showDropdown]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleNotificationRead = () => {
    fetchUnreadCount();
    fetchNotifications();
  };
  
  // Always render the bell icon, even if API fails
  return (
    <div 
      className="notification-bell-container" 
      ref={dropdownRef} 
      style={{ 
        display: 'inline-block',
        position: 'relative',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <button
        type="button"
        className="notification-bell-button"
        onClick={toggleDropdown}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 12px',
          color: showDropdown ? '#C9A24A' : '#6c757d',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '44px',
          minHeight: '44px',
          borderRadius: '50%',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#C9A24A';
          e.currentTarget.style.backgroundColor = 'rgba(201, 162, 74, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = showDropdown ? '#C9A24A' : '#6c757d';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Thông báo"
        title="Thông báo"
      >
        {/* Bootstrap Icons bell */}
        <i 
          className={`bi ${showDropdown ? 'bi-bell-fill' : 'bi-bell'}`}
          style={{ 
            fontSize: '1.5rem',
            lineHeight: '1',
            display: 'inline-block',
            fontStyle: 'normal',
            fontVariant: 'normal',
            textTransform: 'none',
            speak: 'none'
          }}
        />
        
        {/* Badge for unread count */}
        {unreadCount > 0 && (
          <Badge 
            pill 
            bg="danger" 
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              fontSize: '0.7rem',
              padding: '0.2rem 0.5rem',
              minWidth: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>
      
      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <NotificationDropdown
            notifications={notifications}
            loading={loading}
            onClose={() => setShowDropdown(false)}
            onNotificationRead={handleNotificationRead}
            onRefresh={fetchNotifications}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

