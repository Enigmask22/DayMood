# BÁO CÁO HIỆN THỰC SENTRY TRONG ỨNG DỤNG DAYMOOD

## 1. TỔNG QUAN

### 1.1 Mục đích

Sentry được tích hợp vào ứng dụng DayMood để:

- Theo dõi và báo cáo lỗi trong thời gian thực
- Thu thập thông tin debug và performance monitoring
- Theo dõi hành vi người dùng thông qua breadcrumbs
- Cải thiện chất lượng ứng dụng thông qua việc phân tích lỗi

### 1.2 Phiên bản và Dependencies

- **Sentry SDK**: `@sentry/react-native`
- **Platform**: React Native with Expo Router
- **Environment**: Development và Production

## 2. CẤU HÌNH KHỞI TẠO

### 2.1 Vị trí khởi tạo

- **File**: `src/app/_layout.tsx`
- **Vị trí**: Được khởi tạo ngay đầu ứng dụng, trước các component khác

### 2.2 Cấu hình chi tiết

```typescript
Sentry.init({
  dsn: "https://f33481725bcc898aec47c4440808f974@o4509424068067328.ingest.de.sentry.io/4509424070754384",
  debug: true,
  environment: __DEV__ ? "development" : "production",
  beforeSend(event) {
    if (__DEV__) {
      console.log("Sentry Event:", event);
    }
    return event;
  },
});
```

**Các thông số cấu hình:**

- **DSN**: URL endpoint để gửi dữ liệu lên Sentry server
- **Debug Mode**: Bật trong development để debug
- **Environment**: Tự động phân biệt development/production
- **beforeSend**: Middleware để log events trong development

## 3. TÍNH NĂNG ĐÃ HIỆN THỰC

### 3.1 Error Tracking

**Vị trí**: `carddetail.tsx` - function `handleBackToHome()`

```typescript
// Capture exceptions với context
Sentry.captureException(error, {
  tags: {
    operation: "save_record_and_home",
    user_id: user?.id?.toString() || "unknown",
  },
  extra: {
    mood_id: moodId,
    has_images: images.length > 0,
    has_recordings: recordings.length > 0,
    has_activities: activities.length > 0,
  },
});
```

**Đặc điểm:**

- Tự động capture exceptions
- Thêm tags để phân loại lỗi
- Bao gồm extra data cho context
- Theo dõi các operation quan trọng

### 3.2 Breadcrumbs Tracking

**Mục đích**: Theo dõi luồng hành động của người dùng

**Các breadcrumbs được implement:**

1. **User Actions**:

```typescript
Sentry.addBreadcrumb({
  message: "User initiated save record and navigate to home",
  level: "info",
  category: "user.action",
});
```

2. **System Events**:

```typescript
Sentry.addBreadcrumb({
  message: "Record created successfully",
  level: "info",
  data: { record_id: recordId },
});
```

3. **Process Tracking**:

```typescript
Sentry.addBreadcrumb({
  message: "Starting image upload - ${images.length} images",
  level: "info",
});
```

### 3.3 User Context

**Mục đích**: Liên kết lỗi với thông tin người dùng cụ thể

```typescript
Sentry.setUser({
  id: user.id.toString(),
  email: user.email,
});
```

### 3.4 Manual Message Capture

**Sử dụng**: Gửi thông tin debug không phải lỗi

```typescript
Sentry.captureMessage("Test message from carddetail", "info");
```

### 3.5 Development Testing

**Function testSentry()** - Chỉ chạy trong development:

```typescript
const testSentry = () => {
  // Test breadcrumb
  Sentry.addBreadcrumb({
    message: "Test breadcrumb from carddetail",
    level: "info",
    category: "test",
  });

  // Test user context
  Sentry.setUser({
    id: "test-user-123",
    email: "test@example.com",
  });

  // Test exception
  try {
    throw new Error("Test error from carddetail - Sentry working!");
  } catch (error) {
    Sentry.captureException(error, {
      tags: { test: "true", component: "carddetail" },
      extra: { testData: "This is a test error" },
    });
  }

  // Test message
  Sentry.captureMessage("Test message from carddetail", "info");
};
```

## 4. PHẠM VI THEO DÕI

### 4.1 Các Operation được monitor:

1. **Lưu record và upload media**
2. **Image upload process**
3. **Audio upload process**
4. **User authentication flow**
5. **Navigation events**

### 4.2 Error Categories:

- **User Authentication**: Lỗi đăng nhập, user không tồn tại
- **File Operations**: Upload/download hình ảnh, audio
- **Database Operations**: Tạo record, lưu files
- **Network Operations**: API calls, connectivity issues

## 5. ĐIỂM MẠNH CỦA HIỆN THỰC

### 5.1 Comprehensive Error Context

- Đầy đủ thông tin user context
- Tags phân loại rõ ràng theo operation
- Extra data cung cấp đủ thông tin để reproduce lỗi

### 5.2 Progressive Enhancement

- Development mode có debug chi tiết
- Production mode tối ưu performance
- Test functions chỉ chạy trong development

### 5.3 Business Logic Integration

- Theo dõi các luồng business quan trọng
- Breadcrumbs mapping với user journey
- Error handling không làm gián đoạn UX

## 6. KHU VỰC CẦN CẢI THIỆN

### 6.1 Performance Monitoring

**Hiện tại**: Chưa có performance tracking
**Đề xuất**: Thêm performance monitoring cho:

- App startup time
- Screen navigation time
- Upload/download speeds
- API response times

### 6.2 Release Tracking

**Hiện tại**: Chưa có release tracking
**Đề xuất**: Thêm release information để theo dõi lỗi theo version

### 6.3 Custom Metrics

**Hiện tại**: Chỉ có error tracking
**Đề xuất**: Thêm custom metrics cho:

- User engagement
- Feature usage
- Success rates

## 7. BẢO MẬT VÀ PRIVACY

### 7.1 Data Sensitivity

- **DSN**: Được hardcode (nên move vào environment variables)
- **User Data**: Chỉ gửi id và email
- **Sensitive Content**: Không gửi nội dung note, chỉ metadata

### 7.2 Compliance

- Tuân thủ GDPR với việc chỉ thu thập dữ liệu cần thiết
- User có thể opt-out thông qua disable Sentry

## 8. KẾT LUẬN

### 8.1 Đánh giá tổng thể

Việc hiện thực Sentry trong ứng dụng DayMood đã đạt được:

- ✅ Error tracking comprehensive
- ✅ User journey tracking qua breadcrumbs
- ✅ Development-friendly debugging
- ✅ Production-ready configuration
- ✅ Business logic integration

### 8.2 Lợi ích đạt được

1. **Improved Debug Experience**: Developers có thể nhanh chóng identify và fix lỗi
2. **User Experience Monitoring**: Theo dõi user journey và pain points
3. **Proactive Issue Resolution**: Phát hiện lỗi trước khi user báo cáo
4. **Data-Driven Improvements**: Sử dụng data để cải thiện app quality

### 8.3 Roadmap phát triển

1. **Phase 2**: Thêm Performance Monitoring
2. **Phase 3**: Custom Dashboard cho business metrics
3. **Phase 4**: Advanced alerting và automation
4. **Phase 5**: Integration với CI/CD pipeline

---

**Ngày tạo báo cáo**: $(date)
**Người thực hiện**: Development Team
**Version**: 1.0
