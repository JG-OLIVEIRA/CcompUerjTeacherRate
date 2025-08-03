# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Setup

To run this project, you need to set up your environment variables.

1.  Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
2.  **Set the `DATABASE_URL`**: Open the `.env` file and replace the placeholder with your actual PostgreSQL connection string. It should look something like this:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?ssl=true"
    ```
    **Important**: For production databases that require a secure connection, ensure you append `?ssl=true` to the end of your URL.

## Running the Database Schema

Before you can run the application, you need to create the necessary tables in your database. Connect to your PostgreSQL database and execute the commands found in the `schema.sql` file. This will set up the `teachers`, `subjects`, `reviews`, and `professor_requests` tables.
