# Content Management System - Setup Guide

## Overview

This guide will help you set up the content management system for uploading and managing PDF educational content by grade level.

## Prerequisites

- Supabase project with admin access
- Backend and frontend development servers running

## Setup Steps

### 1. Create Supabase Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Configure the bucket:
   - **Name**: `grade-content`
   - **Public**: Uncheck (keep private)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `application/pdf`
5. Click **Create Bucket**

### 2. Configure Storage Policies

After creating the bucket, set up Row Level Security (RLS) policies:

1. In the Storage section, click on the `grade-content` bucket
2. Go to **Policies** tab
3. Add the following policies:

**Policy 1: Allow authenticated users to read**
```sql
CREATE POLICY "Allow authenticated users to read content"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'grade-content');
```

**Policy 2: Allow admins to upload**
```sql
CREATE POLICY "Allow admins to upload content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'grade-content' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**Policy 3: Allow admins to delete**
```sql
CREATE POLICY "Allow admins to delete content"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'grade-content' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

### 3. Run Database Migration

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy the contents of `backend/migrations/create_grade_content.sql`
3. Paste and execute the SQL script
4. Verify the table was created:
   ```sql
   SELECT * FROM grade_content LIMIT 1;
   ```

### 4. Verify Backend Dependencies

Ensure multer is installed:

```bash
cd backend
npm install
```

The `package.json` should include:
- `multer`: ^1.4.5-lts.1
- `@types/multer`: ^1.4.12

### 5. Restart Development Servers

If the servers are already running, restart them to load the new code:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Usage

### Uploading Content

1. Log in as an administrator
2. Navigate to **Escuelas** (Schools)
3. Click on a school to view its details
4. Select a **Grado** (Grade) from the left column
5. Click the **+ Agregar** button in the top right
6. Select **Contenido** from the modal
7. Upload PDF files:
   - Drag and drop files into the upload area, OR
   - Click "Seleccionar Archivos" to browse
8. Click **Subir Archivos** to upload

### Managing Content

- **View Content**: All uploaded PDFs are listed below the upload area
- **Download**: Click the "⬇️ Descargar" button on any file
- **Delete**: Click the "🗑️ Eliminar" button and confirm deletion

## File Limitations

- **File Type**: Only PDF files are accepted
- **File Size**: Maximum 10 MB per file
- **Upload Limit**: Maximum 10 files per upload batch

## Troubleshooting

### Upload fails with "Only PDF files are allowed"
- Ensure you're uploading `.pdf` files only
- Check the file extension is correct

### Upload fails with "Failed to upload any files"
- Check Supabase Storage bucket exists and is named `grade-content`
- Verify storage policies are configured correctly
- Check backend logs for detailed error messages

### Content doesn't appear after upload
- Verify the `grade_content` table was created successfully
- Check that RLS policies allow reading for authenticated users
- Refresh the page

### Download links don't work
- Ensure storage policies allow authenticated users to read
- Check that the signed URL hasn't expired (1 hour expiry)
- Verify the file exists in Supabase Storage

## API Endpoints

The following endpoints are available:

- `GET /api/admin/grades/:gradeId/content` - Get all content for a grade
- `POST /api/admin/grades/:gradeId/content` - Upload content (multipart/form-data)
- `DELETE /api/admin/content/:contentId` - Delete content
- `GET /api/admin/content/:contentId/download-url` - Get download URL

## Database Schema

The `grade_content` table structure:

```sql
CREATE TABLE grade_content (
  id UUID PRIMARY KEY,
  grade_id UUID REFERENCES grades_levels(id),
  title VARCHAR(255),
  description TEXT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_active BOOLEAN
);
```

## Support

If you encounter any issues, check:
1. Backend console for error messages
2. Browser console for frontend errors
3. Supabase logs for storage/database errors
