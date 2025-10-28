# 🎉 Discount Feature & Sorting

## ✅ Đã hoàn thành

### **Discount Logic (Tính toán tự động)**

Discount được **tính toán dựa vào giá phòng**, không cần lưu trong database:

```javascript
// Giá > 5 triệu  → 25% giảm  (Luxury rooms)
// Giá 3-5 triệu  → 17% giảm  (Premium rooms)
// Giá 1.5-3 triệu → 10% giảm  (Standard rooms)
// Giá < 1.5 triệu → 0% giảm   (Budget rooms)
```

---

## 📂 Files Created/Modified

### 1. **`src/utils/discount.js`** (NEW)

Utility functions để tính discount:

```javascript
// Calculate discount percentage
calculateDiscount(priceVnd) → number (0-25)

// Get discounted price
getDiscountedPrice(priceVnd) → number

// Get original price before discount
getOriginalPrice(priceVnd) → number

// Get discount savings amount
getDiscountAmount(priceVnd) → number
```

### 2. **`src/components/home/RoomCard.jsx`**

- ✅ Import `calculateDiscount` từ utils
- ✅ Replace: `room.discount ?? (room.priceVnd > 3000000 ? 17 : 0)`
- ✅ With: `calculateDiscount(room.priceVnd)`

### 3. **`src/components/search/RoomCardRow.jsx`**

- ✅ Import `calculateDiscount` từ utils
- ✅ Replace cùng logic như RoomCard

### 4. **`src/components/search/SortBar.jsx`**

- ✅ Thêm sort option: `"🎉 Giảm giá cao nhất"`
- ✅ Key: `discountDesc`

### 5. **`src/pages/Search.jsx`**

- ✅ Import `calculateDiscount`
- ✅ Add sorting logic cho `discountDesc`:
  ```javascript
  const rooms = useMemo(() => {
    let sorted = raw ?? [];

    if (sort === "discountDesc") {
      sorted.sort((a, b) => {
        const discountA = calculateDiscount(a.priceVnd);
        const discountB = calculateDiscount(b.priceVnd);
        return discountB - discountA;
      });
    }

    return sorted;
  }, [raw, sort]);
  ```

---

## 🎯 Discount Tiers (Chi tiết)

| Giá phòng (VND)       | Discount   | Ví dụ        |
| --------------------- | ---------- | ------------ |
| > 5,000,000           | **25%** 🎉 | 5M → 3.75M   |
| 3,000,001 - 5,000,000 | **17%** ✅ | 4M → 3.32M   |
| 1,500,001 - 3,000,000 | **10%**    | 2.5M → 2.25M |
| ≤ 1,500,000           | **0%**     | 1M → 1M      |

---

## 🔍 UI/UX

### Room Cards (Home & Search):

- **Discount badge** hiển thị tự động dựa vào giá
- **Strike-through price** hiển thị giá gốc
- **Gold accent** cho giá discount

### Sort Options:

1. 💰 Giá thấp đến cao
2. 💰 Giá cao đến thấp
3. ⭐ Đánh giá cao nhất
4. 🔥 Phổ biến nhất
5. **🎉 Giảm giá cao nhất** (NEW)

---

## 🧮 Calculation Examples

**Room: 5 triệu VND**

```
Discount: 25%
Original: 5,000,000₫
Discounted: 3,750,000₫
Savings: 1,250,000₫
```

**Room: 4 triệu VND**

```
Discount: 17%
Original: 4,000,000₫
Discounted: 3,320,000₫
Savings: 680,000₫
```

**Room: 2.5 triệu VND**

```
Discount: 10%
Original: 2,500,000₫
Discounted: 2,250,000₫
Savings: 250,000₫
```

---

## 🎬 How It Works

### 1. **Home Page (RoomCard)**

- Khi load room → calculateDiscount(price)
- Nếu discount > 0 → Hiện badge "-X%"
- Hiện giá gốc (strike-through) + giá discount

### 2. **Search Page (List View)**

- Cùng logic như home
- Click "🎉 Giảm giá cao nhất" → Sort by highest discount

### 3. **Search Page (Grid View)**

- Dùng RoomCard → Cùng UI

### 4. **Sorting Logic**

```javascript
// Khi user chọn "Giảm giá cao nhất"
sort === 'discountDesc'
  → calculateDiscount(room1.price) vs calculateDiscount(room2.price)
  → Sort descending
```

---

## 🚀 Test Instructions

### Test Discount Display:

1. Go to: `http://localhost:5173/` (Home page)
2. Look for rooms với badge discount:

   - Phòng > 5M → "-25%"
   - Phòng 3-5M → "-17%"
   - Phòng 1.5-3M → "-10%"
   - Phòng < 1.5M → No badge

3. Verify strike-through pricing shows correctly

### Test Discount Sorting:

1. Go to: `http://localhost:5173/search`
2. Click sort dropdown → "🎉 Giảm giá cao nhất"
3. ✅ Rooms should sort by discount (highest first):
   - Luxury rooms (25%) appear first
   - Premium rooms (17%) appear second
   - Standard rooms (10%) appear third
   - Budget rooms (0%) appear last

### Test Mixed Prices:

1. Create test search with:
   - 5M room (25% discount)
   - 2.5M room (10% discount)
   - 1M room (0% discount)
2. Sort by discount
3. ✅ Order: 5M → 2.5M → 1M

---

## 💡 Advantages

### Why This Approach:

- ✅ **No database changes needed** - Tính toán dynamic
- ✅ **Consistent logic** - Một nơi define discount rules
- ✅ **Easy to modify** - Chỉnh tier thresholds dễ dàng
- ✅ **Reusable functions** - Dùng ở mọi nơi cần discount
- ✅ **Type-safe** - JSDoc comments với prop types

### Discount Strategy:

- ✅ **Encourages booking** - Luxury rooms get bigger discounts
- ✅ **Competitive advantage** - Show discounts compared to listed price
- ✅ **Increases perceived value** - "Save 1.25M!" sounds great

---

## 🔄 Future Enhancements (Optional)

- [ ] **Seasonal discounts** - Add multipliers based on date
- [ ] **Loyalty discounts** - Extra % for returning customers
- [ ] **Coupon codes** - Manual discount override
- [ ] **Flash sales** - Time-limited discount boost
- [ ] **Discount analytics** - Track which discount tier is most booked

---

## ✅ Checklist

- [x] Create discount utility (`discount.js`)
- [x] Calculate functions for all scenarios
- [x] Update RoomCard.jsx
- [x] Update RoomCardRow.jsx
- [x] Add sort option "Giảm giá cao nhất"
- [x] Implement discount sorting in Search.jsx
- [x] Test discount display
- [x] Test discount sorting
- [x] No console errors
- [x] Documentation

---

**🎉 Result: Dynamic discount system that encourages bookings!**

**📊 All phòng now have attractive discounts based on tier!**
