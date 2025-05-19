# Social Medical Data - Gestión Odontológica

Este repositorio contiene el frontend (React + Vite + Material UI) y el backend serverless (Node.js + AWS Lambdas y AWS RDS) para la gestión odontológica.

## Estructura del proyecto

```
/social-medical-data
  ├── frontend/         # Aplicación web (React)
  └── backend/          # API serverless (Node.js, AWS SAM)
```

## Requisitos

- Node.js 18+
- AWS CLI y AWS SAM CLI (para backend)
- npm o yarn

## Inicialización

### 1. Clonar el repositorio

```sh
git clone https://github.com/Hamil1/Social-Medical-Data-Test.git
cd social-medical-data
```

### 2. Frontend

```sh
cd frontend
npm install
npm run dev
```

La app estará disponible en [http://localhost:5173](http://localhost:5173)

### 3. Backend (modo local con SAM)

```sh
cd backend/ortodoncia-api
npm install
sam local start-api
```

La API estará disponible en [http://localhost:3000](http://localhost:3000)

## Despliegue

### Frontend

- Compilar con `npm run build` en la carpeta `frontend`.
- Subir el contenido de `frontend/dist` a un bucket S3 y servir con CloudFront.

### Backend

- Desplegar con AWS SAM:

```sh
cd backend/ortodoncia-api
sam build
sam deploy --guided
```

## Notas

- El login de ejemplo usa usuarios y contraseñas mock (ver `backend/ortodoncia-api/src/mocks/usuarios.json`).
- El README puede ser actualizado con instrucciones más detalladas según el entorno de despliegue final.
