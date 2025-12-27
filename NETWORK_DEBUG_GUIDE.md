# Hướng dẫn Debug Network Requests

## Tổng quan

Đã thêm các công cụ để giúp debug các vấn đề network requests, đặc biệt là các request đến Supabase bị pending hoặc failed.

## Các cải tiến đã thực hiện

### 1. ✅ Bật lại Console Error Logging
- File: `hooks/useApi.ts`
- Tất cả lỗi API giờ sẽ được log ra console với thông tin chi tiết

### 2. ✅ Network Monitoring
- File: `utils/networkMonitor.ts`
- Tự động track tất cả requests đến Supabase
- Log thời gian, status, và lỗi của mỗi request

### 3. ✅ Supabase Error Handler
- File: `utils/supabaseErrorHandler.ts`
- Cung cấp error logging nhất quán
- Map error codes thành thông báo dễ hiểu

### 4. ✅ Improved Supabase Client
- File: `utils/supabaseClient.ts`
- Tích hợp network monitoring
- Better error handling configuration

## Cách sử dụng

### 1. Mở Browser DevTools

1. Mở ứng dụng trong browser
2. Nhấn `F12` hoặc `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Chuyển sang tab **Console**

### 2. Xem Network Requests trong Console

Bạn sẽ thấy các log như sau:

```
🌐 [Network] → GET https://etcwjkfiduzblrkdlzpp.supabase.co/rest/v1/...
✅ [Network] ✓ GET https://etcwjkfiduzblrkdlzpp.supabase.co/rest/v1/... {status: 200, duration: "234ms"}
❌ [Network] ✗ POST https://etcwjkfiduzblrkdlzpp.supabase.co/rest/v1/... {status: 500, error: "..."}
```

### 3. Xem Network Tab trong DevTools

1. Chuyển sang tab **Network** trong DevTools
2. Filter theo `supabase.co` để chỉ xem Supabase requests
3. Kiểm tra:
   - **Status codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 500 (Server Error)
   - **Time**: Requests nào mất quá nhiều thời gian (>5s)
   - **Failed requests**: Có dấu đỏ, status code >= 400
   - **Pending requests**: Requests không bao giờ complete (có thể bị timeout)

### 4. Sử dụng Network Monitor trong Console

Trong browser console, bạn có thể chạy:

```javascript
// Xem network health summary
networkMonitor.logHealthSummary()

// Xem tất cả pending requests
networkMonitor.getPendingRequests()

// Xem tất cả failed requests
networkMonitor.getFailedRequests()

// Xem full health summary
networkMonitor.getHealthSummary()
```

### 5. Kiểm tra Supabase Errors

Các lỗi Supabase sẽ được log với format:

```
❌ [Supabase] Error fetching events: {
  message: "...",
  code: "PGRST116",
  details: "...",
  hint: "..."
}
```

**Common Error Codes:**
- `PGRST116`: No rows returned
- `23505`: Unique constraint violation (duplicate)
- `42501`: Insufficient privileges (RLS policy)
- `42P01`: Table does not exist
- `PGRST301`: JWT expired

## Các vấn đề thường gặp

### 1. Requests bị Pending (không bao giờ complete)

**Nguyên nhân có thể:**
- Supabase service down hoặc không accessible
- Network timeout
- CORS issues
- Firewall/proxy blocking

**Cách debug:**
1. Kiểm tra Network tab - xem request có bị cancel không
2. Kiểm tra Console - có error message không
3. Thử truy cập trực tiếp Supabase URL trong browser
4. Kiểm tra internet connection

### 2. Requests Failed với Status 401/403

**Nguyên nhân:**
- JWT token expired
- RLS (Row Level Security) policy blocking
- Không có quyền truy cập

**Cách fix:**
- Đăng nhập lại để refresh token
- Kiểm tra RLS policies trong Supabase dashboard
- Kiểm tra user role và permissions

### 3. Requests Failed với Status 500

**Nguyên nhân:**
- Server error từ Supabase
- Database error
- Query syntax error

**Cách debug:**
- Xem error message trong Console
- Kiểm tra Supabase dashboard logs
- Kiểm tra query syntax

### 4. Requests quá chậm (>5s)

**Nguyên nhân:**
- Database query không tối ưu
- Network latency
- Supabase service slow

**Cách fix:**
- Kiểm tra query có đang fetch quá nhiều data không
- Thêm pagination
- Thêm indexes trong database

## Enable Network Monitor trong Production

Mặc định, network monitor chỉ chạy trong development mode. Để enable trong production (không khuyến nghị):

```javascript
localStorage.setItem('enableNetworkMonitor', 'true');
```

Để disable:
```javascript
localStorage.removeItem('enableNetworkMonitor');
```

## Tips

1. **Filter trong Network tab**: Sử dụng filter `supabase.co` để chỉ xem Supabase requests
2. **Preserve log**: Bật "Preserve log" trong Network tab để giữ logs khi navigate
3. **Throttling**: Test với "Slow 3G" trong Network tab để simulate slow network
4. **Check timing**: Xem "Waterfall" trong Network tab để xem request timeline

## Next Steps

Nếu phát hiện vấn đề:
1. Copy error message từ Console
2. Copy request details từ Network tab
3. Kiểm tra Supabase dashboard để xem service status
4. Kiểm tra database connection và RLS policies

