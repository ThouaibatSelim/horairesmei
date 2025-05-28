const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
 
const port = 3000;
const saltRounds = 10;

// Configuration de la base de données
const db = mysql.createConnection({
    host: '192.168.0.63',
    user: 'stagiaire',
    password: 'stagiaire',
    database: 'stagiaire'
});

db.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    process.exit(1); // Arrête le serveur si pas de connexion
  } else {
    console.log('Connecté à la base de données MySQL');
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Page de connexion (ADMIN)
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { login, password } = req.body;

  db.query('SELECT * FROM admin WHERE login = ?', [login], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.render('login', { error: 'Identifiants incorrects' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        req.session.user = user;
        res.redirect('/interface');
      } else {
        res.render('login', { error: 'Identifiants incorrects' });
      }
    });
  });
});

// Interface protégée
app.get('/interface', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // empêche l'accès sans session
  }

  res.render('interface', { user: req.session.user });
});

// ✅ Déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Erreur lors de la déconnexion');
    }
    res.redirect('/login');
  });
});


// Page inscription (UTILISATEUR)
app.get('/inscription', (req, res) => {
  res.render('inscription', { error: null, success: null });
});

app.post('/inscription', (req, res) => {
  const { login, password, telephone } = req.body;

  db.query('SELECT * FROM admin WHERE login = ?', [login], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      res.render('inscription', { error: 'Email déjà utilisé', success: null });
    } else {
      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) throw err;

        db.query(
          'INSERT INTO admin (login, password, telephone) VALUES (?, ?, ?)',
          [login, hashedPassword, telephone],
          (err2) => {
            if (err2) throw err2;
            res.render('inscription', {
              success: 'Compte utilisateur créé avec succès !',
              error: null
            });
          }
        );
      });
    }
  });
});

// Récupération mot de passe utilisateur via téléphone
app.get('/recuperation', (req, res) => {
  res.render('recuperation', { login: null, error: null });
});

app.post('/recuperation', (req, res) => {
  const { telephone } = req.body;

  db.query('SELECT login FROM admin WHERE telephone = ?', [telephone], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      res.render('recuperation', { login: results[0].login, error: null });
    } else {
      res.render('recuperation', { login: null, error: 'Aucun compte trouvé' });
    }
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
