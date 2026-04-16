import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urrbofvaftsfeiasrceo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycmJvZnZhZnRzZmVpYXNyY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYyMzksImV4cCI6MjA5MTUxMjIzOX0.1q2IikxXCH7X95U93GKGj8WI-7pZPyMFLtwBLxnyhiI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertService() {
  const { data, error } = await supabase.from('servicios').insert([
    {
      nombre: 'Peeling Corporal',
      descripcion: 'Renovación profunda de la piel con exfoliación y hidratación intensa.',
      precio: 80.00,
      duracion: '90 min',
      categoria: 'Rituales Spa',
      imagen_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop'
    }
  ]);

  if (error) {
    console.error('Error inserting service:', error);
  } else {
    console.log('Service inserted successfully:', data);
  }
}

insertService();
