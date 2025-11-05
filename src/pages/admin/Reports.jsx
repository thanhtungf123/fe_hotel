import React, { useEffect, useMemo, useState } from 'react'
import axios from '../../api/axiosInstance'
import { Card, Row, Col, Form, Button, Table, Spinner } from 'react-bootstrap'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts'

export default function Reports() {
  const today = useMemo(() => new Date().toISOString().slice(0,10), [])
  const firstDay = useMemo(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0,10)
  }, [])

  const [filters, setFilters] = useState({ from: firstDay, to: today, groupBy: 'day' })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.get('/admin/reports/overview', { params: filters })
      setData(data)
    } catch (e) {
      setError(e?.response?.data?.message || e.message)
    } finally { setLoading(false) }
  }

  const exportCsv = async () => {
    try {
      const { data: blob, headers, status } = await axios.get('/admin/reports/export', {
        params: filters,
        responseType: 'blob',
      })
      if (status !== 200) throw new Error(`Export failed (${status})`)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = headers['content-disposition'] || ''
      const match = /filename="?([^";]+)"?/i.exec(disposition)
      const fallback = `report_${filters.groupBy}_${filters.from}_${filters.to}.csv`
      a.download = match?.[1] || fallback
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Export failed')
    }
  }

  useEffect(() => { load() // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  return (
    <main className="container py-4">
      <h2 className="mb-3">Báo cáo tổng hợp</h2>

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Form.Label>Từ ngày</Form.Label>
              <Form.Control type="date" name="from" value={filters.from} onChange={onChange} />
            </Col>
            <Col md={3}>
              <Form.Label>Đến ngày</Form.Label>
              <Form.Control type="date" name="to" value={filters.to} onChange={onChange} />
            </Col>
            <Col md={3}>
              <Form.Label>Nhóm theo</Form.Label>
              <Form.Select name="groupBy" value={filters.groupBy} onChange={onChange}>
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button className="w-100" onClick={load} disabled={loading}>
                {loading ? 'Đang tải...' : 'Xem báo cáo'}
              </Button>
              <Button variant="outline-secondary" className="w-100" onClick={exportCsv} disabled={loading}>
                Xuất CSV
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Đang tải...</div>}

      {data && (
        <>
          <Card className="mb-3">
            <Card.Body>
              <h6 className="mb-3">Biểu đồ doanh thu & booking</h6>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={data.series || []} margin={{ left: 8, right: 16, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#c9a24a" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="bookings" name="Booking" stroke="#8884d8" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          <Row className="g-3 mb-3">
            <Col md={3}><Card><Card.Body>
              <div className="text-muted small">Tổng doanh thu</div>
              <div className="fs-5 fw-bold">{(data.summary.totalRevenue ?? 0).toLocaleString()} đ</div>
            </Card.Body></Card></Col>
            <Col md={3}><Card><Card.Body>
              <div className="text-muted small">Tổng booking</div>
              <div className="fs-5 fw-bold">{data.summary.totalBookings}</div>
            </Card.Body></Card></Col>
            <Col md={3}><Card><Card.Body>
              <div className="text-muted small">Tỷ lệ hủy</div>
              <div className="fs-5 fw-bold">{(data.summary.cancellationRate ?? 0).toFixed(1)}%</div>
            </Card.Body></Card></Col>
            <Col md={3}><Card><Card.Body>
              <div className="text-muted small">Công suất TB</div>
              <div className="fs-5 fw-bold">{(data.summary.occupancyRate ?? 0).toFixed(1)}%</div>
            </Card.Body></Card></Col>
          </Row>

          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Chuỗi thời gian</h6>
              </div>
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Doanh thu</th>
                    <th>Booking</th>
                    <th>Hủy</th>
                    <th>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                {data.series?.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.date}</td>
                    <td>{(p.revenue ?? 0).toLocaleString()} đ</td>
                    <td>{p.bookings}</td>
                    <td>{p.cancellations}</td>
                    <td>{(p.occupancy ?? 0).toFixed(1)}%</td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </main>
  )
}


