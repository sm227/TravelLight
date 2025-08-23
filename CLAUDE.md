# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TravelLight is a luggage storage and delivery service built with Spring Boot backend and React TypeScript frontend. The application allows travelers to store their luggage and have it delivered to desired locations.

**Tech Stack:**
- Backend: Spring Boot 3.4.3 with Java 21, PostgreSQL, Spring Security, JPA
- Frontend: React 19 with TypeScript, Vite, Material-UI, Styled Components
- Payment: PortOne V2 SDK
- Additional: Swagger/OpenAPI, AWS SDK for monitoring

## Development Commands

### Backend (Spring Boot)
```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun
# OR after building:
java -jar build/libs/TravelLight-0.0.1-SNAPSHOT.jar

# Run tests
./gradlew test

# Clean build
./gradlew clean build
```

### Frontend (React/TypeScript)
```bash
# Navigate to frontend directory
cd src/main/travellight

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Backend Structure (src/main/java/org/example/travellight/)
- **Main Application**: `TravelLightApplication.java` - Spring Boot entry point
- **Controllers**: REST API endpoints for users, reservations, delivery, payments, admin
- **Services**: Business logic layer with interfaces and implementations
- **Repositories**: JPA repositories for database operations
- **Entities**: JPA entities (User, Reservation, Delivery, Travel, Partnership, EventStorage)
- **DTOs**: Data transfer objects for API requests/responses
- **Config**: Security, mail, Swagger, and web configuration
- **Exception**: Global exception handling

### Frontend Structure (src/main/travellight/src/)
- **Components**: Reusable UI components including admin layout and navbar
- **Pages**: Route-specific components (Home, Login, Map, MyPage, Partner, admin pages)
- **Services**: API integration, authentication context, reservation service
- **Types**: TypeScript type definitions
- **Styles**: CSS files and styled components

### Key Features
- User authentication and management with Spring Security
- Luggage storage reservation system
- Delivery tracking and management
- Partnership system for storage locations
- Admin dashboard with system monitoring
- Payment integration with PortOne V2
- Multi-language support (i18n)
- Email notifications
- AWS service monitoring integration

### Database
- Uses PostgreSQL with JPA/Hibernate
- Connection configured in `application.yml`
- Entities use Lombok for boilerplate code reduction

### API Documentation
- Swagger UI available at `/swagger-ui.html` when backend is running
- API docs at `/api-docs`

### Development Notes
- Backend runs on port 8080 by default
- Frontend dev server runs on port 5173 with API proxy to backend
- Follow MVC pattern as specified in cursor rules
- Use Korean language for responses per cursor rules
- Payment functionality requires PortOne environment variables setup
- CSS styling uses Material-UI components and styled-components

## Environment Setup
Frontend requires environment variables in `src/main/travellight/.env`:
```
REACT_APP_PORTONE_STORE_ID=your_store_id
REACT_APP_PORTONE_CHANNEL_KEY=your_channel_key
REACT_APP_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
REACT_APP_API_BASE_URL=http://localhost:8080
```

## Testing
- Backend tests with JUnit and Spring Boot Test
- Run all tests: `./gradlew test`
- No frontend test configuration currently present