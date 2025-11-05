// src/pages/Search.jsx - Enhanced
import React, { useEffect, useMemo, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { motion } from 'framer-motion'
import axios from 'axios'
import SortBar from '../components/search/SortBar'
import FilterSidebar from '../components/search/FilterSidebar.jsx'
import RoomCardRow from '../components/search/RoomCardRow'
import RoomCard from '../components/home/RoomCard'
import { ListSkeleton, GridSkeleton } from '../components/common/LoadingSkeleton'
import EmptyState, { ErrorState } from '../components/common/EmptyState'
import showToast from '../utils/toast'
import { calculateDiscount } from '../utils/discount'
import '../styles/search.css'

export default function Search(){
  // Dùng URL tuyệt đối ở dev để tránh rủi ro proxy
  const API =
    (import.meta.env.MODE === 'development'
      ? (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api')
      : '/api'
    ).replace(/\/$/, '') // bỏ "/" cuối nếu có

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [raw, setRaw] = useState([])

  const [view, setView] = useState('list')
  const [sort, setSort] = useState('priceAsc')
  const [filters, setFilters] = useState({
    priceMax: 10000000, priceMin: 1000, amenities: [], status: [], 
    adults: 2, children: 0, checkin:'', checkout:''
  })

  useEffect(()=>{
    setLoading(true)
    
    // Nếu user chọn ngày check-in và check-out => gọi API availability
    // Nếu không => gọi API search thông thường
    const hasDateFilter = filters.checkin && filters.checkout
    const endpoint = hasDateFilter ? '/rooms/availability' : '/rooms/search'
    
    const totalGuests = (filters.adults || 2) + (filters.children || 0)
    const params = new URLSearchParams({
      priceMax: String(filters.priceMax ?? ''),
      priceMin: String(filters.priceMin ?? ''),
      guests: String(totalGuests),
      sort,
      page: '0',
      size: '50'
    })
    
    // Nếu có date filter => dùng API availability
    if (hasDateFilter) {
      params.set('checkIn', filters.checkin)
      params.set('checkOut', filters.checkout)
    } else {
      // API search thì có thêm amenities, status
      params.set('amenities', (filters.amenities || []).join(','))
      params.set('status', (filters.status || []).join(','))
    }

    const url = `${API}${endpoint}?${params.toString()}`
    axios.get(url, { headers: { Accept: 'application/json' } })
      .then(r => {
        console.log('🔎 GET', r.request?.responseURL || url, r.data)
        const ctype = r.headers?.['content-type'] || ''
        if (!ctype.includes('json')) {
          throw new Error('Nhận về non-JSON (có thể là index.html). Kiểm tra URL/proxy.')
        }
        const items = Array.isArray(r.data) ? r.data : (r.data?.items ?? [])
        console.log('📦 Rooms data:', items.length, 'rooms found')
        if (items.length > 0) {
          console.log('📷 First room imageUrl:', items[0]?.imageUrl)
        }
        setRaw(items)
        if (items.length === 0) {
          showToast.info('Không tìm thấy phòng phù hợp với tiêu chí tìm kiếm')
        }
      })
      .catch(e => {
        console.error('Search error:', e)
        setError(e.message)
        setRaw([])
        showToast.error('Không thể tải danh sách phòng. Vui lòng thử lại!')
      })
      .finally(() => setLoading(false))
  }, [API, filters, sort])

  const rooms = useMemo(()=> {
    let sorted = raw ?? [];
    
    // Apply sorting based on sort key
    if (sort === 'priceAsc') {
      sorted.sort((a, b) => (a.priceVnd || 0) - (b.priceVnd || 0));
    } else if (sort === 'priceDesc') {
      sorted.sort((a, b) => (b.priceVnd || 0) - (a.priceVnd || 0));
    } else if (sort === 'ratingDesc') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'discountDesc') {
      // Sort by discount in descending order
      sorted.sort((a, b) => {
        const discountA = calculateDiscount(a.priceVnd || 0);
        const discountB = calculateDiscount(b.priceVnd || 0);
        return discountB - discountA;
      });
    }
    
    return sorted;
  }, [raw, sort])
  const clearFilters = ()=> setFilters({ priceMax: 10000000, priceMin: 1000, amenities: [], status: [], adults: 2, children: 0, checkin:'', checkout:'' })

  return (
    <motion.div
      className="py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="search-wrap">
        <Row className="g-4">
          <Col lg={4} xl={3}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FilterSidebar filters={filters} onChange={setFilters} onClear={clearFilters}/>
            </motion.div>
          </Col>
          
          <Col lg={8} xl={9}>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SortBar 
                view={view} 
                onView={setView} 
                sort={sort} 
                onSort={setSort}
                resultsCount={rooms.length}
              />
              
              {/* Loading State */}
              {loading && view === 'list' && <ListSkeleton count={5} />}
              {loading && view === 'grid' && <GridSkeleton cols={3} rows={2} />}
              
              {/* Error State */}
              {!loading && error && (
                <ErrorState 
                  message={error}
                  onRetry={() => window.location.reload()}
                />
              )}
              
              {/* Empty State */}
              {!loading && !error && rooms.length === 0 && (
                <EmptyState
                  type="noRooms"
                  onAction={clearFilters}
                />
              )}
              
              {/* Results - List View */}
              {!loading && !error && rooms.length > 0 && view === 'list' && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {rooms.map((r, idx) => (
                    <motion.div
                      key={r.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <RoomCardRow room={r} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {/* Results - Grid View */}
              {!loading && !error && rooms.length > 0 && view === 'grid' && (
                <Row xs={1} md={2} xl={3} className="g-4">
                  {rooms.map((r, idx) => (
                    <Col key={r.id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <RoomCard room={r} />
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              )}
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  )
}
