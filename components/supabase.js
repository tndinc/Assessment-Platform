// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rqgawsovmwuunqdnmqoj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZ2F3c292bXd1dW5xZG5tcW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcxNjAxOTEsImV4cCI6MjA0MjczNjE5MX0.DBGtyuUtIdN3l8pWezW4RKvsNYtIT-E68BrXzoaotdA';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;