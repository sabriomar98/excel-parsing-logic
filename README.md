# Attijariwafa Instruction Tracker

A comprehensive internal platform for tracking instruction sheets with versioning, imputation status management, and JH (man-days) cumulation.

## Features

- **User Authentication**: Custom JWT-based authentication with bcrypt password hashing
- **Excel File Upload**: Parse and extract data from XLSX files with exact cell coordinate mapping
- **Duplicate Detection**: Automatic detection of duplicate files via SHA256 hashing
- **Version Management**: Track multiple versions of the same project
- **Imputation Tracking**: Mark versions or collaborators as imputed (NON_IMPUTE, PARTIEL, IMPUTE)
- **JH Cumulation**: Calculate cumulative man-days by project, collaborator, and phase
- **Analytics Dashboard**: View project statistics and cumulative data
- **Responsive UI**: Modern interface with Tailwind CSS and Framer Motion animations

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS v4
- **Backend**: Next.js API Routes
- **Database**: Prisma v7 + SQLite
- **State Management**: Redux Toolkit + TanStack Query
- **Authentication**: Custom JWT with bcryptjs
- **File Processing**: XLSX parsing with exact coordinates
- **UI Components**: shadcn/ui with Radix UI
- **Animations**: Framer Motion

## Project Structure

```
├── app/
│   ├── (protected)/          # Auth-guarded routes
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── upload/
│   │   └── analytics/
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── projects/         # Project management
│   │   ├── upload/           # File upload
│   │   ├── versions/         # Version management
│   │   └── analytics/        # Analytics data
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                   # Shadcn components
│   └── layout/               # Layout components (sidebar, etc)
├── lib/
│   ├── auth.ts              # Authentication utilities
│   ├── db.ts                # Prisma client
│   ├── excel-parser.ts      # Excel parsing logic
│   └── redux/               # Redux store and slices
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/uploads/          # Uploaded files storage
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

The project uses Prisma with SQLite. The database file will be created automatically at `prisma/dev.db`.

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations (if using migrations)
npx prisma migrate dev --name init

# Seed database with admin user
npx ts-node prisma/seed.ts
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# JWT Secret for authentication
JWT_SECRET=your-super-secret-key-change-in-production

# Database (SQLite uses local file, no URL needed in production use)
DATABASE_URL="file:./prisma/dev.db"
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Login Credentials

Default credentials (from seed):

- **Admin**: admin@attijariwafa.com / admin123
- **User**: user@attijariwafa.com / user123

## Key Features Explained

### Excel File Parsing

The parser extracts data from exact Excel cell coordinates as specified in the Fiche Instruction template:

- **D3**: Filiale (SCB, etc.)
- **D4**: Project Reference
- **B7, E7**: Descriptif/Title and Context
- **D10-D12**: Charge totale, start/end dates
- **Row 17-26**: Collaborator charges by phase
- **Row 31-38**: Planning timeline

### Imputation Status

- **NON_IMPUTE**: No collaborators marked as imputed
- **PARTIEL**: Some collaborators marked as imputed
- **IMPUTE**: All collaborators marked as imputed

### Duplicate Detection

Files are automatically checked for duplicates using SHA256 hashing:
- Exact duplicate: Same file hash → rejected
- New version: Same project (filiale + reference) but different hash → creates version

### JH Cumulation

Total man-days can be viewed by:
- Project (filiale + reference)
- Collaborator (person)
- Phase (project stage)
- Global total

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects (with filters: search, status, filiale)
- `GET /api/projects/[id]` - Get project details with all versions

### Upload
- `POST /api/upload` - Upload and parse Excel file

### Versions & Imputation
- `PATCH /api/versions/[id]/imputation` - Update imputation status for collaborators

### Analytics
- `GET /api/analytics/cumulation` - Get cumulative data by project/collaborator/phase

## File Format Requirements

Excel files must:

1. Have a sheet named "Fiche Instruction"
2. Follow the Attijariwafa instruction template structure
3. Use exact cell coordinates as defined in the parser
4. Be in XLSX format

## Security Considerations

- **Authentication**: JWT tokens stored in httpOnly cookies
- **Passwords**: Hashed with bcryptjs (10 salt rounds)
- **File Upload**: Validated by file extension and parsed structure
- **Duplicate Prevention**: SHA256 file hashing prevents duplicate uploads
- **API Protection**: Routes check authentication before processing

## Production Deployment

1. Update `JWT_SECRET` in environment variables
2. Set `NODE_ENV=production`
3. Use a production-grade database (migrate from SQLite to PostgreSQL recommended)
4. Enable HTTPS
5. Configure CORS appropriately
6. Set up proper file storage (consider cloud storage instead of local filesystem)

## Troubleshooting

### Database Issues

If you encounter database issues:

```bash
# Reset database (WARNING: deletes all data)
rm prisma/dev.db
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### Upload Fails

- Ensure file is valid Excel format (.xlsx)
- Check that sheet name is exactly "Fiche Instruction"
- Verify cell values are in expected columns

### Authentication Issues

- Clear browser cookies
- Regenerate JWT secret if needed
- Check that admin user was properly seeded

## License

Internal use only - Attijariwafa bank IT Africa department
