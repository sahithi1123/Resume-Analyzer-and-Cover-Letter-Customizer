# AI-Powered Resume & Cover Letter Customizer

An enterprise-grade, full-stack AI platform built with **React (Vite, Axios, Three.js)** and **Spring Boot 3 (Java 17/21, MySQL, Google Gemini)**.

---

## What It Does & Why It's Useful
Job seekers often struggle to tailor their master resume and cover letter for specific job postings. This application:
1. **Parses Master Resumes**: Extracts and sanitizes text from `.pdf` documents using **Apache PDFBox** and `.docx` documents using **Apache POI**.
2. **ATS Keyword Gap Analysis**: Analyzes target job descriptions against the master resume, highlights missing keywords, calculates match scores, and provides actionable placement recommendations.
3. **STAR Impact Bullet Point Rewriting**: Converts passive resume bullet points into quantifiable, high-impact accomplishments using the **STAR method** (Situation, Task, Action, Result) with strong action verbs and metrics.
4. **Tailored Cover Letter Generation**: Crafts bespoke, persuasive cover letters aligned with the candidate's achievements and target company culture.
5. **Prompt Rollback & Prompt Erasing**: Enables users to view the exact prompt iterations sent to Google Gemini, step backward, or **erase buggy/hallucinated prompts** to restore a clean baseline.
6. **3D Interactive WebGL Visualizers**: Features a holographic 3D document scanner and orbiting ATS semantic vector sphere built with **Three.js** and **React Three Fiber**.
7. **Cross-Platform Responsive UI**: Seamlessly works on desktop PCs, tablets, Android smartphones, and iOS devices with touch controls and mobile drawers.
8. **Enterprise Security**: Uses stateless **Spring Security 6 + JWT authentication** with BCrypt password hashing. **No AI API keys are exposed to the frontend**.

---

## Named React Patterns Implemented

| Pattern Name | How & Where It Is Used | File Location |
| :--- | :--- | :--- |
| **Container / Presentational Pattern** | Stateful container logic (`ResumeCustomizerContainer`) is cleanly decoupled from pure presentational components (`KeywordDiffView`, `BulletRewriterView`, `CoverLetterView`, `PromptRollbackDrawer`). | `frontend/src/components/ResumeCustomizerContainer.jsx` & `frontend/src/components/*View.jsx` |
| **Compound Component Pattern** | The multi-step customization wizard is structured as a compound component (`<Wizard><Wizard.Step /><Wizard.Navigation /></Wizard>`), sharing state implicitly via internal context. | `frontend/src/components/Wizard.jsx` |
| **Provider / Context Pattern** | Global authentication state and active customization session data are distributed across the component tree without prop drilling. | `frontend/src/components/AuthContext.jsx` & `frontend/src/components/CustomizerContext.jsx` |
| **Custom Hooks Pattern** | Reusable business logic, file upload validations, responsive device detection, and AI interactions are extracted into cohesive custom hooks. | `frontend/src/hooks/usePromptHistory.js`, `useResumeParser.js`, `useGeminiCustomizer.js`, `useResponsive.js` |
| **State Reducer Pattern** | Handles complex state transitions for prompt revision history, undo/redo rollback, and prompt erasing via a predictable reducer function. | `frontend/src/reducers/promptHistoryReducer.js` |

> [!NOTE]
> All React `.jsx` files are centralized directly inside `frontend/src/components/`.

---

## Backend Configuration (`application.properties`)

The backend resources use standard Spring Boot `application.properties`:
```properties
server.port=8080
server.servlet.context-path=/

spring.datasource.url=jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/${MYSQL_DB:resume_customizer_db}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=${MYSQL_USER:root}
spring.datasource.password=${MYSQL_PASSWORD:root}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

app.jwt.secret=${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
app.jwt.expiration-ms=86400000

# Google Gemini Multi-Model Fallback Configuration
app.gemini.api-key=${GEMINI_API_KEY:}
app.gemini.model=${GEMINI_MODEL:gemini-1.5-flash-latest}
app.gemini.api-url=${GEMINI_API_URL:https://generativelanguage.googleapis.com/v1beta/models}
app.gemini.timeout-ms=45000
```

---

## Gemini Multi-Model Dynamic Fallback Engine
To prevent `404 Not Found: models/gemini-1.5-flash is not found for API version v1beta` errors:
- The backend automatically tries a prioritized sequence of active model endpoints:
  1. `gemini-1.5-flash-latest` (v1beta)
  2. `gemini-1.5-flash` (v1)
  3. `gemini-pro` (v1beta & v1)
  4. `gemini-1.5-pro-latest`
  5. `gemini-2.0-flash`
- Caches the first working model dynamically for fast subsequent calls.
- If all external API calls are blocked or unconfigured, falls back to the intelligent mock generator with zero downtime.

---

## Getting Started

### 1. MySQL Database Setup
```sql
CREATE DATABASE IF NOT EXISTS resume_customizer_db;
```

### 2. Backend Setup & Launch
```powershell
cd backend
$env:GEMINI_API_KEY="your_actual_gemini_api_key"
$env:MYSQL_PASSWORD="your_mysql_password"
mvn clean spring-boot:run
```

### 3. Frontend Setup & Launch
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
