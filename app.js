

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = 3000;

// Supabase client config
const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_PUBLIC_KEY'
);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    return res.render('login', { error: 'Identifiants invalides' });
  }

  // Authentifié avec succès
  res.redirect('/interface');
});

app.get('/interface', (req, res) => {
  res.render('interface');
});

app.listen(port, () => {
  console.log(`Serveur sur http://localhost:${port}`);
});
