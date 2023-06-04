import express from "express";
import bodyParser from "body-parser"; //used to parse the form data that you pass in the request
import cors from "cors";
// import morgan from "morgan";
// import { createReadStream } from "fs";
// import Audic from "audic";
// import { playAudioFile } from "audic";

import db from "./models";
import { Routes } from "@interfaces/routes.interface";
import { NODE_ENV, PORT } from "./config/index";
import errorMiddleware from "./middlewares/error.middleware";
// const PORT = process.env.PORT || 8080;
import { catchAsyncErrors } from "./middlewares/catchAsyncErrors";
import { HttpException } from "./exceptions/HttpException";
// const filePath = "./chime.mp3";

class App {
  public app: express.Application;
  public router: express.Express = express();
  public port: string | undefined;
  public env: string;

  private corsOpts: {
    origin: string;
    methods: string[];
    allowedHeaders: string[];
  };

  constructor(routes: Routes[]) {
    this.port = PORT;
    this.env = NODE_ENV || "development";
    this.app = express(); //run the express instance and store in app
    this.corsOpts = {
      origin: "*",
      methods: ["*"],
      allowedHeaders: ["*"],
    };
    this.config();
    this.connectToDatabase();
    this.initializeMiddlewares();
    // this.wrapAsyncHandlers();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();

    /** Logging */
  }

  private config(): void {
    /* A preflight request. */
    // this.app.options("*", cors());
    this.app.use(
      cors(this.corsOpts)
      // {
      //   credentials: true,
      //   origin: true,
      // }
    );
    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(
      bodyParser.urlencoded({
        extended: false,
      })
    );
  }
  private wrapAsyncHandlers() {
    this.app.use((req, res, next) => {
      const originalRouteHandler = req.route.stack[0].handle;
      req.route.stack[0].handle = catchAsyncErrors(originalRouteHandler);
      next();
    });
  }
  public listen() {
    this.app.listen(this.port, () => {
      console.info(`=================================`);
      console.info(`======= ENV: ${this.env} =======`);
      console.info(`🚀 App listening on the port ${this.port}`);
      console.info(`=================================`);
      // playAudioFile(filePath);
    });
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    await db.sequelize.authenticate();
    // await db.sequelize.sync({ force: true });
    //  create pricing table data if not exisists
  }

  private initializeMiddlewares() {
    // this.app.use(morgan("dev"));
    this.app.options("*", cors());
    // this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }
  private initializeErrorHandling() {
    // this.app.use(errorMiddleware);

    // @ts-ignore
    this.app.use((err: Error, req, res, next) => {
      if (err instanceof HttpException) {
        return res.status(err.status).json({ error: err.message });
      } else {
        console.error("Global error handler:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      next();
    });

    // this.app.use((err: any, req, res, next) => {
    //   if (err) {
    //     if (err.isAxiosError) {
    //       console.error("Axios error:", err.response.data);
    //       return res
    //         .status(err.response.status)
    //         .json({ error: "Axios request error" });
    //     }

    //     console.error("Global error handler:", err);
    //     return res.status(500).json({ error: "Internal server error" });
    //   }
    //   next();
    // });
  }
}
export default App;

// export default new App().app;
