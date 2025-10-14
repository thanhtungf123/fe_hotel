import React from 'react'
import Card from 'react-bootstrap/Card'

export default function AmenityCard({icon, title, desc}){
  return (
    <Card className="h-100 amenity-card rounded-2xl shadow-soft">
      <Card.Body>
        <div className="display-6">{icon}</div>
        <Card.Title className="mt-2">{title}</Card.Title>
        <Card.Text className="text-muted">{desc}</Card.Text>
      </Card.Body>
    </Card>
  )
}
