# GitHub Repository Webhook Receiver

## Project Overview

This project is a real-time (or near real-time) web application designed to monitor and display significant events occurring in a GitHub repository. Whenever a code `PUSH`, `PULL_REQUEST`, or `MERGE` action happens in a designated "action-repo" repository, this application captures the event, stores minimal necessary data in a MongoDB database, and then displays it on a clean web interface. The data is reflected in the UI.

It serves as a live activity log for your code project, keeping you updated on the latest changes.

## Features

*   **Webhook Listener:** Automatically receives and processes GitHub webhook events for specific actions.
*   **Event Storage:** Stores parsed event data securely in a MongoDB database.
*   **Real-time UI Updates:** A web frontend that polls the backend every 15 seconds to fetch and display the latest events.
*   **Formatted Display:** Presents events in a human-readable format, distinguishing between PUSH, PULL REQUEST, and MERGE actions.

## Live Demo

You can view the live deployed application here:
*   **Main Application URL:** [https://github-webhook-repo.onrender.com/](https://github-webhook-repo.onrender.com/)
*   **Events API Endpoint:** [https://github-webhook-repo.onrender.com/events](https://github-webhook-repo.onrender.com/events) (This shows the raw JSON data the frontend consumes)

## Application Flow

The entire process works seamlessly through these steps:

1.  **GitHub Action:** A developer performs a `PUSH`, `PULL_REQUEST`, or `MERGE` action in the designated `action-repo`.
2.  **GitHub Webhook Triggered:** GitHub, configured with a webhook, automatically sends a JSON message (payload) about this action to a specific URL provided by this `webhook-repo`.
3.  **Webhook Reception (Flask Backend):** This `webhook-repo`'s Flask application specifically the `/webhook` endpoint receives the incoming GitHub webhook message.
4.  **Data Extraction & Storage (MongoDB):** The Flask app extracts only the essential information (author, action type, branches, timestamp) from the large webhook payload and saves it as a new document into a MongoDB collection.
5.  **UI Polling:** The JavaScript code running in the user's web browser (on the main application URL) periodically (every 15 seconds) requests the latest events from this Flask app's `/events` API endpoint.
6.  **Data Delivery to UI:** The Flask app fetches the latest events from MongoDB and sends them back to the browser as JSON data.
7.  **UI Display:** The JavaScript on the frontend formats this JSON data into readable messages and dynamically updates the web page, showing the most recent repository activities.

## Technologies Used

*   **Backend:**
    *   **Python 3:** The programming language.
    *   **Flask:** A lightweight Python web framework for building the backend API.
    *   **Gunicorn:** A Python WSGI HTTP server used for deploying the Flask application.
    *   **PyMongo:** A Python driver for interacting with MongoDB.
    *   **python-dotenv:** For managing environment variables (like database connection strings).
    *   **python-dateutil:** For robust parsing of various date and time formats.
*   **Database:**
    *   **MongoDB:** A NoSQL document database used to store event data.
*   **Frontend:**
    *   **HTML5:** For structuring the web page content.
    *   **CSS3:** For styling and design of the user interface.
    *   **JavaScript:** For dynamic content loading, API calls, and updating the UI.
*   **Deployment:**
    *   **Render:** Cloud platform used for hosting and deploying the application.

## Project Structure
