# Fibu Trainer App

## Tech Stack

- Frontend: Next.js, React (TypeScript), Redux Toolkit, Tailwind CSS  
- Backend: Node.js, NextAPI, TypeScript  
- Database: MongoDB  

## Prerequisites

- Node.js (v22 or newer)  
- npm or yarn  
- Git  

## Installation

```bash
git clone https://github.com/x47base/fibu-trainer-app.git
cd fibu-trainer-app
npm install
npm install --save-dev ts-node typescript @types/node cross-env
```

## Data Setup

1. Ensure you have MongoDBCompass installed and the MongoDB service is running.
2. Setup the task data
   ```bash
   npm run import:data:compiled
   ```

## Running the Application

```bash
npm run dev
```  
Open `http://localhost:3000` in your browser.

