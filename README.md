# Date Time Range Picker Application

This application allows users to choose a date and time range, which is then saved to a database and an email confirmation is sent. Chosen date ranges become marked as inactive.

## Prerequisites

1.  **Node.js and npm:** Ensure you have Node.js (which includes npm) installed. Download from [https://nodejs.org/](https://nodejs.org/).
2.  **MongoDB:** A running MongoDB instance is required.
    *   Install locally: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
    *   Or use a cloud service like MongoDB Atlas: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3.  **Email Server/Service:** Access to an SMTP server or an email sending service (e.g., SendGrid, Mailgun) is needed for email notifications.

## Setup and Running Locally

Follow these steps to run the application on your local machine:

### 1. Backend Server (Node.js)

*   **Navigate to the server directory:**
    ```bash
    cd date-time-range-app/server
    ```
*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Set up environment variables:**
    Create a `.env` file in the `server` directory (`date-time-range-app/server/.env`).
    Add the following variables, replacing placeholders with your actual configuration:

    ```env
    MONGODB_URI=mongodb://localhost:27017/dateTimeRangeApp # Or your MongoDB Atlas connection string
    PORT=3001 # Or any port you prefer for the backend

    # Email Configuration
    EMAIL_HOST=smtp.example.com
    EMAIL_PORT=587 # Or 465 for SSL
    EMAIL_USER=your-email-username
    EMAIL_PASS=your-email-password
    EMAIL_FROM=noreply@example.com # The "from" address for emails
    ```
    *Note on `EMAIL_PORT`*: The server code sets `secure: process.env.EMAIL_PORT == 465`. If your SMTP server uses port 465, it's typically SSL. For port 587 (TLS/STARTTLS), `secure` should effectively be `false`.

*   **Start the server:**
    ```bash
    npm start
    ```
    (This assumes a `start` script like `"start": "node server.js"` in `server/package.json`. If not, use `node server.js`.)
    The backend server should now be running (e.g., on `http://localhost:3001`).

### 2. Frontend Client (React)

*   **Open a new terminal window/tab.**
*   **Navigate to the client directory:**
    ```bash
    cd date-time-range-app/client
    ```
*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Start the React development server:**
    ```bash
    npm start
    ```
    This will usually open the application in your web browser (e.g., at `http://localhost:3000`). The React app is configured to proxy API requests to the backend.

## Project Structure

-   `date-time-range-app/`: Root project directory.
    -   `client/`: Contains the React frontend application.
        -   `src/components/DateTimeRangePicker.js`: Main UI component.
    -   `server/`: Contains the Node.js backend application.
        -   `server.js`: Main server file with API endpoint definitions.
    -   `README.md`: This file.

## API Endpoints (Backend)

-   `POST /api/time-range`: Saves a new time range.
-   `GET /api/time-ranges/stored`: Fetches all stored time ranges.
-   `PUT /api/time-range/:id/inactive`: Marks a time range as inactive.
-   `POST /api/time-range/send-email`: Sends an email confirmation.
