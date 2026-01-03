import { createClient } from '@supabase/supabase-js';

// Priority: Environment Variables > Hardcoded Fallbacks (Temporary for Vercel/Testing)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://acdoypjzatauoizdloir.supabase.co';

// Using the Anon Public Key provided. 
// NOTE: Never use the Service Role key in the frontend.
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZG95cGp6YXRhdW9pemRsb2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTAzNTUsImV4cCI6MjA4MzAyNjM1NX0.m4TPT6a2Q0VSNBFCmPiI-BHgaut-so59Qv7-bfI7Mjk';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Key is missing. The app may not function correctly.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);