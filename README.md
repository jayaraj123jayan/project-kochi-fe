# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Backend APIs

This project requires a backend server running on `http://localhost:8080` to handle authentication, data fetching, and real-time messaging. Below is a list of required API endpoints and WebSocket events.

### Authentication

- **POST /login**
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "email": "string", "username": "string", "goal": "string", "tenantId": "number", "role": "string", "token": "string" }` (on success)
  - Error: `{ "message": "Invalid credentials" }` (401)

- **POST /admin/login**
  - Request: `{ "email": "string", "password": "string" }`
  - Response: Same as /login, but only for admin/tenant_admin roles

### Admin APIs

- **POST /admin/tenants** (Admin only)
  - Request: `{ "name": "string" }`
  - Response: `{ "id": "number", "name": "string" }`

- **GET /admin/tenants** (Admin only)
  - Response: Array of tenants

- **POST /admin/users** (Admin or Tenant Admin)
  - Request: `{ "email": "string", "password": "string", "username": "string", "role": "customer|trainer|tenant_admin", "tenantId": "number" }`
  - Response: Created user object

- **GET /admin/all-users** (Admin only)
  - Response: Array of all users with tenantId

### User Profile

- **GET /profile**
  - Headers: Authorization token (if required)
  - Response: `{ "email": "string", "username": "string", "goal": "string" }`

- **PUT /profile**
  - Request: `{ "goal": "string" }` (or other updatable fields)
  - Response: Updated user object

### Trainer

- **GET /trainer**
  - Response: `{ "name": "string", "specialization": "string" }` or null if no trainer

- **POST /trainer**
  - Request: `{ "name": "string" }`
  - Response: Assigned trainer object

- **PUT /trainer**
  - Request: `{ "instructions": "string" }` (for trainer to update)
  - Response: Updated trainer object

### Workout Plans

- **GET /workouts**
  - Response: Array of weekly plans, e.g., `[ { "day": "Monday", "exercises": "Push-ups, Squats" }, ... ]`

- **POST /workouts**
  - Request: `{ "plans": [ { "day": "string", "exercises": "string" } ] }`
  - Response: Success confirmation

### Real-time Messaging (WebSocket)

- Connect to WebSocket server at `ws://localhost:8080` (assuming Socket.IO)
- Events:
  - **sendMessage**: `{ "text": "string", "type": "text" | "image", "filename"?: "string" }`
  - **receiveMessage**: Same as above, emitted to other clients

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
