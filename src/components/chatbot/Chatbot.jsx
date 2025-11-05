import React, { useState, useRef, useEffect } from 'react'
import { Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap'
import axios from '../../api/axiosInstance'
import './Chatbot.css'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của Aurora Palace. Tôi có thể giúp gì cho bạn?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const { data } = await axios.post('/chat', { message: userMessage })
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
            border: 'none'
          }}
        >
          💬
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className="chatbot-window"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '380px',
            height: '500px',
            zIndex: 1001,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Card.Header
            style={{
              background: 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong>💬 Trợ lý AI</strong>
              <div className="small">Aurora Palace</div>
            </div>
            <Button
              variant="link"
              onClick={() => setIsOpen(false)}
              style={{ color: 'white', textDecoration: 'none' }}
            >
              ✕
            </Button>
          </Card.Header>

          <Card.Body
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              background: '#f8f9fa'
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #C9A24A 0%, #B8933D 100%)'
                      : 'white',
                    color: msg.role === 'user' ? 'white' : '#333',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Spinner size="sm" />
                  <span>Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </Card.Body>

          <Card.Footer style={{ padding: '0.75rem' }}>
            <Form onSubmit={handleSend}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Nhập câu hỏi..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  Gửi
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      )}
    </>
  )
}

