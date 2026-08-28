# 🐾 PetCare — React Frontend

Frontend application for **PetCare**, a Full Stack platform developed as a collaborative project during the **Certified Tech Developer program at Digital House**.

The platform was designed to provide users with an intuitive interface to explore pet-related services while offering administrators tools to manage services, categories, and users.

> This repository contains the frontend application.  
> The backend is available in a separate repository built with Java and Spring Boot.

---

## 🚀 About the Project

PetCare is a web platform focused on connecting users with services related to pet care.

The application includes a public-facing experience where users can explore available services and categories, along with an authenticated administration area for managing platform content.

The project was developed as a team project using a Full Stack architecture with separate frontend and backend applications.

---

## ✨ Main Features

### 👤 User Experience

- Browse available pet care services
- Search for services
- Filter services
- Explore services by category
- View detailed information about a service
- Browse service image galleries
- Navigate through a responsive web interface

### 🔐 Authentication & Authorization

- Authentication context
- Protected routes
- Role-based access to administration features
- Bearer token authentication for API requests

### ⚙️ Administration

Authorized administrators can manage different areas of the platform:

- Services
- Categories
- Users
- Administrator profile
- Create new services
- Edit existing services
- Manage platform information

---

## 🛠️ Tech Stack

### Core

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

### Frontend Libraries

![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Styled Components](https://img.shields.io/badge/Styled_Components-DB7093?style=flat-square&logo=styledcomponents&logoColor=white)

Additional libraries include:

- React Hook Form
- React Datepicker
- React Toastify
- React Icons

---

## 🏗️ Project Structure

```text
src/
├── auth/          # Authentication context and protected routes
├── components/    # Reusable UI components
├── data/          # Local application data
├── layouts/       # Shared page layouts
├── pages/         # Application views
│   ├── admin/     # Administration views
│   └── services/  # Service-related views
├── services/      # API integration
├── styles/        # Application styles
├── utils/         # Utility functions
├── App.jsx        # Main routing configuration
└── main.jsx       # Application entry point
```

---

## 🔄 Frontend Architecture

The frontend communicates with the PetCare backend through REST APIs.

```text
┌─────────────────┐
│   React + Vite  │
│    Frontend     │
└────────┬────────┘
         │
         │ Axios / REST API
         │ Bearer Authentication
         ▼
┌─────────────────┐
│  Spring Boot    │
│     Backend     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      MySQL      │
└─────────────────┘
```

---

## 🔐 Protected Administration

The application includes an administration route protected by authentication and role validation.

Only users with the required `ADMIN` role can access the administration area.

The frontend sends authenticated API requests using Bearer tokens.

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

Replace the URL with the address of your PetCare backend.

---

## 💻 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/LuisaVargas-9/petcare-react-frontend.git
```

### 2. Enter the project directory

```bash
cd petcare-react-frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create the `.env` file:

```env
VITE_API_URL=<YOUR_BACKEND_URL>
```

### 5. Start the development server

```bash
npm run dev
```

Vite will display the local URL where the application is running.

---

## 🔗 Backend

The backend was developed using:

- Java 21
- Spring Boot
- Spring Security
- JWT
- JPA / Hibernate
- MySQL
- AWS S3
- OpenAPI / Swagger

👉 [View PetCare Backend Repository](https://github.com/LuisaVargas-9/proyectoIntegradorBackend-team1)

---

## 👥 Project Context

PetCare was developed collaboratively as part of the **Certified Tech Developer program at Digital House**.

The project involved teamwork across frontend, backend, integration, and deployment tasks using Git and GitHub.

### My Participation

I participated as a member of the development team. This repository is included in my portfolio to showcase the technologies, Full Stack workflow, and collaborative development experience involved in the project.

**Luisa Vargas**  
Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Luisa_Vargas-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/luisa-vargas-233494200/)

---

## 📌 Repository Status

This repository is maintained primarily as part of my **software development portfolio** and represents one of the collaborative Full Stack projects completed during my professional developer training.
