import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || '',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: true, // Cambia a true para ver las consultas SQL en la consola
  }
);

export default sequelize;
