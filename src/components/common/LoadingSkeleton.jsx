// Loading Skeleton Components
// Beautiful loading states instead of boring spinners

import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

// Card Skeleton
export const CardSkeleton = () => (
  <Card className="card-soft">
    <div className="skeleton" style={{ height: '200px', borderRadius: '12px 12px 0 0' }} />
    <Card.Body>
      <div className="skeleton skeleton-title" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '100%' }} />
      <div className="skeleton skeleton-text" style={{ width: '90%' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
    </Card.Body>
  </Card>
);

// Room Card Skeleton
export const RoomCardSkeleton = () => (
  <div className="card-soft p-0 overflow-hidden">
    <div className="skeleton" style={{ height: '220px' }} />
    <div className="p-3">
      <div className="skeleton skeleton-title" style={{ width: '70%', marginBottom: '12px' }} />
      <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '8px' }} />
      <div className="skeleton skeleton-text" style={{ width: '85%', marginBottom: '16px' }} />
      <div className="d-flex justify-content-between align-items-center">
        <div className="skeleton" style={{ width: '100px', height: '32px' }} />
        <div className="skeleton" style={{ width: '80px', height: '38px', borderRadius: '8px' }} />
      </div>
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="mb-3">
        <div className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
      </div>
    ))}
  </>
);

// Grid Skeleton
export const GridSkeleton = ({ cols = 3, rows = 2 }) => (
  <Container>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <Row key={rowIdx} className="g-4 mb-4">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Col key={colIdx} md={12 / cols}>
            <RoomCardSkeleton />
          </Col>
        ))}
      </Row>
    ))}
  </Container>
);

// Text Skeleton
export const TextSkeleton = ({ lines = 3, width = '100%' }) => (
  <div>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton skeleton-text"
        style={{
          width: i === lines - 1 ? '60%' : width,
          marginBottom: '8px',
        }}
      />
    ))}
  </div>
);

// Page Skeleton
export const PageSkeleton = () => (
  <Container className="py-5">
    <div className="skeleton skeleton-title" style={{ width: '40%', height: '48px', marginBottom: '32px' }} />
    <Row className="g-4">
      <Col md={8}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '16px', marginBottom: '24px' }} />
        <TextSkeleton lines={5} />
      </Col>
      <Col md={4}>
        <CardSkeleton />
      </Col>
    </Row>
  </Container>
);

export default {
  Card: CardSkeleton,
  RoomCard: RoomCardSkeleton,
  List: ListSkeleton,
  Grid: GridSkeleton,
  Text: TextSkeleton,
  Page: PageSkeleton,
};


