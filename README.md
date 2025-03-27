# cave-digital-backend for Taskly App
# "This is a RESTful API built using Node.js, Express.js, and MongoDB. It provides authentication, CRUD operations, and more."

## 🚀 Features
✅ User Authentication (JWT-based)  
✅ CRUD operations for add task, upadate task, delete task, read all the task  
✅ Database integration with MongoDB  
✅ Error handling & validation  
✅ Secure API with environment variables  

## 🛠️ Technologies Used

- **Node.js** - Runtime environment  
- **Express.js** - Web framework for Node.js  
- **MongoDB** - NoSQL database  
- **Mongoose** - ODM for MongoDB  
- **JWT (JSON Web Token)** - Authentication  
- **Dotenv** - Environment variable management  
- **Bcrypt.js** - Password hashing  
- **Cors** - Cross-Origin Resource Sharing

 ## 🔧 Installation

### 1️⃣ Clone the Repository

git clone https://github.com/anjali1517/cave-digital-backend.git
cd your-repo

(change the main branch to master branch)

npm install

Create a .env file in the root directory and add:
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

▶️ Running the Server
Development Mode: npm run dev
Production Mode: npm start

📌 API Endpoints
🔹 Authentication
Method	Endpoint	Description
POST	/api/auth/signup	Register a new user
POST	/api/auth/login	Login user & get token
🔹 Users
Method	Endpoint	Description
GET	/api/tasks	Get all users
GET	/api/tasks/?id	Get user by ID
PUT	/api/update-tasks/?_id	Update user details
DELETE	/api/delete-tasks/?_id	Delete user
