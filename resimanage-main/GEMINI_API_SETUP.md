# Cấu hình Google Gemini API Key

## Hướng dẫn lấy API Key

### Bước 1: Truy cập Google AI Studio
1. Mở trình duyệt và truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google của bạn

### Bước 2: Tạo API Key
1. Click nút **"Create API Key"** hoặc **"Get API Key"**
2. Chọn Google Cloud project:
   - Nếu đã có project: Chọn project có sẵn
   - Nếu chưa có: Click **"Create API key in new project"**
3. API key sẽ được tạo (dạng: `AIzaSy...`)
4. Click **Copy** để copy API key

### Bước 3: Thêm API Key vào dự án

**Cách 1: Tạo file `.env.local` (Khuyến nghị)**

1. Mở thư mục dự án: `c:\Users\Admin\Downloads\resimanage`
2. Tạo file mới tên `.env.local` (lưu ý có dấu chấm ở đầu)
3. Copy nội dung sau vào file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://etcwjkfiduzblrkdlzpp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
```

4. Thay `YOUR_API_KEY_HERE` bằng API key bạn vừa copy
5. Lưu file

**Cách 2: Sử dụng PowerShell**

Mở PowerShell trong thư mục dự án và chạy:

```powershell
@"
# Supabase Configuration
VITE_SUPABASE_URL=https://etcwjkfiduzblrkdlzpp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
"@ | Out-File -FilePath .env.local -Encoding utf8
```

Sau đó mở file `.env.local` và thay `YOUR_API_KEY_HERE` bằng API key thực.

## Kiểm tra cấu hình

Sau khi thêm API key, khởi động lại dev server:

```bash
npm run dev
```

API key sẽ được load tự động và có thể truy cập qua `import.meta.env.VITE_GEMINI_API_KEY`.

## Bảo mật

- ✅ File `.env.local` đã được thêm vào `.gitignore` - không bị commit lên Git
- ✅ API key chỉ được sử dụng ở client-side cho tính năng AI mapping
- ⚠️ **Lưu ý**: Không chia sẻ API key với người khác
- ⚠️ **Giới hạn**: Gemini API có giới hạn miễn phí, theo dõi usage tại Google AI Studio

## Quota & Pricing

- **Free tier**: 60 requests/minute
- **Gemini 1.5 Flash**: Miễn phí cho usage thấp
- Xem chi tiết: https://ai.google.dev/pricing

## Troubleshooting

**Lỗi: API key not found**
- Kiểm tra file `.env.local` có tồn tại không
- Kiểm tra tên biến: `VITE_GEMINI_API_KEY` (phải có prefix `VITE_`)
- Khởi động lại dev server

**Lỗi: Invalid API key**
- Kiểm tra API key đã copy đúng chưa (không có khoảng trắng thừa)
- Thử tạo API key mới

**Lỗi: Quota exceeded**
- Đợi 1 phút và thử lại
- Hoặc nâng cấp lên paid tier
