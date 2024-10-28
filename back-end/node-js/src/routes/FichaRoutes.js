import {Router} from 'express'
import { registrarFicha, eliminarFicha, actualizarFicha, listarFichas,
    listarFichaUnica, listarFichaPorAmbiente, listarInfoEspecifica,
    cargarImagenFicha, actualizarFichaEsp,
    ExcelAmbiente,
    listarMantenimientosMaquina} from '../controllers/FichaController.js'

import {validar_ficha} from '../../validar/fichas/validationFicha.js'

import {  verificar } from '../middlewares/LoginMidleware.js'


const rutaFicha = Router()


rutaFicha.post('/registrar', verificar, cargarImagenFicha, validar_ficha, registrarFicha)
rutaFicha.get('/listar',  verificar, listarFichas)
rutaFicha.delete('/eliminar/:idFicha',  verificar, eliminarFicha)
rutaFicha.put('/actualizar/:idFicha',  verificar, cargarImagenFicha,  /* validar_ficha,  */actualizarFicha)




rutaFicha.get('/listarPorAmbiente/:idAmbiente',  verificar, listarFichaPorAmbiente)
rutaFicha.patch('/actualizarFichaEsp/:idFicha', verificar,  actualizarFichaEsp)

/* No requieren autenticacion */
rutaFicha.get('/listarMantenimientosMaquina/:idFicha', listarMantenimientosMaquina)
rutaFicha.get('/listarInfoEspecifica/:idFicha', listarInfoEspecifica )
rutaFicha.get('/excelambientes/:idAmbientes', ExcelAmbiente)
rutaFicha.get('/listarUnica/:idFicha', listarFichaUnica)


export default rutaFicha