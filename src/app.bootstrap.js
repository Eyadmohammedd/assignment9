import "../config/config.service.js";
import { NODE_ENV, port } from "../config/config.service.js";
import { authenticationDB } from "./DB/connection.db.js";
import { userRouter, notesRouter } from "./modules/index.js";

import express from "express";

async function bootstrap() {
  const app = express();
  //convert buffer data
  app.use(express.json());
  //DB
  await authenticationDB();
  //application routing
  app.get("/", (req, res) => res.send("Hello World!"));
  app.use("/users", userRouter);
  app.use("/notes", notesRouter);

  //invalid routing
  app.use("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  //error-handling
  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    const status = error.cause?.status ?? 500;

    return res.status(status).json({
      error_message:
        status === 500
          ? "something went wrong"
          : (error.message ?? "something went wrong"),
      stack: NODE_ENV === "development" ? error.stack : undefined,
    });
  });
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}
export default bootstrap;
