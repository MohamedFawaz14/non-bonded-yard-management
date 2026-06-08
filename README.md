<div align="center">

# 🚢 NON-BONDED YARD MANAGEMENT SYSTEM

### Enterprise Yard Operations Dashboard

Modern React + FastAPI platform for container yard reporting, exit monitoring, security operations, and Gmail query automation.

<br>

<img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react">
<img src="https://img.shields.io/badge/FastAPI-0.115-green?style=for-the-badge&logo=fastapi">
<img src="https://img.shields.io/badge/Pandas-Data%20Processing-purple?style=for-the-badge&logo=pandas">
<img src="https://img.shields.io/badge/Vite-Build%20Tool-yellow?style=for-the-badge&logo=vite">

<br><br>

### 🌊 Deep Ocean Dashboard Design

### 📊 Real-Time Container Analytics

### 🚛 Exit Security Reports

### ✉ Gmail Query Automation

</div>

---

# ✨ Overview

The Non-Bonded Yard Management System is a modern web-based application built to automate daily yard operations.

The system processes operational Excel files and generates:

* Daily Yard Reports
* Exit Security Reports
* Container Movement Statistics
* Truck Sighting Reports
* Gmail Search Queries
* PDF Exports
* PNG/JPG Dashboard Exports

---

# 🎯 Core Modules

<table>
<tr>
<td width="33%">

## 📊 Dashboard

Generate operational reports from uploaded Excel files.

Features:

* FCL Offloaded
* FCL Loaded
* Empty Offloaded
* Empty Loaded
* Yard Stock
* Weighbridge Count
* Truck Sighting
* Container Shifting

</td>

<td width="33%">

## 🚪 Exit Report

Generate security gate reports.

Features:

* Exit Container List
* Truck Details
* Consignee Details
* Daily Security Summary
* Excel Export

</td>

<td width="33%">

## ✉ Gmail Generator

Generate Gmail search queries automatically.

Features:

* Auto Formatting
* Multiple Variations
* Clipboard Copy
* One Click Search Query

</td>
</tr>
</table>

---

# 🖥 Application Preview

## Dashboard

```text
╔══════════════════════════════════════════════════════╗
║            NON BONDED YARD DASHBOARD                ║
╠══════════════════════════════════════════════════════╣
║ Total Empties Offloaded                125          ║
║ Total Empties Loaded                    87          ║
║ Total FCL Offloaded                    163          ║
║ Total FCL Loaded                       142          ║
║ Total Empty Shifting                    31          ║
║ Total FCL Shifting                      18          ║
║ Truck Sighting                          54          ║
║ Total Weighbridge                      220          ║
║ Total Empties In Yard                  145          ║
║ Total FCL In Yard                      188          ║
╚══════════════════════════════════════════════════════╝
```

---

# ⚙ Technology Stack

## Frontend

| Technology  | Purpose           |
| ----------- | ----------------- |
| React       | UI Framework      |
| Vite        | Build Tool        |
| Axios       | API Communication |
| TailwindCSS | Styling           |
| React Icons | Icons             |

---

## Backend

| Technology | Purpose          |
| ---------- | ---------------- |
| FastAPI    | API Layer        |
| Pandas     | Excel Processing |
| OpenPyXL   | Excel Support    |
| Pillow     | PNG Export       |
| ReportLab  | PDF Export       |

---

# 🏗 System Architecture

```text
┌─────────────────────┐
│      React UI       │
└──────────┬──────────┘
           │
           │ Axios
           ▼
┌─────────────────────┐
│      FastAPI        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Excel Processing    │
│ Pandas Engine       │
└──────────┬──────────┘
           │
           ▼
 ┌──────────────┬──────────────┐
 │ PDF Export   │ PNG Export   │
 └──────────────┴──────────────┘
```

---

# 📂 Project Structure

```text
web
│
├── back-end
│   ├── main.py
│   ├── requirements.txt
│
├── src
│   ├── pages
│   │   ├── Dashboard.jsx
│   │   ├── ExitReport.jsx
│   │   └── GmailQuery.jsx
│   │
│   ├── services
│   │   └── api.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public
├── package.json
└── README.md
```

---

# 🚀 Local Installation

## Backend

```bash
cd back-end

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

## Frontend

```bash
npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# 📡 API Endpoints

## Dashboard Report

```http
POST /dashboard-report
```

Form Data

```text
file
received_date
exit_date
```

---

## Exit Report

```http
POST /exit-report
```

Form Data

```text
file
exit_date
```

---

## Gmail Query

```http
POST /gmail-query
```

Request

```json
{
  "truck_number": "UA244SD"
}
```

Response

```json
{
  "query": "\"UA244SD\" OR \"UA 244SD\" OR \"UA-244SD\""
}
```

---

# 📄 Export Features

## PDF Export

Professional formatted report with:

* Header
* Generated Time
* Statistics Table
* Corporate Layout

---

## PNG/JPG Export

Ocean Blue Dashboard Style

Includes:

* Report Header
* Dashboard Metrics
* Styled Table
* Branding

---

# 🛡 Error Handling

The application validates:

✅ Missing Files

✅ Invalid Excel Files

✅ Missing Columns

✅ Empty Reports

✅ Invalid Dates

✅ API Failures

✅ Clipboard Errors

✅ Export Errors

---

# 🌍 Deployment

## Frontend

Deploy on:

* Vercel
* Netlify

Build Command

```bash
npm run build
```

Output Folder

```bash
dist
```

---

## Backend

Deploy on:

* Render
* Railway

Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

# 🔥 Production Improvements

Future roadmap:

* User Authentication
* Role Management
* Report History
* Database Integration
* Email Notifications
* Live Dashboard
* Analytics Charts
* Mobile Responsive Version

---

# 👨‍💻 Developed For

Container Yard Operations

Security Gate Monitoring

Daily Operational Reporting

Non-Bonded Logistics Management

---

<div align="center">

### 🚢 Non-Bonded Yard Management System

Built with React + FastAPI

</div>
