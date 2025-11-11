# Migration Guide: From Flat Hosts to Hierarchical Systems/Machines

## Overview

Your system monitor has been restructured from a flat host-based model to a hierarchical system-based model that better matches your original vision:

```
System (highest level)
├── Machine 1
│   ├── IP address
│   ├── Hostname
│   ├── SSH reachability
│   ├── Unit test status
│   └── Other attributes
├── Machine 2
│   └── [same structure]
└── Machine N
    └── [same structure]
```

## What Changed

### Database Models
- **Old**: Single `Host` table with basic fields
- **New**: `System` and `Machine` tables with hierarchical relationship

### API Endpoints
- **Old**: `/api/hosts/*` endpoints
- **New**: `/api/systems/*` and `/api/machines/*` endpoints

### Frontend Components
- **Old**: `HostList`, `HostForm` components
- **New**: `SystemList` component with hierarchical display

## Migration Steps

### 1. Database Migration

First, you need to create the new database tables:

```bash
cd backend
alembic revision --autogenerate -m "Add systems and machines tables"
alembic upgrade head
```

### 2. Data Migration

Run the migration script to convert existing hosts to the new structure:

```bash
cd backend
python migrate_data.py
```

This will:
- Create a "Default System" to hold your existing hosts
- Convert each host to a machine within that system
- Preserve all existing data

### 3. Update Frontend

The frontend has been updated to use the new structure. The main changes are:
- `App.tsx` now uses `SystemList` instead of `HostList`
- API calls use the new endpoints
- Types have been updated to match the new structure

## New Features

### System Management
- Create, read, update, delete systems
- Each system can contain multiple machines
- Systems can have descriptions and metadata

### Enhanced Machine Data
- **SSH Configuration**: Port, username, key path
- **Health Status**: Alive status, unit test results, last health check
- **System Information**: OS, CPU, memory, disk info
- **Notes**: Custom notes for each machine

### Hierarchical Display
- Systems are displayed as cards
- Machines are shown within their parent system
- Health status indicators for each machine
- Easy system-level operations

## API Endpoints

### Systems
- `GET /api/systems` - List all systems
- `POST /api/systems` - Create a new system
- `GET /api/systems/{id}` - Get a specific system
- `PUT /api/systems/{id}` - Update a system
- `DELETE /api/systems/{id}` - Delete a system

### Machines
- `GET /api/machines` - List all machines
- `GET /api/systems/{id}/machines` - List machines in a system
- `POST /api/machines` - Create a new machine
- `GET /api/machines/{id}` - Get a specific machine
- `PUT /api/machines/{id}` - Update a machine
- `DELETE /api/machines/{id}` - Delete a machine

### Legacy Support
- `GET /api/hosts` - Legacy endpoint (returns all machines)

## Next Steps

1. **Run the migration** to convert your existing data
2. **Test the new structure** by creating systems and machines
3. **Add more machine attributes** as needed (SSH credentials, unit test configurations, etc.)
4. **Implement actual unit test checking** in the health monitoring logic
5. **Add more sophisticated health checks** beyond basic ping/SSH connectivity

## Backward Compatibility

The old `/api/hosts` endpoint is maintained for backward compatibility, but it now returns machines instead of the old host structure. This allows existing integrations to continue working while I migrate to the new structure.

## Troubleshooting

### Migration Issues
- Ensure you have a backup of the database before running migrations
- If the migration script fails, check that both old and new tables exist
- The migration is idempotent - you can run it multiple times safely

### API Issues
- Check that the new endpoints are working: `GET /api/systems`
- Verify the database connection and table structure
- Check the FastAPI logs for any errors

### Frontend Issues
- Clear your browser cache if you see old data
- Check the browser console for API errors
- Verify that the backend is running on the expected port (8000) 
