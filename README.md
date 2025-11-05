# Fe Hotel App

## OAuth (Google & Facebook)

### Cách lấy Google Client ID:

1. **Truy cập Google Cloud Console:**
   - Vào: https://console.cloud.google.com/
   - Đăng nhập bằng tài khoản Google của bạn

2. **Tạo hoặc chọn Project:**
   - Click dropdown "Select a project" ở đầu trang
   - Chọn "New Project" nếu chưa có
   - Đặt tên project (ví dụ: "Hotel OAuth") và click "Create"

3. **Bật Google+ API:**
   - Vào "APIs & Services" > "Library"
   - Tìm "Google+ API" hoặc "Google Identity Services API"
   - Click "Enable"

4. **Tạo OAuth 2.0 Client ID:**
   - Vào "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Nếu chưa có OAuth consent screen, sẽ yêu cầu cấu hình:
     - User Type: chọn "External" (cho development)
     - App name: nhập tên app của bạn
     - User support email: chọn email của bạn
     - Developer contact: nhập email của bạn
     - Click "Save and Continue" qua các bước (scopes có thể bỏ qua)
   - Quay lại "Credentials" > "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: chọn **"Web application"**
   - Name: đặt tên (ví dụ: "Hotel Web Client")
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     http://127.0.0.1:5173
     ```
   - **Authorized redirect URIs:** (có thể để trống hoặc thêm):
     ```
     http://localhost:5173
     ```
   - Click "Create"

5. **Copy Client ID:**
   - Bạn sẽ thấy popup hiển thị "Your Client ID" (dạng: `123456789-abc...xyz.apps.googleusercontent.com`)
   - Copy Client ID này và dùng trong file `.env.local`

### Cách lấy Facebook App ID:

1. **Truy cập Facebook Developers:**
   - Vào: https://developers.facebook.com/
   - Đăng nhập bằng tài khoản Facebook của bạn

2. **Tạo App:**
   - Click "My Apps" ở góc trên bên phải
   - Chọn "Create App"
   - Chọn loại app: "Consumer" hoặc "None" (tùy mục đích)
   - Điền thông tin:
     - App Display Name: tên app của bạn (ví dụ: "Hotel Booking")
     - App Contact Email: email của bạn
   - Click "Create App"

3. **Thêm Facebook Login:**
   - Trong dashboard của app, tìm "Add a Product"
   - Tìm "Facebook Login" và click "Set Up"
   - Chọn platform: **"Web"**
   - Site URL: nhập `http://localhost:5173`
   - Click "Save"

4. **Cấu hình Facebook Login:**
   - Vào "Settings" > "Basic" ở menu bên trái
   - Ghi chú **App ID** và **App Secret** (App Secret không cần cho frontend)
   - Thêm domain vào "App Domains": `localhost`
   - Vào "Facebook Login" > "Settings" trong menu
   - Thêm "Valid OAuth Redirect URIs":
     ```
     http://localhost:5173
     http://127.0.0.1:5173
     ```
   - Click "Save Changes"

5. **Copy App ID:**
   - App ID nằm ở "Settings" > "Basic" (dạng số: `1234567890123456`)
   - Copy App ID này và dùng trong file `.env.local`

### Cấu hình file .env.local:

Tạo file `.env.local` trong thư mục `fe_hotel` (cùng cấp với `package.json`):

```env
VITE_API_BASE=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
VITE_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID_HERE
```

**Ví dụ:**
```env
VITE_API_BASE=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=1234567890123456
```

### Lưu ý quan trọng:

- **Restart dev server** sau khi thêm/sửa file `.env.local`: dừng server (Ctrl+C) và chạy lại `npm run dev`
- **Facebook:** Cần thêm email vào permissions (trong Facebook Login > Settings > Permissions, thêm `email`)
- **Google:** Mặc định đã có quyền email trong scope `openid email profile`
- **Production:** Khi deploy, cần cập nhật authorized origins/redirect URIs trong cả Google và Facebook với domain production của bạn

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
