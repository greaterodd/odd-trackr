# Database Setup Instructions

## Step 1: Create Turso Database

1. Go to [turso.tech](https://turso.tech) and sign up/login
2. Create a new database:
   ```bash
   # Install Turso CLI (if you haven't already)
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Login to Turso
   turso auth login
   
   # Create a new database
   turso db create habit-tracker
   
   # Get the database URL
   turso db show habit-tracker --url
   
   # Create an auth token
   turso db tokens create habit-tracker
   ```

## Step 2: Set up Environment Variables

Create a `.env` file in the root directory:

```env
# Copy from .env.example and fill in your values
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# You'll need these later for Google Auth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-session-secret-here
NODE_ENV=development
```

## Step 3: Generate and Run Migrations

After setting up your `.env` file:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Drizzle Studio to view your database
npm run db:studio
```

## Next Steps

Once database is set up, we'll move to Phase 2: Authentication Infrastructure!