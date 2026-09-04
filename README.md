# 🎓 ICFES Smart Study — Plataforma Inteligente de Preparación Saber 11

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://icfes-smart-study-zeta.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://icfes-smart-study-api.onrender.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](#)

> Plataforma educativa integral impulsada por Inteligencia Artificial para la preparación y entrenamiento de estudiantes en las pruebas de estado **ICFES Saber 11 en Colombia**.

---

## 🌐 Enlaces de Acceso Rápido

- 🚀 **Aplicación Web en Vivo (Frontend):**  
  👉 **[https://icfes-smart-study-zeta.vercel.app/](https://icfes-smart-study-zeta.vercel.app/)**
- ⚙️ **API REST en Vivo (Backend):**  
  👉 **[https://icfes-smart-study-api.onrender.com/](https://icfes-smart-study-api.onrender.com/)**

---

## 🚀 Características Principales

- 🤖 **Generación de Preguntas con IA:** Creación de preguntas tipo ICFES contextualizadas (Matemáticas, Lectura Crítica, Ciencias Naturales, Sociales y Ciudadanas, e Inglés) evaluando competencias y pensamiento crítico.
- 💡 **Retroalimentación Inmediata y Justificaciones Pedagógicas:** Explicación detallada de por qué cada opción es correcta o incorrecta.
- ⏱️ **Simulador con Temporizador Real:** Cronómetro interactivo adaptado al tiempo promedio por pregunta en la prueba real.
- 💬 **Tutor Virtual con Inteligencia Artificial:** Asistente especializado en pruebas ICFES para resolver dudas en cualquier momento.
- 📊 **Integración Low-Code con Google Sheets:** Registro automático de calificaciones, rendimiento y estadísticas de cada simulacro vía Google Apps Script Webhooks.

---

## 🏗️ Arquitectura del Sistema

```
                      ┌────────────────────────────────────────┐
                      │          FRONTEND (Vercel)             │
                      │       React 19 + Vite + Tailwind       │
                      │  https://icfes-smart-study-zeta...     │
                      └──────────────────┬─────────────────────┘
                                         │
                                   Peticiones HTTPS
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │           BACKEND (Render)             │
                      │        Node.js + Express API           │
                      │  https://icfes-smart-study-api...      │
                      └────────┬───────────────────┬───────────┘
                               │                   │
                     Generación de IA        Registro de Notas
                               │                   │
                               ▼                   ▼
                     ┌──────────────────┐ ┌────────────────────┐
                     │    GROQ CLOUD    │ │   GOOGLE SHEETS    │
                     │  (Qwen 3.8-27B)  │ │ (Apps Script Webhook│
                     └──────────────────┘ └────────────────────┘
```

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Axios.
- **Backend:** Node.js, Express 5, JWT, Bcrypt, MongoDB / Mongoose, Groq / OpenAI SDK.
- **Infraestructura:** Vercel (Frontend SPA), Render (Backend Web Service), Google Apps Script (Hojas de cálculo).

---

## ⚙️ Variables de Entorno

### Backend (`backend/.env` / Render)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/icfes-smart-study
JWT_SECRET=supersecretjwtkey_12345
OPENAI_API_KEY=gsk_tu_api_key_de_groq
APPSCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/<ID_DEPLOYMENT>/exec
FRONTEND_URL=https://icfes-smart-study-zeta.vercel.app
AI_MODEL=qwen/qwen3.8-27b
```

### Frontend (`frontend/.env` / Vercel)
```env
VITE_API_URL=https://icfes-smart-study-api.onrender.com/api
```

---

## 💻 Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Reyleal360/ICFES-Smart-Study.git
   cd ICFES-Smart-Study
   ```

2. **Iniciar Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Iniciar Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Accede localmente en: `http://localhost:5173`.