# ApplyTrack — Job Application Tracker

ApplyTrack is a web application that helps users organize and track their job applications in one place.

## Features

- Add, view, edit, and delete job applications
- Search and filter application records
- Track application statuses and follow-up dates
- View application statistics on a dashboard
- Store application records in a MySQL database

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Java, Spring Boot, REST APIs
- **Database:** MySQL
- **Tools:** Visual Studio Code, Maven

## Running Locally

### Prerequisites

- Java Development Kit (JDK)
- MySQL Server

### Backend

1. Configure the database connection for your local MySQL setup.
2. Open a terminal in the project folder.
3. Run the backend on Windows:

   `.\mvnw.cmd spring-boot:run`

### Frontend

Open `frontend/index.html` using VS Code Live Server.

## Notes

This project is currently intended for local development. Do not commit database passwords or other secrets to GitHub.