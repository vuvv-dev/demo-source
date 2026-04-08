# 🚀 TÀI LIỆU QUICKSTART: Cài đặt và Chạy Dự án Local

Dự án này là một hệ thống thương mại điện tử (Apple Store) với 3 thành phần chính:
1. **Database:** PostgreSQL (Khởi chạy bằng Docker)
2. **Backend:** NestJS + TypeORM (Cổng mặc định: `3001`)
3. **Frontend:** React + Next.js (Cổng mặc định: `3000`)

---

## 🛠 Bước 1: Khởi động Database (PostgreSQL)
Dự án sử dụng Docker Compose để cấu hình sẵn một database PostgreSQL.

1. Hãy mở terminal tại thư mục gốc của dự án.
2. Chạy lệnh sau để khởi động riêng container database dưới nền:
```bash
docker-compose up -d postgres
```
*(Cổng 5432 sẽ được mở. Thông tin đăng nhập mặc định đã được cấu hình trong `docker-compose.yml` là `postgres`/`postgres123`)*

---

## ⚙️ Bước 2: Cài đặt và Chạy Backend + Seeding Dữ liệu

1. Di chuyển vào thư mục `backend`:
```bash
cd backend
```

2. Cài đặt các gói phụ thuộc (dependencies):
```bash
npm install
```

### 🌱 Seeding Dữ liệu (Khởi tạo dữ liệu mẫu và Account)
Backend đã xây dựng sẵn script để tạo schema, chèn dữ liệu sản phẩm mẫu và tài khoản cần thiết.

3. Chạy lệnh seed:
```bash
npm run seed
```
*(Khi chạy thành công, console sẽ in ra dòng chữ báo hoàn tất: `🎉 Seed hoàn tất!`)*

4. Khởi động server Backend ở chế độ development:
```bash
npm run start:dev
```
*Backend sẽ chạy tại: `http://localhost:3001`*

---

## 💻 Bước 3: Cài đặt và Chạy Frontend

1. Mở một cửa sổ terminal **mới** (giữ nguyên tab chạy Backend) và di chuyển vào thư mục `frontend`:
```bash
cd frontend
```

2. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

3. Khởi động Frontend ở chế độ development:
```bash
npm run dev
```
*Frontend sẽ chạy tại: `http://localhost:3000`*

---

## 🔑 Bước 4: Tài Khoản (Accounts) Đã Được Seed Mặc Định

Các tài khoản mẫu dưới đây đã được tạo sẵn sau khi bạn cạy lệnh `npm run seed`:

### 👑 Tài khoản Quản trị viên (Admin)
Sử dụng tài khoản này để vào các tính năng quản lý cửa hàng:
- **Email:** `admin@apple-store.vn`
- **Password:** `Admin@123`

### 👤 Tài khoản Khách hàng (Customer)
Sử dụng tài khoản này để test tính năng mua hàng, xem lịch sử đặt hàng, giỏ hàng,...:
- **Email:** `customer@test.vn`
- **Password:** `Test@123`
- **Tên mặc định:** Nguyễn Văn A

---
**💡 Ghi chú thêm:**
- Hãy đảm bảo bạn đang sử dụng **Node.js** (phiên bản 18 hoặc 20 trở lên) để chạy dự án.
- Hãy chắc chắn container `postgres` luôn hoạt động khi chạy Backend vì Backend sẽ trỏ thẳng tới URL cục bộ: `postgresql://postgres:postgres123@localhost:5432/apple_store`.
