// src/pages/Search.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import axios from 'axios'
import SortBar from '../components/search/SortBar'
import FilterSidebar from '../components/search/FilterSidebar'
import RoomCardRow from '../components/search/RoomCardRow'
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
    priceMax: 10000000, priceMin: 1000, types: [], amenities: [], status: [], guests: 1, checkin:'', checkout:''
  })

  useEffect(()=>{
    setLoading(true)
    
    // Nếu user chọn ngày check-in và check-out => gọi API availability
    // Nếu không => gọi API search thông thường
    const hasDateFilter = filters.checkin && filters.checkout
    const endpoint = hasDateFilter ? '/rooms/availability' : '/rooms/search'
    
    const params = new URLSearchParams({
      priceMax: String(filters.priceMax ?? ''),
      priceMin: String(filters.priceMin ?? ''),
      guests: String(filters.guests ?? ''),
      sort,
      page: '0',
      size: '50'
    })
    
    // Nếu có date filter => dùng API availability
    if (hasDateFilter) {
      params.set('checkIn', filters.checkin)
      params.set('checkOut', filters.checkout)
    } else {
      // API search thì có thêm types, amenities, status
      params.set('types', (filters.types || []).join(','))
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
        setRaw(items)
      })
      .catch(e => {
        console.error('Search error:', e)
        setError(e.message)
        setRaw([])
      })
      .finally(() => setLoading(false))
  }, [API, filters, sort])

  const rooms = useMemo(()=> raw ?? [], [raw])
  const clearFilters = ()=> setFilters({ priceMax: 10000000, priceMin: 1000, types: [], amenities: [], status: [], guests: 1, checkin:'', checkout:'' })

  return (
    <div className="py-4">
      <Container className="search-wrap">
        <Row className="g-4">
          <Col lg={4} xl={3}>
            <FilterSidebar filters={filters} onChange={setFilters} onClear={clearFilters}/>
          </Col>
          <Col lg={8} xl={9}>
            <SortBar view={view} onView={setView} sort={sort} onSort={setSort}/>
            {loading && <div className="alert alert-info">Đang tải dữ liệu…</div>}
            {error && <div className="alert alert-warning">Lỗi: {error}</div>}
            {!loading && !rooms.length && <div className="alert alert-secondary">Không tìm thấy phòng phù hợp.</div>}

            {view==='list' && rooms.map(r => <RoomCardRow key={r.id} room={r} />)}

            {view==='grid' &&
              <Row xs={1} md={2} xl={3} className="g-3">
                {rooms.map(r => <Col key={r.id}><RoomCardRow room={r}/></Col>)}
              </Row>
            }
          </Col>
        </Row>
      </Container>
    </div>
  )
}
