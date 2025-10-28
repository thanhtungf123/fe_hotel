# 🔧 Upload Fix - Đã sửa lỗi Upload ảnh CCCD

## 🐛 Vấn đề ban đầu:

- ❌ Upload ảnh CCCD bị lỗi **500 Internal Server Error**
- ❌ Không có validation file ở client-side
- ❌ Error messages không rõ ràng
- ❌ Backend có thể chưa chạy hoặc Cloudinary chưa config đúng

---

## ✅ Đã sửa:

### 1. **Enhanced Upload API** (`src/api/upload.js`)

- ✅ **Client-side validation**:
  - Kiểm tra file type (JPG, PNG, WEBP, GIF)
  - Kiểm tra file size (max 10MB)
  - Validation function tách riêng để reuse
- ✅ **Better error handling**:
  - Phân loại lỗi theo HTTP status (400, 500, 413, 415)
  - Error messages rõ ràng bằng tiếng Việt
  - Detect backend offline (no response)
- ✅ **Timeout protection**: 30 seconds timeout
- ✅ **Support multiple files**: `uploadMultipleFiles()` function

### 2. **Enhanced Booking Page** (`src/pages/Booking.jsx`)

- ✅ **Pre-upload validation**: Validate trước khi upload
- ✅ **Clear error feedback**: Toast notifications rõ ràng
- ✅ **File input reset**: Clear input on error
- ✅ **Better UX**:
  - Loading spinner khi đang upload
  - Success badge khi upload xong
  - Helper text hiển thị format & size limit
  - Stricter file accept (only image/jpeg, image/png, image/webp)

### 3. **Backend Started**

- ✅ Spring Boot backend đã được khởi động lại
- ✅ Endpoint: `POST /api/uploads/id-card`
- ✅ Cloudinary config có trong `application.properties`

---

## 🚀 Cách sử dụng:

### 1. **Đảm bảo Backend đang chạy:**

```bash
# Mở terminal mới, cd vào be_hotel
cd be_hotel
mvn spring-boot:run
```

Chờ đến khi thấy:

```
Started HotelApplication in X.XXX seconds
```

### 2. **Test Upload:**

1. Truy cập: `http://localhost:5173/booking/22` (hoặc ID phòng bất kỳ)
2. Điền thông tin booking
3. Upload ảnh CCCD:
   - Chọn file JPG/PNG (< 10MB)
   - Xem loading spinner
   - Nếu thành công → Thấy badge "✓ Đã tải lên" + preview ảnh
   - Nếu lỗi → Toast notification màu đỏ với lỗi cụ thể

---

## 🔍 Troubleshooting:

### Nếu vẫn bị lỗi 500:

**Nguyên nhân có thể:**

1. **Cloudinary credentials sai**

   - Kiểm tra `be_hotel/src/main/resources/application.properties`
   - Verify:
     ```properties
     cloudinary.cloud-name=HotelBookingSystem
     cloudinary.api-key=272176729857543
     cloudinary.api-secret=huQs-E1ipIkpOtetSVmE3_zNsN4
     ```
   - Test credentials tại: https://cloudinary.com/console

2. **Backend chưa chạy hoặc crashed**

   - Check terminal có Spring Boot logs không
   - Nếu crashed, xem error logs
   - Restart: `mvn spring-boot:run`

3. **Database connection failed**
   - Check SQL Server đang chạy
   - Verify connection string trong `application.properties`

### Nếu lỗi "Không thể kết nối đến server":

**Giải pháp:**

- Backend chưa start hoặc đã crash
- Restart backend: `cd be_hotel && mvn spring-boot:run`
- Đợi ~30-60 giây để Spring Boot khởi động

### Nếu lỗi "File quá lớn":

**Giải pháp:**

- Resize ảnh xuống < 10MB
- Hoặc tăng limit trong `application.properties`:
  ```properties
  spring.servlet.multipart.max-file-size=20MB
  spring.servlet.multipart.max-request-size=20MB
  ```

### Nếu lỗi "Định dạng không hợp lệ":

**Giải pháp:**

- Chỉ chấp nhận: JPG, PNG, WEBP, GIF
- Convert sang định dạng khác nếu cần

---

## 📝 API Documentation:

### Upload Endpoint:

```http
POST /api/uploads/id-card
Content-Type: multipart/form-data

FormData:
  file: <image file>

Response (Success - 200):
{
  "url": "https://res.cloudinary.com/..."
}

Response (Error - 400/500):
{
  "message": "Error message",
  "error": "Detailed error"
}
```

### Frontend Usage:

```javascript
import { uploadFile, validateImageFile } from "../api/upload";

// Validate first
const validation = validateImageFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Upload
try {
  const { url } = await uploadFile(file);
  console.log("Uploaded:", url);
} catch (error) {
  console.error("Upload failed:", error.message);
}
```

---

## ✨ Features:

### Validation Functions:

```javascript
// Validate single file
validateImageFile(file)
// Returns: { valid: boolean, error?: string }

// Upload single file
uploadFile(file, options?)
// Returns: Promise<{ url: string }>

// Upload multiple files
uploadMultipleFiles(files)
// Returns: Promise<string[]>
```

### Supported File Types:

- ✅ `image/jpeg` (.jpg, .jpeg)
- ✅ `image/png` (.png)
- ✅ `image/webp` (.webp)
- ✅ `image/gif` (.gif)

### File Size Limits:

- **Max**: 10MB per file
- Configurable in backend `application.properties`

---

## 🎯 Test Checklist:

- [ ] Backend đang chạy (port 8080)
- [ ] Frontend đang chạy (port 5173)
- [ ] Upload file < 10MB → Success
- [ ] Upload file > 10MB → Error "File quá lớn"
- [ ] Upload file .pdf → Error "Định dạng không hợp lệ"
- [ ] Upload khi backend offline → Error "Không thể kết nối"
- [ ] Success case → Thấy preview ảnh + badge xanh
- [ ] Error case → Toast notification màu đỏ

---

## 🔗 Related Files:

### Frontend:

- `fe_hotel/src/api/upload.js` - Upload API với validation
- `fe_hotel/src/pages/Booking.jsx` - Booking form với upload UI
- `fe_hotel/src/utils/toast.js` - Toast notification helper

### Backend:

- `be_hotel/src/main/java/com/luxestay/hotel/controller/UploadController.java` - Upload endpoint
- `be_hotel/src/main/java/com/luxestay/hotel/config/CloudinaryConfig.java` - Cloudinary setup
- `be_hotel/src/main/resources/application.properties` - Configuration

---

**✅ Status: Upload functionality đã được cải thiện toàn diện!**

**⚠️ Lưu ý: Đảm bảo backend đang chạy trước khi test upload!**

