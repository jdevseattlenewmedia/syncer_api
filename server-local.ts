import App from "./app";

// import UsersRoute from "routes/users.route";
import AuthRoute from "./routes/auth.route";
import IndexRoute from "./routes/index.route";
import AirtableConnectionsRoutes from "./routes/aitrable.route";
import UsersRoute from "./routes/users.route";
import DashboardRoutes from "./routes/dashboard.route";
import WebFlowRoutes from "./routes/webflow.route";
import BasesRoutes from "./routes/bases.route";
import validateEnv from "./utils/validateEnv";

// import  dotenv from "dotenv";
// dotenv.config();

// import { Request, Response } from "express";

validateEnv();

// const PORT = process.env.PORT || 8080;

const app = new App([
  new IndexRoute(),
  new AirtableConnectionsRoutes(),
  new AuthRoute(),
  new UsersRoute(),
  new DashboardRoutes(),
  new WebFlowRoutes(),
  new BasesRoutes(),
]);

app.listen();

// app.route("/").get((_req: Request, res: Response) => {
//   res.status(200).send({ message: "hello world" });
// });
// app.listen(PORT, () => {
//   console.log("listening on port " + PORT);
// });
export { app };
