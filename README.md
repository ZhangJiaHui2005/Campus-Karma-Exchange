# 🚀 Campus Karma Exchange - Backend API

Dự án Backend cho hệ thống **Sàn chia sẻ đồ dùng sinh viên bằng điểm tín nhiệm Karma (Campus Karma Exchange)**.  
Sử dụng **Node.js (ExpressJS)**, **Prisma ORM** và CSDL **Cloud PostgreSQL (NeonDB)**.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

* **Runtime:** Node.js
* **Framework:** ExpressJS
* **ORM:** Prisma ORM
* **Database:** Cloud PostgreSQL (NeonDB)
* **Environment Management:** dotenv

---

## 🚀 Hướng Dẫn Setup Dự Án Cho Thành Viên Mới (Onboarding)

Dành cho các thành viên khi mới **clone** dự án lần đầu tiên về máy cá nhân:

### 1. Clone dự án về máy
```bash
git clone <URL_REPOSITORY_GITHUB_CUA_NHOM>
cd <TEN_THU_MUC_DU_AN>
```

### 2. Cài đặt Dependencies
Chạy lệnh sau để cài đặt toàn bộ các thư viện cần thiết trong `package.json`:
```bash
npm install
```

### 3. Cấu hình biến môi trường (`.env`)
* Tạo một file có tên là `.env` tại thư mục gốc của dự án.
* Xin chuỗi kết nối CSDL Cloud NeonDB (`DATABASE_URL`) từ Trưởng nhóm/Leader và dán vào file `.env`:

```env
PORT=5000
DATABASE_URL="postgresql://neondb_owner:npg_MyfmpEgI4B0c@ep-wandering-shadow-b3ypuucm-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

> **⚠️ Lưu ý:** Tuyệt đối **KHÔNG** commit file `.env` lên GitHub để bảo mật thông tin kết nối CSDL!

### 4. Đồng bộ Prisma Client với CSDL
Chạy lệnh sau để Prisma sinh ra các hàm truy vấn CSDL và kích hoạt gợi ý code (IntelliSense) trong VS Code dựa trên file `prisma/schema.prisma`:

```bash
npx prisma generate
```

### 5. Chạy dự án ở môi trường Development
```bash
npm run dev
# hoặc
npx nodemon src/index.js
```
Nếu màn hình hiển thị `Server đang chạy tại http://localhost:5000` là setup thành công!

---

## 🔄 Quy Trình Làm Việc Nhóm & Quản Lý CSDL (Workflow)

Để tránh xung đột code và hỏng CSDL chung của nhóm, mọi thành viên tuân thủ đúng quy trình sau:

### 🔴 Hằng ngày trước khi bắt đầu làm tính năng mới:
```bash
# 1. Chuyển về nhánh main/dev và kéo code mới nhất về
git checkout main
git pull origin main

# 2. Cập nhật Prisma Client (phòng trường hợp bạn khác có sửa DB)
npx prisma generate
```

### 🟡 Khi BẠN muốn Thay đổi / Thêm mới Bảng CSDL:
1. Chỉnh sửa file `prisma/schema.prisma`.
2. Chạy lệnh sau để đẩy cấu trúc bảng mới lên Cloud NeonDB:
   ```bash
   npx prisma db push
   ```
3. Sau khi đẩy thành công, **commit file `prisma/schema.prisma`** và push code lên GitHub để các bạn khác cùng cập nhật:
   ```bash
   git add prisma/schema.prisma
   git commit -m "feat(db): update schema for transaction escrow"
   git push origin <ten-nhanh-cua-ban>
   ```

### 🟢 Khi BẠN KHÁC vừa sửa CSDL và bạn kéo code mới về:
Khi `git pull` thấy có sự thay đổi trong file `prisma/schema.prisma`, chạy lệnh:
```bash
npx prisma generate
```

---

## 🛠️ Một Số Lệnh Prisma Thường Dùng

| Lệnh | Mụch đích |
| :--- | :--- |
| `npx prisma studio` | Mở giao diện Web xem & chỉnh sửa dữ liệu CSDL trực quan trên trình duyệt (`http://localhost:5555`). |
| `npx prisma db push` | Đẩy cấu trúc từ `schema.prisma` lên CSDL Cloud NeonDB. |
| `npx prisma generate` | Tạo lại Prisma Client để cập nhật gợi ý code trong VS Code. |

---

## 📂 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
├── prisma/
│   └── schema.prisma    # Định nghĩa CSDL (Models & Relations)
├── src/
│   ├── config/          # Cấu hình dự án (DB connection, JWT,...)
│   ├── controllers/     # Xử lý Logic nghiệp vụ chính
│   ├── middlewares/     # Kiểm tra Token Authentication, phân quyền Role
│   ├── routes/          # Khai báo các API Endpoints
│   └── index.js         # Entry point chạy Server Express
├── .env                 # File cấu hình biến môi trường (Local only)
├── .gitignore           # Bỏ qua node_modules, .env khi push Git
├── package.json
└── README.md
```
