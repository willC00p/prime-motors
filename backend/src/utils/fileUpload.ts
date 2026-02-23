import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'si_photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware to handle SI photo uploads from express-fileupload
export const handleSiPhotoUpload = (req: any, res: any, next: any) => {
  try {
    // Merge form fields from express-fileupload into req.body
    if (req.fields) {
      for (const [key, value] of Object.entries(req.fields)) {
        if (!req.body[key]) {
          req.body[key] = value;
        }
      }
    }

    // SI photo upload is optional
    if (req.files && req.files.si_photo) {
      const siPhoto = req.files.si_photo;
      
      // Allow only image and PDF files
      const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!allowedMimes.includes(siPhoto.mimetype)) {
        return res.status(400).json({ error: 'Only image and PDF files are allowed' });
      }
      
      // Check file size (50MB limit)
      if (siPhoto.size > 50 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds 50MB limit' });
      }
      
      // Generate unique filename
      const ext = path.extname(siPhoto.name);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Move file to uploads directory
      siPhoto.mv(filepath, (err: any) => {
        if (err) {
          console.error('Error uploading SI photo:', err);
          return res.status(500).json({ error: 'Failed to upload SI photo' });
        }
        
        // Attach filename to request for controller to use
        (req as any).uploadedSiPhotoFilename = filename;
        next();
      });
    } else {
      // No file uploaded, continue
      next();
    }
  } catch (error) {
    console.error('Error in handleSiPhotoUpload:', error);
    res.status(500).json({ error: 'File upload middleware error' });
  }
};

export const getSiPhotoPath = (filename: string): string => {
  return `/uploads/si_photos/${filename}`;
};

export const deleteSiPhoto = (filename: string): void => {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
