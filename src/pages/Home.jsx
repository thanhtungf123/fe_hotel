import React, { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import AmenityCard from '../components/home/AmenityCard'
import RoomCard from '../components/home/RoomCard'
import RoomCarousel from '../components/home/RoomCarousel'
import HeroSearch from '../components/home/HeroSearch'
import Testimonials from '../components/home/Testimonials'
import axios from 'axios'

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
  
  useEffect(()=>{
    // Load recommended rooms (personalized if logged in, otherwise auto)
    const accountId = localStorage.getItem('accountId') // Get from auth context if available
    const recommendParams = accountId 
      ? `?accountId=${accountId}&type=auto&limit=5`
      : '?type=auto&limit=5'
    
    axios.get(`${API_BASE}/rooms/recommend${recommendParams}`)
      .then(r => setRecommendedRooms(r.data || []))
      .catch(e => {
        console.error('Failed to load recommended rooms:', e)
        // Fallback to regular rooms list
        axios.get(`${API_BASE}/rooms`)
          .then(r => setRecommendedRooms((r.data || []).slice(0, 5)))
          .catch(err => setError(err.message))
      })

    // Load popular rooms for grid display
    axios.get(`${API_BASE}/rooms`)
      .then(r => setPopularRooms((r.data || []).slice(0, 3)))
      .catch(e => setError(e.message))
  }, [])

  return (
    <main>
      <HeroSearch />

      {/* Carousel gợi ý phòng */}
      {recommendedRooms.length > 0 && (
        <RoomCarousel 
          rooms={recommendedRooms} 
          title="Phòng gợi ý dành cho bạn" 
        />
      )}

      <Container className="py-5">
        <section id="amenities" className="py-4">
          <h2 className="fw-bold mb-4">Tiện nghi đẳng cấp</h2>
          <Row className="g-4">
            {amenities.map((a, i)=> (
              <Col md={6} lg={4} key={i}><AmenityCard {...a} /></Col>
            ))}
          </Row>
        </section>

        <section id="rooms" className="py-4">
          <h2 className="fw-bold mb-4">Phòng nghỉ sang trọng</h2>
          {error && <div className="alert alert-warning">{error}</div>}
          <Row className="g-4">
            {popularRooms.map(room => (
              <Col md={6} lg={4} key={room.id}><RoomCard room={room} /></Col>
            ))}
          </Row>
        </section>

        <Testimonials />
      </Container>
    </main>
  )
}
