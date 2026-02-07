# Session 015 — Quick Reference

## New Endpoints Summary

### Users (`/api/v1/users`)
- `GET /me` - Current user profile
- `GET /` - List users (admin)
- `POST /` - Create user (admin)
- `GET /{user_id}` - Get user (admin)
- `PATCH /{user_id}` - Update user (admin)
- `POST /{user_id}/password` - Admin reset password
- `POST /me/password` - Self password update

### Guests (`/api/v1/guests`)
- `POST /` - Create guest (staff)
- `GET /` - List guests (staff)
- `GET /{guest_id}` - Get guest (staff)
- `PATCH /{guest_id}` - Update guest (staff)
- `DELETE /{guest_id}` - Delete guest (staff)

### Channels (`/api/v1/channels`)
- `POST /` - Create channel (staff)
- `GET /` - List channels (staff)
- `GET /{channel_id}` - Get channel (staff)
- `PATCH /{channel_id}` - Update channel (staff)
- `DELETE /{channel_id}` - Delete channel (staff)

## Database Changes

Run migration:
```bash
cd backend
.venv\Scripts\python.exe -m alembic upgrade head
```

## Testing

1. Navigate to: http://localhost:8000/docs
2. Login as admin (admin@local.dev)
3. Test new endpoints in Swagger UI

## Key Features

- ✅ User management with password reset
- ✅ Guest CRUD for reservation management
- ✅ Channel CRUD for booking sources
- ✅ Owner bank details for payouts
- ✅ UTM tracking for leads
- ✅ Total paid calculation for reservations
