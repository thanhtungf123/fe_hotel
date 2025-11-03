import React, { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { motion } from 'framer-motion'
import AmenityCard from '../components/home/AmenityCard'
import RoomCard from '../components/home/RoomCard'
import RoomCarousel from '../components/home/RoomCarousel'
import HeroSearch from '../components/home/HeroSearch'
import Testimonials from '../components/home/Testimonials'
import { GridSkeleton } from '../components/common/LoadingSkeleton'
import axios from 'axios'
import showToast from '../utils/toast'

const amenities = [
  { title: 'WiFi miễn phí', desc: 'Internet tốc độ cao toàn bộ khách sạn', icon: '📶' },
  { title: 'Bãi đỗ xe', desc: 'Rộng rãi và an toàn', icon: '🚗' },
  { title: 'Nhà hàng 5 sao', desc: 'Ẩm thực đẳng cấp', icon: '🍽️' },
  { title: 'Hồ bơi', desc: 'Ngoài trời, view đẹp', icon: '🏊' },
  { title: 'Phòng gym', desc: 'Thiết bị hiện đại 24/7', icon: '🏋️' },
  { title: 'Dịch vụ phòng', desc: '24/7, thực đơn đa dạng', icon: '☕' },
]

export default function Home(){
  const [recommendedRooms, setRecommendedRooms] = useState([])
  const [popularRooms, setPopularRooms] = useState([])
  const [error, setError] = useState(null)
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'
  
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    // Load recommended rooms (personalized if logged in, otherwise auto)
    const accountId = localStorage.getItem('accountId') // Get from auth context if available
    const recommendParams = accountId 
      ? `?accountId=${accountId}&type=auto&limit=5`
      : '?type=auto&limit=5'
    
    axios.get(`${API_BASE}/rooms/recommend${recommendParams}`)
      .then(r => {
        const data = Array.isArray(r.data)
          ? r.data
          : (Array.isArray(r.data?.data) ? r.data.data : [])
        setRecommendedRooms(data)
      })
      .catch(e => {
        console.error('Failed to load recommended rooms:', e)
        // Fallback to regular rooms list
        axios.get(`${API_BASE}/rooms`)
          .then(r => setRecommendedRooms((r.data || []).slice(0, 5)))
          .catch(err => {
            setError(err.message)
            showToast.error('Không thể tải phòng gợi ý')
          })
      })

    // Load popular rooms for grid display
    axios.get(`${API_BASE}/rooms`)
      .then(r => {
        const data = Array.isArray(r.data)
          ? r.data
          : (Array.isArray(r.data?.data) ? r.data.data : [])
        setPopularRooms(data.slice(0, 3))
      })
      .catch(e => {
        setError(e.message)
        showToast.error('Không thể tải phòng phổ biến')
      })
      .finally(() => setLoading(false))
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <main>
      <HeroSearch />

      {/* Carousel gợi ý phòng */}
      {recommendedRooms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <RoomCarousel 
            rooms={recommendedRooms} 
            title="Phòng gợi ý dành cho bạn" 
          />
        </motion.div>
      )}

      <Container className="py-5">
        {/* Amenities Section */}
        <motion.section
          id="amenities"
          className="py-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h2
            className="fw-bold mb-4 text-center"
            variants={itemVariants}
          >
            <span className="gradient-text">Tiện nghi đẳng cấp</span>
          </motion.h2>
          <Row className="g-4">
            {amenities.map((a, i)=> (
              <Col md={6} lg={4} key={i}>
                <motion.div variants={itemVariants}>
                  <AmenityCard {...a} index={i} />
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.section>

        {/* Rooms Section */}
        <motion.section
          id="rooms"
          className="py-4 mt-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h2
            className="fw-bold mb-4 text-center"
            variants={itemVariants}
          >
            <span className="gradient-text">Phòng nghỉ sang trọng</span>
          </motion.h2>
          
          {loading && <GridSkeleton cols={3} rows={1} />}
          
          {!loading && error && (
            <motion.div
              className="alert alert-warning text-center"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}
          
          {!loading && !error && Array.isArray(popularRooms) && (
            <Row className="g-4">
              {popularRooms.map((room, idx) => (
                <Col md={6} lg={4} key={room.id}>
                  <motion.div
                    variants={itemVariants}
                    custom={idx}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RoomCard room={room} />
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </motion.section>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Testimonials />
        </motion.div>
      </Container>
    </main>
  )
}
