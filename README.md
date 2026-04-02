# Campus Complaint System

A web-based NoSQL system for reporting and managing campus issues such as facility problems, equipment failures, and network issues.  
This project was developed for a NoSQL assignment and demonstrates CRUD operations, search, and reporting using MongoDB.

## Project Overview

The Campus Complaint System allows users to submit complaints through a web form and manage them through a web interface.  
The system stores complaint data in MongoDB as documents and supports:

- Create / Add complaint
- Read / View all complaints
- Search complaints
- Update complaint status
- Delete complaint
- Reporting summary

## Features

- Submit a new complaint
- View all complaints
- Search complaints by title, location, or category
- Update complaint status
- Delete complaint
- View status summary report
- Store complaint data in MongoDB Atlas

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
The data model is suitable for NoSQL because it includes:

- Flexible fields
- Nested object:
  - `reportedBy`
- Array field:
  - `tags`

Example complaint document:

```json
{
  "title": "Projector not working",
  "category": "Equipment",
  "description": "The projector in Room CB2401 cannot display.",
  "location": "CB2401",
  "urgency": "High",
  "status": "Pending",
  "reportedBy": {
    "name": "Digi",
    "studentId": "6712345"
  },
  "tags": ["projector", "classroom", "equipment"],
  "createdAt": "2026-04-02T10:15:24.919Z"
}
