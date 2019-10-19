import { Router } from "express";
import User from "./app/models/User";

const routes = new Router();

routes.get("/users", async (req, res) => {
  const user = await User.create({
    name: "carlos almeida",
    email: "kameta@gmail.com",
    password_hash: "13213223",
    provider: false
  });
  return res.json(user);
});

export default routes;
