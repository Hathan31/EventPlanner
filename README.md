# Aplicación Móvil con React Native y Node.js

## Descripción del Proyecto
Esta es una aplicación móvil desarrollada con **React Native** y **Expo** para el frontend, y un backend creado con **Node.js**, **Express**, y **MongoDB**. El proyecto combina una experiencia de usuario intuitiva en dispositivos móviles con una API robusta y segura para manejar datos y funcionalidades en el servidor.

---

## Tecnologías Utilizadas

### Frontend
- **React Native**: Framework para crear aplicaciones móviles multiplataforma.
- **Expo**: Plataforma para facilitar el desarrollo, construcción y despliegue de aplicaciones móviles.
- **React Navigation**: Navegación fluida entre pantallas.

### Backend
- **Node.js**: Entorno de ejecución de JavaScript en el servidor.
- **Express**: Framework minimalista para construir APIs.
- **MongoDB**: Base de datos NoSQL para almacenar datos de manera eficiente.
- **JWT**: Autenticación basada en tokens para proteger las rutas del backend.

---

## Características Principales

### Frontend
- **Interfaz de Usuario**:
  - Diseño atractivo y adaptativo para dispositivos Android e iOS.
  - Navegación intuitiva con menús y transiciones suaves.
- **Funcionalidades**:
  - Registro e inicio de sesión de usuarios.
  - Gestión de datos en tiempo real con llamadas a la API.
  - Acceso a características del dispositivo como cámara y notificaciones.

### Backend
- **API REST**:
  - Endpoints para gestionar usuarios, datos y operaciones específicas.
- **Autenticación y Seguridad**:
  - Uso de **JWT** para autenticar a los usuarios.
  - Validación de datos con **Joi**.
- **Base de Datos**:
  - Almacenamiento de usuarios y datos relacionados en **MongoDB**.

---

## Instalación y Configuración

### Requisitos Previos
- **Node.js** instalado en el sistema.
- **Expo CLI** instalado globalmente:
  ```bash
  npm install -g expo-cli
  ```
- **MongoDB** configurado y ejecutándose.

### Backend
1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO_BACKEND>
   ```
2. Navega al directorio del backend:
   ```bash
   cd backend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables:
   ```env
   PORT=5000
   MONGO_URI=<URL_DE_CONEXIÓN_MONGO>
   JWT_SECRET=<SECRETO_PARA_TOKENS>
   ```
5. Inicia el servidor:
   ```bash
   npm start
   ```

### Frontend
1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO_FRONTEND>
   ```
2. Navega al directorio del frontend:
   ```bash
   cd frontend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia la aplicación Expo:
   ```bash
   expo start
   ```
