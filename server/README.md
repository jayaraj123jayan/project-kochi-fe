# Project Kochi Backend Server

This is the backend server for Project Kochi, built with Node.js, Express, MySQL, and Socket.IO.

## Setup

1. Ensure MySQL is installed and running on your system.

2. Create the database and tables by running the SQL script in `schema.sql`:
   ```bash
   mysql -u root -p < schema.sql
   ```
   (Replace `root` with your MySQL username if different)

3. Update the `.env` file with your MySQL credentials:
   - DB_HOST: Your MySQL host (usually localhost)
   - DB_USER: Your MySQL username
   - DB_PASSWORD: Your MySQL password
   - DB_NAME: project_kochi (as created in schema.sql)
   - JWT_SECRET: A secret key for JWT tokens
   - PORT: 8080

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the server:
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:8080.

## API Endpoints

See the main README.md in the frontend project for API documentation.

## WebSocket

Real-time messaging is handled via Socket.IO on the same port.

Events:
- sendMessage: Send a message
- receiveMessage: Receive messages from other users