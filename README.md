
Movie App – Backend (Local Setup Guide)

This is the backend service for the Movie App.
It provides REST APIs for managing movies with search, sorting, pagination, and authentication support.

---

Prerequisites

Make sure the following are installed:

* Node.js (version 16 or higher)
* npm or yarn
* MongoDB (local or MongoDB Atlas)

---

How to Run the Backend Locally

Step 1: Clone the repository

git clone git@github.com:Rohan-developer028/backend-movie.git
cd backend-movie

---

Step 2: Install dependencies

npm install

OR

yarn install

---

Step 3: Setup environment variables

Create a file named .env in the root directory and add:

PORT=5000
MONGO_URL=mongodb://localhost:27017/movie
JWT_SECRET=your_jwt_secret

If using MongoDB Atlas:

MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/movie

---

Step 4: Start MongoDB (if using local DB)

mongod

---

Step 5: Start the server

npm run dev

OR

npm start

The backend will run at:

[http://localhost:5000](http://localhost:5000)

---

API Base URL

[http://localhost:5000](http://localhost:5000)

---

Main API Endpoints

GET /movies
Get all movies (supports pagination)

GET /movies/search/sort
Search and sort movies

Query parameters:
q        → search keyword
sortBy  → title | rating | releaseDate | duration
order   → asc | desc
page    → page number
limit   → items per page

POST /movies
Add a new movie

PUT /movies/:id
Update movie details

DELETE /movies/:id
Delete a movie

---

Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* REST API

---

Notes

* Ensure MongoDB is running before starting the server
* API must be running for the frontend to work
* Use Postman or Thunder Client for API testing

---

Author

Rohan Gupta
