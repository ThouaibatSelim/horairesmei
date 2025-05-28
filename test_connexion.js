const mysql = require('mysql2/promise');

(async () => {
  try {
    const db = await mysql.createConnection({
      host: '192.168.0.63',
      user: 'stagiaire',
      password: 'stagiaire',
      database: 'stagiaire',
      connectTimeout: 5000 // optionnel mais utile
    });

    console.log('✅ Connexion à MySQL réussie !');
    await db.end();
  } catch (err) {
    console.error('❌ Impossible de se connecter à MySQL :');
    console.error(err.message);
  }
})();
