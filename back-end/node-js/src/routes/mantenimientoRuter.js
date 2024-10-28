import { Router } from "express";
import { 
  registrarMantenimiento, 
  listartodosmantenimientos, 
  actualizarMantenimiento, 
  graficas, 
  listarMantenimientoPorId, 
  excelconsultavariables,
  cargarMantenimiento,
  listarMaquinasPorSolicitud
} from "../controllers/mantenimientoController.js";
import { VerificarMantenimiento } from '../../validar/mantenimiento/mantenimiento_validar.js';
import { ActualizarMantenimiento } from '../../validar/mantenimiento/actualizar_mantenimiento.js';
import { verificar } from '../middlewares/LoginMidleware.js';

const mantenimiento = Router();

mantenimiento.post('/registrar', cargarMantenimiento, VerificarMantenimiento, registrarMantenimiento);

mantenimiento.get('/listar/',verificar,  listartodosmantenimientos);

mantenimiento.put('/Actualizar_mantenimiento/:idMantenimiento',verificar,  cargarMantenimiento, ActualizarMantenimiento, actualizarMantenimiento);

mantenimiento.get('/listar_por_id/:idMantenimiento',verificar,  listarMantenimientoPorId);

mantenimiento.get("/grafica/",verificar, graficas);

mantenimiento.get("/excelconsultavariables",verificar,  excelconsultavariables);

mantenimiento.get('/maquinas/solicitud/:idSolicitud', listarMaquinasPorSolicitud);

export default mantenimiento;