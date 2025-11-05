import React, { useEffect, useMemo, useState } from 'react'
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap'
import axios from '../../api/axiosInstance'

function fmt(d) { return d.toISOString().slice(0,10) }

export default function Statistics() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 6*24*60*60*1000)
  const [from, setFrom] = useState(fmt(weekAgo))
  const [to, setTo] = useState(fmt(now))
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [report, setReport] = useState(null)

  const load = async () => {
    setLoading(true); setErr('')
    try {
      const { data } = await axios.get('/admin/reports/overview', { params: { from, to, groupBy: 'day' } })
      setReport(data)
    } catch (e) {
      setErr(e?.response?.data?.message || e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const kpi = useMemo(() => {
    if (!report) return { revenue: 0, bookings: 0, occ: 0, cancel: 0 }
    return {
      revenue: report.summary?.totalRevenue ?? 0,
      bookings: report.summary?.totalBookings ?? 0,
      occ: report.summary?.occupancyRate ?? 0,
      cancel: report.summary?.cancellationRate ?? 0,
    }
  }, [report])

  return (
    <main className="container py-4">
      <h2 className="mb-3">Thống kê nhanh</h2>

      <Card className="mb-3"><Card.Body>
        <Row className="g-2 align-items-end">
          <Col md={3}>
            <Form.Label>Từ ngày</Form.Label>
            <Form.Control type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Label>Đến ngày</Form.Label>
            <Form.Control type="date" value={to} onChange={e=>setTo(e.target.value)} />
          </Col>
          <Col md={3}>
            <Button className="w-100" onClick={load} disabled={loading}>
              {loading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </Col>
        </Row>
        {err && <div className="alert alert-danger mt-3">{err}</div>}
      </Card.Body></Card>

      {loading && <div className="d-flex align-items-center gap-2"><Spinner size="sm"/> Đang tải...</div>}

      <Row className="g-3">
        <Col md={3}><Card><Card.Body>
          <div className="text-muted small">Doanh thu (khoảng)</div>
          <div className="fs-4 fw-bold">{Number(kpi.revenue).toLocaleString()} đ</div>
        </Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body>
          <div className="text-muted small">Số booking</div>
          <div className="fs-4 fw-bold">{kpi.bookings}</div>
        </Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body>
          <div className="text-muted small">Công suất TB</div>
          <div className="fs-4 fw-bold">{kpi.occ.toFixed(1)}%</div>
        </Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body>
          <div className="text-muted small">Tỉ lệ huỷ</div>
          <div className="fs-4 fw-bold">{kpi.cancel.toFixed(1)}%</div>
        </Card.Body></Card></Col>
      </Row>
    </main>
  )
}



