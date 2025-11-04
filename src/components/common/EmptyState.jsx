// Beautiful Empty State Components
import React from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const emptyStates = {
  noRooms: {
    emoji: '🏨',
    title: 'Không tìm thấy phòng phù hợp',
    description: 'Hãy thử thay đổi bộ lọc hoặc tìm kiếm với tiêu chí khác',
    action: 'Xóa bộ lọc',
  },
  noBookings: {
    emoji: '📅',
    title: 'Chưa có đặt phòng nào',
    description: 'Bắt đầu khám phá và đặt phòng đầu tiên của bạn',
    action: 'Khám phá phòng',
    link: '/search',
  },
  noResults: {
    emoji: '🔍',
    title: 'Không có kết quả',
    description: 'Chúng tôi không tìm thấy kết quả nào phù hợp với tìm kiếm của bạn',
    action: 'Quay lại trang chủ',
    link: '/',
  },
  notFound: {
    emoji: '😕',
    title: 'Không tìm thấy nội dung',
    description: 'Nội dung bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại',
    action: 'Quay lại trang chủ',
    link: '/',
  },
  maintenance: {
    emoji: '🔧',
    title: 'Đang bảo trì',
    description: 'Tính năng này đang được cập nhật. Vui lòng quay lại sau',
    action: 'Quay lại',
  },
}

export default function EmptyState({ 
  type = 'noResults', 
  onAction,
  customEmoji,
  customTitle,
  customDescription,
  customActionText,
  customActionLink
}) {
  const state = emptyStates[type] || emptyStates.noResults
  
  const emoji = customEmoji || state.emoji
  const title = customTitle || state.title
  const description = customDescription || state.description
  const actionText = customActionText || state.action
  const actionLink = customActionLink || state.link

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-5"
      style={{
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ fontSize: '6rem', marginBottom: '1.5rem' }}
      >
        {emoji}
      </motion.div>
      
      <h3 
        className="mb-3"
        style={{
          fontFamily: 'Playfair Display, serif',
          color: 'var(--gray-700)'
        }}
      >
        {title}
      </h3>
      
      <p className="text-muted mb-4" style={{ maxWidth: '500px' }}>
        {description}
      </p>
      
      {(onAction || actionLink) && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLink ? (
            <Button
              as={Link}
              to={actionLink}
              variant="primary"
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 2rem'
              }}
            >
              {actionText}
            </Button>
          ) : (
            <Button
              onClick={onAction}
              variant="primary"
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 2rem'
              }}
            >
              {actionText}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Error State Component
export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  message,
  onRetry,
  showRetry = true
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-5"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: '5rem', marginBottom: '1.5rem' }}
      >
        ⚠️
      </motion.div>
      
      <h4 className="mb-3" style={{ color: 'var(--accent-burgundy)' }}>
        {title}
      </h4>
      
      {message && (
        <p className="text-muted mb-4">{message}</p>
      )}
      
      {showRetry && onRetry && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onRetry}
            variant="outline-danger"
            style={{ borderRadius: '12px', padding: '0.5rem 1.5rem' }}
          >
            🔄 Thử lại
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}


