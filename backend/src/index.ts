import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use Service Key for Backend
export const supabase = createClient(supabaseUrl, supabaseKey);

// Basic Route
app.get('/', (req, res) => {
    res.send('Backend API Running 🚀');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
