# Campus Complaint System

A web-based NoSQL project for reporting and managing campus issues such as facility, equipment, network, and cleanliness problems.

## Features

- Add a new complaint
- View all complaints
- Search complaints by top-level, nested, and array-based fields
- Edit complaint details and status
- Delete complaints
- View complaint update history
- View reports for status, category, urgency, and tag usage

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

Each complaint is stored as a document. The data model demonstrates NoSQL concepts through:
- flexible category-specific fields
- nested objects such as `reportedBy.contact`
- nested objects such as `extraDetails.location` and `extraDetails.device`
- arrays such as `tags` and `attachments`
- embedded update history through the `updates` array of subdocuments

## Project Structure

```text
CampusComplaint/
├── models/
│   └── Complaint.js
├── public/
│   ├── app.js
│   ├── index.html
│   ├── list.html
│   ├── report.html
│   └── style.css
├── routes/
│   └── complaintRoutes.js
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
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
- `GET /api/reports/category-summary`
- `GET /api/reports/urgency-summary`
- `GET /api/reports/tag-summary`

## Future Work

- Add real file upload support for attachments
- Add authentication and role-based access
- Add more advanced reports and dashboard charts
- Improve UI design and responsiveness
