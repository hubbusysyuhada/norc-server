if (process.env.NODE_ENV !== "production") require('dotenv').config()

export default {
  APP_KEY: process.env.APP_KEY || 'superadmin',
  DB_TYPE: process.env.DB_TYPE || 'mysql',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '3306',
  DB_NAME: process.env.DB_NAME || 'foobar',
  DB_USERNAME: process.env.DB_USERNAME || 'foobar',
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_KEY: process.env.JWT_KEY || 'secret',
}