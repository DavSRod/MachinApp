import { Router } from "express";
import {
  registarSolicitud,
  obtenerSolicitudes,
} from "../controllers/solicitudController.js";

const solicitudRouter = Router();

solicitudRouter.post("/", registarSolicitud);
solicitudRouter.get("/", obtenerSolicitudes);

export default solicitudRouter;