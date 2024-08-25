
```markdown
# Event App Backend

## Project Overview

This backend is part of an Event App built using Node.js and Express. It provides a RESTful API for managing users, events, and related functionalities such as authentication, event uploads, favorites, and more. The backend also integrates third-party services like ImageKit for image uploads and Nodemailer for sending emails, such as OTPs for password resets.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Image Upload](#image-upload)
- [Email Notifications](#email-notifications)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Register, login, and OTP-based password reset.
- **Event Management**: Create, view, and search for events, including user-specific events.
- **Favorites**: Add and view favorite events.
- **Profile Management**: Retrieve current user details.
- **Image Upload**: Upload event images using ImageKit.
- **Email Notifications**: Send OTPs and other notifications using Nodemailer.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB/Mongoose**: NoSQL database for data storage.
- **ImageKit**: Cloud-based image storage and processing.
- **Nodemailer**: Email sending service.
- **JWT**: JSON Web Tokens for authentication.
- **Bcrypt.js**: For hashing passwords securely.

## Prerequisites

- **Node.js**: Installed on your machine.
- **MongoDB**: Access to a MongoDB database.
- **ImageKit Account**: For image uploads.
- **Nodemailer Configuration**: SMTP settings for sending emails.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/pranjal0981/event-app-backend.git
   cd event-app-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file in the root directory:
   ```bash
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   MONGO_URI=your_mongodb_uri
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_email
   SMTP_PASS=your_smtp_password
   ```

4. Run the application:
   ```bash
   npm start
   ```

## API Endpoints

### User Authentication

- **POST `/user/registerUser`**: Register a new user.
- **POST `/user/login`**: Log in an existing user.
- **POST `/user/currentUser`**: Get details of the currently logged-in user (requires authentication).
- **POST `/user/request-otp`**: Request an OTP for password reset.
- **POST `/user/verify-otp`**: Verify OTP and reset the password.

### Event Management

- **POST `/user/upload-event`**: Upload a new event (requires authentication).
- **GET `/user/getEvents`**: Retrieve all events.
- **GET `/user/getEvent/:id`**: Get details of a specific event by ID.
- **GET `/user/events/search`**: Search for events by query.
- **GET `/user/your-events/:id`**: Get all events uploaded by the current user (requires authentication).

### Favorites

- **POST `/user/toggle-favorite`**: Toggle an event as a favorite (requires authentication).
- **GET `/user/getFavoriteEvents`**: Retrieve all favorite events of the current user (requires authentication).

## Authentication

Authentication is handled via JSON Web Tokens (JWT). Protected routes require a valid JWT in the `Authorization` header.

## Image Upload

Images are uploaded using ImageKit. Ensure you have your ImageKit credentials set up in the environment variables.

## Email Notifications

Nodemailer is used for sending emails, such as OTPs for password resets. Configure your SMTP settings in the environment variables.

## Error Handling

Errors are handled via custom middleware, providing consistent error responses for API clients.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any changes or suggestions.

## License

This project is licensed under the MIT License.
```

This `README.md` provides a comprehensive guide to your backend, including setup instructions, API endpoints, and details on the technologies used. Adjust the placeholders and configurations as necessary to match your specific project setup.