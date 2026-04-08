# Campus Complaint System

A web-based NoSQL project for reporting and managing campus issues such as facility, equipment, and network problems.

## Features

- Add a new complaint
- View all complaints
- Search complaints
- Update complaint status
- Delete complaints
- View status summary report

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- HTML
- CSS
- JavaScript

## NoSQL Concept

This project uses MongoDB, a document-oriented NoSQL database.

Each complaint is stored as a document.  
The data model includes:
- flexible fields
- nested object: `reportedBy`
- array field: `tags`

## Project Structure

```text
CampusComplaint/
├── models/
├── public/
├── routes/
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5050
```

Run the server:

```bash
node server.js
```

## Usage

Open these pages in your browser:

- `http://localhost:5050/index.html`
- `http://localhost:5050/list.html`
- `http://localhost:5050/report.html`

## API Endpoints

- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/search/:keyword`
- `PUT /api/complaints/:id`
- `DELETE /api/complaints/:id`
- `GET /api/reports/status-summary`

## Future Work

- Add user authentication
- Add image upload
- Add more report types
- Improve UI design
