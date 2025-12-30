const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "sportomicdb.c3i2ies6olnl.ap-south-1.rds.amazonaws.com",
  database: process.env.DB_NAME || "sportomic_db",
  password: process.env.DB_PASSWORD || "postgres123",
  port: 5432,
});

module.exports = pool;
