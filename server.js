const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

// Connect Supabase
const supabase = createClient('https://zuodruwodxvkjnkurtnu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1b2RydXdvZHh2a2pua3VydG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTI3NTIsImV4cCI6MjA2MzgyODc1Mn0.Wqx-Scc_OMbR2PAsEb5py0dBuCSgjBJMK-yzxJN0NRs');

// Route publique
app.get('/horaires', async (req, res) => {
  const { data: horaires, error } = await supabase
    .from('horaires')
    .select('*')
    .order('jour', { ascending: true });

  if (error) return res.status(500).send('Erreur Supabase : ' + error.message);

  res.render('horaires', { horaires });
});

let horaires = [
  // LUNDI
  { id: 1, jour: 'lundi', type: 'public', ouverture: '08:00', fermeture: '13:00', commentaire: null },
  { id: 2, jour: 'lundi', type: 'public', ouverture: '14:30', fermeture: '17:30', commentaire: null },

  // MARDI
  { id: 3, jour: 'mardi', type: 'rdv', ouverture: null, fermeture: null, commentaire: 'sur rendez-vous' },
  { id: 4, jour: 'mardi', type: 'public', ouverture: '08:00', fermeture: '12:00', commentaire: null },
  { id: 5, jour: 'mardi', type: 'public', ouverture: '14:00', fermeture: '16:30', commentaire: null },

  // MERCREDI
  { id: 6, jour: 'mercredi', type: 'rdv', ouverture: null, fermeture: null, commentaire: 'sur rendez-vous' },
  { id: 7, jour: 'mercredi', type: 'public', ouverture: '08:00', fermeture: '12:00', commentaire: null },
  { id: 8, jour: 'mercredi', type: 'public', ouverture: '14:00', fermeture: '16:30', commentaire: null },

  // JEUDI
  { id: 9, jour: 'jeudi', type: 'rdv', ouverture: null, fermeture: null, commentaire: 'sur rendez-vous' },
  { id: 10, jour: 'jeudi', type: 'public', ouverture: '08:00', fermeture: '12:00', commentaire: null },
  { id: 11, jour: 'jeudi', type: 'public', ouverture: '14:00', fermeture: '16:30', commentaire: null },

  // VENDREDI
  { id: 12, jour: 'vendredi', type: 'public', ouverture: '08:00', fermeture: '11:30', commentaire: null },

  // SAMEDI
  { id: 13, jour: 'samedi', type: 'public', ouverture: '08:00', fermeture: '12:00', commentaire: null },

  // DIMANCHE
  { id: 14, jour: 'dimanche', type: 'public', ouverture: null, fermeture: null, commentaire: 'fermé' }
];


// ROUTES

// Page admin
app.get('/admin', (req, res) => {
  res.render('admin', { horaires });
});

// Page modification
app.get('/admin/edit/:id', (req, res) => {
  const horaire = horaires.find(h => h.id == req.params.id);
  if (!horaire) return res.status(404).send("Créneau introuvable");
  res.render('edit', { horaire });
});

// Traitement de la modification (fake update)
app.post('/admin/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = horaires.findIndex(h => h.id === id);
  if (index === -1) return res.status(404).send("Créneau introuvable");

  horaires[index] = {
    id,
    jour: req.body.jour,
    type: req.body.type,
    ouverture: req.body.ouverture || null,
    fermeture: req.body.fermeture || null,
    commentaire: req.body.commentaire || null
  };

  res.redirect('/admin');
});

// Suppression (fake)
app.get('/admin/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = horaires.findIndex(h => h.id === id);
  if (index === -1) return res.status(404).send("Créneau introuvable");

  horaires.splice(index, 1);
  res.redirect('/admin');
});


app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
