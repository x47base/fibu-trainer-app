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

## .Env File

Ensure to create a .env file with following content:

```env
MONGODB_URI="mongodb://localhost:27017/NextAuthV5Database?retryWrites=true&w=majority&appName=Cluster0" # Your MongoDB URI
AUTH_SECRET="<RandomGeneratedSecret>"
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


## LICENSE

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## DEPENDENCY LICENSE(S)

### Dependencies

@auth/mongodb-adapter (LICENSE_NAME: ISC)
bcrypt (LICENSE_NAME: MIT)
clsx (LICENSE_NAME: MIT)
dotenv (LICENSE_NAME: BSD-2-Clause)
framer-motion (LICENSE_NAME: MIT)
mongodb (LICENSE_NAME: Apache-2.0)
next (LICENSE_NAME: MIT)
next-auth (LICENSE_NAME: ISC)
react (LICENSE_NAME: MIT)
react-confetti (LICENSE_NAME: MIT)
react-dnd (LICENSE_NAME: MIT)
react-dnd-html5-backend (LICENSE_NAME: MIT)
react-dom (LICENSE_NAME: MIT)
react-icons (LICENSE_NAME: MIT)
recharts (LICENSE_NAME: MIT)
tailwind-merge (LICENSE_NAME: MIT)
zod (LICENSE_NAME: MIT)

### DevDependencies

@eslint/eslintrc (LICENSE_NAME: MIT)
@types/node (LICENSE_NAME: MIT)
@types/react (LICENSE_NAME: MIT)
@types/react-dom (LICENSE_NAME: MIT)
cross-env (LICENSE_NAME: MIT)
eslint (LICENSE_NAME: MIT)
eslint-config-next (LICENSE_NAME: MIT)
postcss (LICENSE_NAME: MIT)
tailwindcss (LICENSE_NAME: MIT)
ts-node (LICENSE_NAME: MIT)
typescript (LICENSE_NAME: Apache-2.0)

