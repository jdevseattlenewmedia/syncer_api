import fs from "fs";
import path from "path";
import { Sequelize, ModelStatic, Dialect, DataTypes } from "sequelize";
import {
  DB_USER_NAME,
  DB_NAME,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
} from "../config";

const basename: string = path.basename(__filename);

const db: any = {};

const sequelize = new Sequelize(DB_NAME!, DB_USER_NAME!, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: "postgres",
  define: {
    underscored: true,
  },
  logging: false,
});
fs.readdirSync(__dirname)
  .filter((file: string) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file: string) => {
    const model: ModelStatic<any> = require(path.join(__dirname, file))(
      sequelize,
      DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
