# Development Setup

## Prerequisites
- Install Java 21.
- Install Node.js (latest LTS version).
- Install Python 3.12.
- Install Docker and Docker Compose.
- Install PostgreSQL.

## Backend Setup
1. Navigate to the `backend/` directory.
2. Run `mvn clean install` to build the project.
3. Start the backend server using `mvn spring-boot:run`.

## Frontend Setup
1. Navigate to the `frontend/` directory.
2. Run `npm install` to install dependencies.
3. Start the development server using `npm run dev`.

## AI Service Setup
1. Navigate to the `ai-service/` directory.
2. Create a virtual environment: `python -m venv venv`.
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`.
5. Start the AI service: `uvicorn main:app --reload`.

## Database Setup
1. Start PostgreSQL.
2. Create a database named `aegisiq`.
3. Use the `.env.template` file to configure database credentials.

## Docker Setup
1. Navigate to the project root.
2. Run `docker-compose up` to start all services.

## Additional Notes
- Refer to the `docs/` folder for detailed documentation.
- Use the `.env.template` file to configure environment variables.