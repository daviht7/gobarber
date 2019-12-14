import { Router } from "express";
import User from "./app/models/User";
import multer from "multer";
import multerConfig from "./config/multer";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import ProviderController from "./app/controllers/ProviderController";
import AvailableController from "./app/controllers/AvailableController";
import AppointmentController from "./app/controllers/AppointmentController";
import ScheduleController from "./app/controllers/ScheduleController";
import NotificationController from "./app/controllers/NotificationController";
import authMiddleware from "./app/middlewares/auth";

import validateUserStore from "./app/validators/UserStore";
import validateUserUpdate from "./app/validators/UserUpdate";
import validateSessionStore from "./app/validators/SessionStore";
import validateAppointmentStore from "./app/validators/AppointmentStore";

const routes = new Router();
const upload = multer(multerConfig);

routes.post("/sessions", validateSessionStore, SessionController.store);
routes.post("/users", validateUserStore, UserController.store);

routes.use(authMiddleware);

routes.put("/users", validateUserUpdate, UserController.update);

routes.get("/providers/:providerId/available", AvailableController.index);
routes.get("/providers", ProviderController.index);

routes.post("/files", upload.single("file"), FileController.store);

routes.post(
  "/appointment",
  validateAppointmentStore,
  AppointmentController.store
);
routes.get("/appointment", AppointmentController.index);
routes.delete("/appointment/:id", AppointmentController.delete);

routes.get("/schedule", ScheduleController.index);

routes.get("/notifications", NotificationController.index);
routes.put("/notifications/:id", NotificationController.update);

export default routes;
