const bcrypt = require('bcrypt');

const password = 'superadmin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Mot de passe hashé :', hash);
});
