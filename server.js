// Configuration de l'app

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');

// App EJS
app.set('view engine', 'ejs');

// Middleware pour les formulaires (utile plus tard pour admin)
app.use(express.urlencoded({ extended: true }));

// Connexion MySQL
let db;
(async () => {
  db = await mysql.createConnection({
    host: '192.168.0.63',
    user: 'stagiaire',
    password: 'stagiaire',
    database: 'stagiaire'
  });
  console.log('✅ Connecté à MySQL');
})();

// Route publique /horaires
app.get('/horaires', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM horaires
      ORDER BY FIELD(jour, 'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'), ouverture
    `);
    res.render('horaires', { horaires: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la récupération des horaires.");
  }
});

app.get('/admin/delete/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.execute('DELETE FROM horaires WHERE id = ?', [id]);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression.');
  }
});

app.post('/admin/update/:id', async (req, res) => {
  const { jour, type, ouverture, fermeture, commentaire } = req.body;
  const id = parseInt(req.params.id);

  try {
    await db.execute(`
      UPDATE horaires 
      SET jour = ?, type = ?, ouverture = ?, fermeture = ?, commentaire = ?
      WHERE id = ?
    `, [jour, type, ouverture || null, fermeture || null, commentaire || null, id]);

    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la modification.');
  }
});


// Ecoute du port
app.listen(PORT, () => {
  console.log(`🟢 Serveur en ligne sur http://localhost:${PORT}`);
});

// Afficher le formulaire
app.get('/admin/add', (req, res) => {
  res.render('add');
});

// Traiter le formulaire
app.post('/admin/add', async (req, res) => {
  const { jour, type, ouverture, fermeture, commentaire } = req.body;
  try {
    await db.execute(`
      INSERT INTO horaires (jour, type, ouverture, fermeture, commentaire)
      VALUES (?, ?, ?, ?, ?)
    `, [jour, type, ouverture || null, fermeture || null, commentaire || null]);

    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l’ajout.");
  }
});
