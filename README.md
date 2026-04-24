# 🌊 AquaMonitor — Sistem Monitoring Kualitas Air Berbasis IoT

**Capstone Project — Universitas Diponegoro, Fakultas Teknik**

Perancangan Perangkat Portable Monitoring Kualitas Air Berbasis IoT dengan Decision Support System (DSS) untuk analisis kualitas air secara realtime.

---

## 🏗️ Arsitektur

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Laravel 11 (REST API) |
| Auth | Laravel Sanctum (Token-based) |
| Database | MySQL (XAMPP) |
| Chart | ApexCharts |

```
Frontend (React SPA, port 5173)  ←→  Backend (Laravel API, port 8000)
                                          ↕
                                    MySQL (XAMPP)
```

---

## 📡 Sensor

| Sensor | Unit | Batas Normal |
|--------|------|--------------|
| pH | - | 6.5 – 8.5 |
| Suhu Air | °C | 20 – 30 |
| DO (Dissolved Oxygen) | mg/L | 4 – 14 |
| TDS (Total Dissolved Solids) | ppm | 0 – 500 |
| Weather/Cuaca | - | Opsional |

---

## 👥 Role User

| Fitur | Admin | Pengelola | Operator |
|-------|-------|-----------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Monitoring Realtime | ✅ | ✅ | ✅ |
| Data Historis | ✅ | ✅ | ✅ |
| Download CSV | ✅ | ✅ | ❌ |
| Kalibrasi Sensor | ✅ | ✅ | ❌ |
| Manajemen User | ✅ | ❌ | ❌ |
| Manajemen Data | ✅ | ❌ | ❌ |
| Log Aktivitas | ✅ | ❌ | ❌ |
| API Keys | ✅ | ❌ | ❌ |

---

## 🚀 Setup (Windows + XAMPP)

### Prasyarat
- **XAMPP** (PHP 8.2+, MySQL)
- **Composer** (https://getcomposer.org)
- **Node.js 18+** (https://nodejs.org)
- **Git**

### Step 1 — Database
```powershell
# Buka XAMPP Control Panel
# Start Apache & MySQL
# Buka phpMyAdmin (http://localhost/phpmyadmin)
# Buat database baru: aquamonitor
```

### Step 2 — Backend Laravel
```powershell
cd backend

# Install dependencies
composer install

# Setup environment
copy .env.example .env
php artisan key:generate

# Edit .env → sesuaikan DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Install Sanctum
php artisan install:api

# Migrasi + Seeder
php artisan migrate:fresh --seed

# Jalankan server
php artisan serve
# Backend jalan di http://localhost:8000
```

### Step 3 — Frontend React
```powershell
cd frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
# Frontend jalan di http://localhost:5173
```

### Step 4 — Akses Website
Buka browser → `http://localhost:5173`

**Akun Demo:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aquamonitor.com | password |
| Operator | operator@aquamonitor.com | password |
| Pengelola | pengelola@aquamonitor.com | password |

---

## 📁 Struktur Proyek

```
aquamonitor/
├── backend/              # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   └── Providers/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   ├── composer.json
│   └── .env.example
│
├── frontend/             # React 18 SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── contexts/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

---

## 📬 API Endpoints

### Publik (IoT Device)
- `POST /api/sensor-data` — Kirim data sensor
- `POST /api/simulasi` — Generate data dummy

### Auth
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

### Dashboard & Monitoring
- `GET /api/dashboard`
- `GET /api/dashboard/chart?jam=24`
- `GET /api/sensor-data` (paginated)
- `GET /api/sensor-data/terbaru`

### Export
- `GET /api/export/csv`

### Admin
- `GET|POST /api/admin/users`
- `PUT|DELETE /api/admin/users/{id}`
- `GET /api/admin/data/statistik`
- `POST /api/admin/data/hapus`
- `POST /api/admin/data/hapus-semua`
- `GET /api/admin/logs`
- `CRUD /api/admin/api-keys`

### Kalibrasi
- `GET /api/sensor/master`
- `PUT /api/sensor/master/{id}`

---

## 🧠 DSS (Decision Support System)

Skor per sensor dihitung dari deviasi terhadap nilai tengah batas normal:

| Skor | Klasifikasi | Rekomendasi |
|------|-------------|-------------|
| ≥ 85 | Sangat Baik | Sangat cocok untuk budidaya ikan air tawar |
| ≥ 70 | Baik | Cocok untuk budidaya ikan air tawar |
| ≥ 55 | Cukup Baik | Cukup cocok, kualitas air perlu diawasi ketat |
| ≥ 40 | Kurang Baik | Tidak cocok untuk budidaya. Direkomendasikan untuk irigasi |
| < 40 | Buruk | Tidak layak digunakan. Perlu penanganan segera |

---

## 📜 Lisensi

Proyek Capstone — Universitas Diponegoro © 2025
