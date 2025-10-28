// Enhanced Amenity Card with Beautiful Gradients
import React from 'react'
import { Card } from 'react-bootstrap'
import { motion } from 'framer-motion'

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
]

export default function AmenityCard({ icon, title, desc, index = 0 }) {
  const gradient = gradients[index % gradients.length]

  return (
    <motion.div
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="h-100 amenity-card shadow-soft border-0"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
            background: gradient,
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <motion.div
            className="display-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: index * 0.1
            }}
          >
            {icon}
          </motion.div>
        </div>
        
        <Card.Body className="text-center p-4">
          <Card.Title 
            className="mb-2 fw-bold" 
            style={{ 
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.25rem'
            }}
          >
            {title}
          </Card.Title>
          <Card.Text className="text-muted small">{desc}</Card.Text>
        </Card.Body>
      </Card>
    </motion.div>
  )
}
