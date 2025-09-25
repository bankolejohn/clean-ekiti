# CleanEkiti MVP

A community-driven platform for reporting environmental issues in Ekiti State, Nigeria.

## Features

- **Public Reporting**: Citizens can report environmental issues without registration
- **Photo Upload**: Visual evidence with Cloudinary integration
- **Interactive Maps**: Leaflet.js maps for location pinning and viewing reports
- **Admin Dashboard**: Secure admin panel for managing reports
- **Status Tracking**: Track report progress (Pending → Investigating → Resolved)
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Maps**: Leaflet.js with OpenStreetMap
- **Image Storage**: Cloudinary
- **Email**: Resend
- **Authentication**: JWT with bcrypt

## Quick Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd cleanekiti-mvp
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables:
   - Supabase credentials
   - Cloudinary API keys
   - Resend API key
   - JWT secret

3. **Database Setup**
   - Create a Supabase project
   - Run the SQL script in `scripts/setup-database.sql`
   - This creates tables, indexes, and a default admin user

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
RESEND_API_KEY=your_resend_api_key

# JWT
JWT_SECRET=your_jwt_secret_key

# Admin Email
ADMIN_EMAIL=admin@cleanekiti.com
```

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

⚠️ **Change these credentials immediately in production!**

## API Endpoints

### Public Endpoints
- `GET /api/reports` - Fetch all reports
- `POST /api/reports` - Create new report

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/reports` - Get reports with stats
- `PUT /api/admin/reports` - Update report status
- `DELETE /api/admin/reports` - Delete report

## Pages

- `/` - Landing page with hero and map
- `/report` - Report submission form
- `/map` - Full-screen map with filters
- `/admin/login` - Admin login
- `/admin` - Admin dashboard

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Railway
- Render
- Netlify

## Database Schema

### Reports Table
- `id` (UUID, Primary Key)
- `category` (dumping, flooding, pollution, drainage, other)
- `description` (Text, Optional)
- `image_url` (String, Optional)
- `latitude` (Decimal)
- `longitude` (Decimal)
- `status` (pending, investigating, resolved)
- `reporter_email` (String, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Admin Users Table
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `password_hash` (String)
- `email` (String, Unique)
- `created_at` (Timestamp)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create a GitHub issue or contact the development team.

---

Built with ❤️ for cleaner communities in Ekiti State