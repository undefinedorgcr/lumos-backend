# Lumos-Backend

## Overview
**Lumos-Backend** is the server-side component of the Lumos project, designed to manage user data, handle API requests, and interact with a MongoDB database. It provides endpoints to manage user accounts, including creating, updating, retrieving, and deleting user data.

The backend is built using **Next.js API routes**, leveraging MongoDB as the database to store user information. It follows best practices for RESTful APIs and is designed for ease of use and scalability.

## Features
- **User Management**: Create, read, update, and delete user profiles.
- **MongoDB Integration**: Seamlessly integrates with MongoDB to store and manage user data.
- **API Endpoints**: RESTful API design for various user actions.
- **Error Handling**: Comprehensive error handling for API requests.

## Technologies Used
- **Next.js**: Framework used for building the API routes and handling server-side logic.
- **MongoDB**: NoSQL database used to store user data.
- **TypeScript**: Provides static typing for better development experience and type safety.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Lumos-Backend.git
   cd Lumos-Backend
2. Install dependencies:

   ```bash
    npm install
3.	Set up your MongoDB database:
	- Create a MongoDB cluster on MongoDB Atlas or use a local MongoDB instance.
    - Add your MongoDB connection string to .env.local file (create the file if it doesn’t exist):
    ```bash
    MONGODB_URI=mongodb://your-db-uri-here
4.	Run the development server:
    ```bash
    npm run dev
5. Test GET Users Endpoint
    To verify that the setup is correct and that the `GET /api/users` endpoint is working, you can use the following `curl` command:
    ```bash
    curl --location 'http://localhost:3000/api/users'