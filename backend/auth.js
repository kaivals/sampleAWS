const pool = require("./db");

async function login(email, password) {
  const result = await pool.query(
    "SELECT id, name, role FROM users WHERE email=$1 AND password=$2",
    [email, password]
  );

  if (result.rows.length > 0) {
    return result.rows[0];   // return user object
  }
  return null;
}

module.exports = login;
