import React from 'react'
import { ButtonGroup, ToggleButton, Dropdown } from 'react-bootstrap'

const sorts = [
  { key: 'priceAsc', label: 'Giá thấp đến cao' },
  { key: 'priceDesc', label: 'Giá cao đến thấp' },
  { key: 'ratingDesc', label: 'Đánh giá cao' },
]

export default function SortBar({ view, onView, sort, onSort }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div>
        <div className="h4 m-0">Kết quả tìm kiếm</div>
        <div className="text-muted small">Tìm thấy phòng phù hợp</div>
      </div>
      <div className="d-flex align-items-center gap-3">
        <Dropdown>
          <Dropdown.Toggle variant="light" className="border">
            {sorts.find(s=>s.key===sort)?.label}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {sorts.map(s=>(
              <Dropdown.Item key={s.key} active={s.key===sort} onClick={()=>onSort(s.key)}>
                {s.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <ButtonGroup>
          <ToggleButton id="vlist" type="radio" name="view" value="list"
            variant={view==='list'?'dark':'outline-secondary'}
            checked={view==='list'} onChange={()=>onView('list')}>▦</ToggleButton>
          <ToggleButton id="vgrid" type="radio" name="view" value="grid"
            variant={view==='grid'?'dark':'outline-secondary'}
            checked={view==='grid'} onChange={()=>onView('grid')}>▥</ToggleButton>
        </ButtonGroup>
      </div>
    </div>
  )
}
