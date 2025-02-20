# AI-Powered Task Generator

## Overview

This project is an intelligent task management system that leverages OpenAI's GPT-4 to automatically generate structured task lists from project descriptions. It helps project managers and team members break down project requirements into actionable, prioritized tasks.

## Features

- Automatic task generation from project descriptions
- AI-powered task breakdown with priority levels
- Structured task output with detailed descriptions
- Task persistence in database
- RESTful API interface

## Technical Stack

- Backend: Node.js
- AI Integration: OpenAI GPT-4
- Database: Postgres database
- API: RESTful architecture

## Task Structure

Each generated task includes:

- Title: Clear and concise task name
- Description: Detailed explanation of what needs to be done
- Priority: HIGH, MEDIUM, or LOW
- Status: Starts as TO_DO
- Estimated Time: Time estimation in hours

## API Endpoints

### Generate Tasks

```
POST /api/generate-tasks
```

Request Body:

```json
{
  "projectDescription": "Your project description here",
  "userId": "user_id"
}
```

Response:

```json
{
  "message": "Tasks generated successfully",
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "priority": "HIGH|MEDIUM|LOW",
      "status": "TO_DO",
      "estimated_time": 2
    }
  ]
}
```

## Setup Requirements

1. Node.js environment
2. OpenAI API key
3. Postgres database setup
4. Required environment variables:
   - OpenAI API configuration
   - Database connection string
   - Other necessary environment variables

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables
4. Start the server:
   ```bash
   npm start
   ```

## Error Handling

The system includes robust error handling for:

- Invalid input validation
- OpenAI API response parsing
- Database operations
- General server errors

## Security Considerations

- Input validation for all API endpoints
- User authentication required
- Secure storage of API keys and sensitive data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## MIT License

Copyright (c) 2025 ishejajunior
