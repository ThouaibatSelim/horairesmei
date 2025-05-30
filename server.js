// Configuration de l'app
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

//CONNEXION BDD

let db;
(async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Connecté à MySQL');
    app.listen(PORT, () => console.log(`🟢 Serveur lancé sur http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Erreur de connexion MySQL :', err);
  }
})();


// ROUTES

// Horaires
app.get('/horaires', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM horaires
      ORDER BY FIELD(jour, 'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'), ouverture
    `);
    res.render('horaires', { horaires: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur lors de la récupération des horaires.");
  }
});

// Interface admin
app.get('/admin', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const [rows] = await db.execute(`
      SELECT * FROM horaires
      ORDER BY FIELD(jour, 'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'), ouverture
    `);
    res.render('admin', { horaires: rows, user: req.session.user });
  } catch (err) {
    console.error('Erreur /admin :', err);
    res.status(500).send('Erreur lors de la récupération des horaires.');
  }
});

//page modifier horaires
app.get('/admin/edit/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [rows] = await db.execute('SELECT * FROM horaires WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).send("Créneau non trouvé.");
    }
    res.render('edit', { horaire: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la récupération du créneau.");
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

// supprimer horaires
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

// Ajouter horaires
app.get('/admin/add', (req, res) => {
  res.render('add');
});

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

// Inscription

app.get('/inscription', (req, res) => {
  res.render('inscription', { error: null, success: null });
});

app.post('/inscription', async (req, res) => {
  const { login, password, telephone } = req.body;
  console.log("🟢 Étape 1 — Formulaire reçu :", req.body);

  try {
    const [results] = await db.execute('SELECT * FROM admin WHERE login = ?', [login]);
    console.log("🟢 Étape 2 — Requête SELECT faite");

    if (results.length > 0) {
      console.log("⚠️ Login déjà utilisé");
      return res.render('inscription', { error: 'Email déjà utilisé', success: null });
    }

    console.log("🟢 Étape 3 — Hashing en cours...");
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.execute(
      'INSERT INTO admin (login, password, telephone) VALUES (?, ?, ?)',
      [login, hashedPassword, telephone]
    );

    console.log("✅ Étape 5 — Utilisateur ajouté");
    res.render('inscription', {
      success: 'Compte utilisateur créé avec succès !',
      error: null
    });
  } catch (err) {
    console.error("❌ Erreur /inscription :", err);
    res.status(500).send("Erreur lors de l'inscription.");
  }
});

// Connexion

app.get('/', (req, res) => {
  res.redirect('/login');
});


app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  console.log("🟢 Étape 1 — Formulaire reçu :", req.body);

  try {
    const [results] = await db.execute('SELECT * FROM admin WHERE login = ?', [login]);
    console.log("🟢 Étape 2 — Résultats SELECT :", results);

    if (results.length === 0) {
      console.log("⚠️ Aucun utilisateur trouvé pour :", login);
      return res.render('login', { error: 'Identifiants incorrects' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log("✅ Étape 4 — Mot de passe OK. Connexion réussie.");
      req.session.user = user;
      res.redirect('/admin');
    } else {
      console.log("❌ Mot de passe incorrect");
      res.render('login', { error: 'Identifiants incorrects' });
    }
  } catch (err) {
    console.error("❌ Erreur /login :", err);
    res.status(500).send("Erreur serveur");
  }
});

// Déconnexion

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Erreur lors de la déconnexion');
    res.redirect('/login');
  });
});

app.get('/recuperation', (req, res) => {
  res.render('recuperation', { login: null, error: null });
});

// Récupération mot de passe

app.post('/recuperation', async (req, res) => {
  const { telephone } = req.body;
  try {
    const [results] = await db.execute('SELECT login FROM admin WHERE telephone = ?', [telephone]);
    if (results.length > 0) {
      res.render('recuperation', { login: results[0].login, error: null });
    } else {
      res.render('recuperation', { login: null, error: 'Aucun compte trouvé' });
    }
  } catch (err) {
    console.error("❌ Erreur /recuperation :", err);
    res.status(500).send("Erreur lors de la récupération.");
  }
});
