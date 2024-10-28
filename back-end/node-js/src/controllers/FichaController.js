import { query, response } from 'express'
import { conexion } from '../database/database.js'
import QRCode  from 'qrcode'
import { validationResult } from 'express-validator'
import multer from 'multer'


import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from "dotenv"
dotenv.config({ path: 'env/.env' })


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let destinationPath = 'public/imagenes/ficha'
        if (file.fieldname === 'fiImagen') {
            destinationPath = 'public/imagenes/ficha'
        } else if (file.fieldname === 'fiTecnica') {
            destinationPath = 'public/FichasTecnicas/FichasRespaldo'
        }
        cb(null, destinationPath)
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)   //le podemos fecha, en caso de que se repita el nombre del documento. 
    }
})

const upload = multer({storage:storage})

export const cargarImagenFicha = upload.fields([
    {name:'fiImagen', maxCount:1},   
    {name:'fiTecnica', maxCount:1}
])


/*----------------------------------------------------------------Correcto----------------------*/
export const registrarFicha = async(req, res)=>{

    try{

        const error = validationResult(req)
        if(!error.isEmpty()){
            return res.status(400).json(error)
        }

        let { placaSena, fiEstado, fk_sitio, fk_tipo_ficha, }= req.body

        //Config documentos a cargar
        let fiImagen =  req.files.fiImagen ?  req.files.fiImagen[0].filename:''      //se valida si se cargo o no un documento, si no se cargo lo reemplara por una cadena vacia
        

        let fiTecnica = req.files.fiTecnica?  req.files.fiTecnica[0].filename:''



        let sql
         
        if (placaSena  == "undefined"){   //es lo que me trae del front end, asi validamos y si es de ambiente la placa sena es null.
            sql = `insert into fichas_maquinas_equipos ( fi_imagen, fi_estado, fi_fk_sitios, fi_fk_tipo_ficha, CodigoQR, ficha_respaldo )  values('${fiImagen}','${fiEstado}', ${fk_sitio} , ${fk_tipo_ficha}, '', '${fiTecnica}' )`
        }
        else{
            sql= `insert into fichas_maquinas_equipos (fi_placa_sena, fi_imagen, fi_estado, fi_fk_sitios, fi_fk_tipo_ficha, CodigoQR, ficha_respaldo ) values( '${placaSena}', '${fiImagen}','${fiEstado}', ${fk_sitio} , ${fk_tipo_ficha}, '', '${fiTecnica}' )`
        }

        let [respuesta] = await conexion.query(sql)


        if(respuesta.affectedRows>0){

            let id = respuesta.insertId  //id de la ficha creada

            let data = `${process.env.ID_PORT}infoMaquina/${id}`   //poner la url que queramos.
            let folderPath = 'public/QRimagenes'; //ruta de donde se va a guardar
            let filePath = `${folderPath}/${id}-qr.png`     //le pasamos la ruta y en nombre de como se va a crear la imagen. 
            
            let nombreImgQR = `${id}-qr.png`
            QRCode.toFile(filePath,data,{
                    color:{
                        dark:'#1f2937',
                        light: '#FFFFFF'
                    },
                    width:300
                }, function(err){
                    if (err) throw err 
                    |   console.log('Código QR generado y guardado como qrcode.png')
                }
            )

            let guardarQR = `update fichas_maquinas_equipos set CodigoQR='${nombreImgQR}'  where idFichas=${id}`
            
            let [respuestaQR] = await conexion.query(guardarQR)

            if(respuestaQR.affectedRows>0){
                return res.status(200).json({"mensaje":"Se registro la ficha tecnica correctamente con QR", "id": id})
            }
            else{
                return res.status(404).json({"mensaje":"se genero la ficha tecnica sin QR"})
            }
        }
        else{
            return res.status(404).json({"mensaje":"Error al registrar ficha"})
        }
    }catch(error){
        return res.status(500).json({"mensaje":"Error al registrar la ficha"+ error})
    }
}



export const actualizarFicha = async(req, res)=>{

    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.status(400).json(error)
    }

    try{

        let idFicha = req.params.idFicha

        let { placaSena, fiEstado, fk_sitio } = req.body
    
    
        let fiImagen = req.files.fiImagen ? req.files.fiImagen[0].filename : null  // Se valida si se cargó o no un documento, si no se cargó no se actualiza
        let fiTecnica = req.files.fiTecnica ? req.files.fiTecnica[0].filename : null
    
        // Consulta la información actual de la ficha
        const [dataFicha] = await conexion.query(`SELECT fi_imagen, ficha_respaldo FROM fichas_maquinas_equipos WHERE idFichas = ${idFicha}`)
    
        // Ruta de las imágenes y documentos técnicos
        const fichaImagenPath = path.join('public/imagenes/ficha', dataFicha[0].fi_imagen)
        const fichaTecnicaPath = path.join('public/FichasTecnicas/FichasRespaldo', dataFicha[0].ficha_respaldo)
    
        // Verifica y elimina la imagen anterior si se está subiendo una nueva
        if (fiImagen && dataFicha[0].fi_imagen) {
            if (fs.existsSync(fichaImagenPath)) {
                fs.unlinkSync(fichaImagenPath)  // Elimina la imagen anterior
            }
        }
    
        // Verifica y elimina la ficha técnica anterior si se está subiendo una nueva
        if (fiTecnica && dataFicha[0].ficha_respaldo) {
            if (fs.existsSync(fichaTecnicaPath)) {
                fs.unlinkSync(fichaTecnicaPath)  // Elimina el documento técnico anterior
            }
        }
    
        // Construcción de la consulta SQL para actualizar la ficha según los archivos subidos
        let sql
    
        if (fiImagen && fiTecnica) {  // Se actualizan ambos documentos
            sql = `UPDATE fichas_maquinas_equipos SET fi_placa_sena ='${placaSena}', fi_imagen = '${fiImagen}', fi_estado = '${fiEstado}', fi_fk_sitios = ${fk_sitio}, ficha_respaldo = '${fiTecnica}' WHERE idFichas = ${idFicha}`
        
        } else if (fiImagen && fiTecnica == null) {  // Solo se actualiza la imagen
            sql = `UPDATE fichas_maquinas_equipos SET fi_placa_sena ='${placaSena}', fi_imagen = '${fiImagen}', fi_estado = '${fiEstado}', fi_fk_sitios = ${fk_sitio} WHERE idFichas = ${idFicha}`
        
        } else if (fiTecnica && fiImagen == null) {  // Solo se actualiza el documento técnico
            sql = `UPDATE fichas_maquinas_equipos SET fi_placa_sena ='${placaSena}', fi_estado = '${fiEstado}', fi_fk_sitios = ${fk_sitio}, ficha_respaldo = '${fiTecnica}' WHERE idFichas = ${idFicha}`
        
        } else {  // No se actualizan los documentos, solo otros campos
            sql = `UPDATE fichas_maquinas_equipos SET fi_placa_sena ='${placaSena}', fi_estado = '${fiEstado}', fi_fk_sitios = ${fk_sitio} WHERE idFichas = ${idFicha}`
        }
    
        const [respuesta] = await conexion.query(sql)
        return res.json({"mensaje":"se actualizo con exito la ficha "})
    }catch(error){
        return res.json({"mensaje":"error en el servidor",error})
    }


    
  
}


/*----------------------------------------------------------------Correcto----------------------*/
export const listarFichas = async(req, res)=>{
    try{

        //consulta de datos 
        let sql = `
        SELECT
        idFichas,
        fi_placa_sena,
        fi_estado,
        sit_nombre,
        tipo_equipo.ti_fi_nombre AS nombre
        FROM ambientes
        INNER JOIN fichas_maquinas_equipos ON  idAmbientes  = fi_fk_sitios
        INNER JOIN tipo_equipo ON tipo_equipo.idTipo_ficha = fichas_maquinas_equipos.fi_fk_tipo_ficha
        WHERE tipo_ficha = "equipo"
        `
        const  [respuesta] = await conexion.query(sql)

        if(respuesta.length>0){

            //hacemos consulta de las variables de clase obligatoria

            for (let i = 0 ; respuesta.length>i ;i++ ){

                let vari = `
                SELECT
                var_nombre,
                idVariable,
                det_valor
                FROM 
                variable
                INNER JOIN detalles_fichas ON idVariable =  det_fk_variable
                WHERE det_fk_fichas = ${respuesta[i].idFichas} AND var_clase = 'obligatoria'
                `
                const [infoVar] = await conexion.query(vari)

                //for para seleccionar solo las variables que queremos, y con una condicion le decimos que variable queremos traer a travez del id
                for(let j = 0; infoVar.length > j; j++){
                    
                    switch(infoVar[j].idVariable){
                        case 1 :
                            respuesta[i]["fi_fecha_adquisicion"] = infoVar[j].det_valor
                            break
                        case 2:
                            respuesta[i]["fi_serial"] = infoVar[j].det_valor
                            break
                        case 3:
                            respuesta[i]["fi_fecha_inicio_garantia"] = infoVar[j].det_valor
                            break
                        case 4:
                            respuesta[i]["fi_fecha_fin_garantia"] = infoVar[j].det_valor
                            break
                        case 5:
                            respuesta[i]["fi_descripcion_garantia"] = infoVar[j].det_valor
                            break
                        case 6:
                            respuesta[i]["fi_descripcion"] = infoVar[j].det_valor
                            break
                        case 7:
                            respuesta[i]["fi_marca"] = infoVar[j].det_valor
                            break
                        case 8:
                            respuesta[i]["fi_modelo"] = infoVar[j].det_valor
                            break
                        case 9:
                            respuesta[i]["fi_precioEquipo"] = infoVar[j].det_valor
                            break
                    }
                }
            }

            res.status(200).json(respuesta)
        }
        else{
            res.status(404).json({"mensaje":"No se encontraron fichas."})
        }

    }catch(error){
        return res.status(500).json({"mensaje":"Error en el servidor"+error})
    }
}

export const listarFichaPorAmbiente = async(req, res)=>{

    try{

        let idAmbiente = req.params.idAmbiente

        let sql = `
        SELECT 
		idFichas, 
        fi_placa_sena,
        fi_imagen,
        fi_estado,
        ti_fi_nombre
        FROM ambientes
        INNER JOIN fichas_maquinas_equipos ON idAmbientes = fi_fk_sitios
        INNER JOIN tipo_equipo ON fi_fk_tipo_ficha = idTipo_ficha
        WHERE idAmbientes = ${idAmbiente} and tipo_ficha = "equipo"
        `
        const [resuladoFichas] = await conexion.query(sql)

        if(resuladoFichas.length>0){

            //consulta de las varibales de clase obligatoria
            for(let i = 0 ; resuladoFichas.length>i ;i++ ){
                
                let vari = `
                SELECT
                var_nombre,
                idVariable,
                det_valor
                FROM 
                variable

                INNER JOIN detalles_fichas ON idVariable =  det_fk_variable
                WHERE det_fk_fichas = ${resuladoFichas[i].idFichas} AND var_clase = 'obligatoria'
                `
                const [infoVar] = await conexion.query(vari)

                //for para seeccionar solo las variables que queremos traer
                
                for(let j = 0; infoVar.length > j; j++){

                    if(infoVar[j].idVariable == 2){              //2 = id de la variable serial........
                        resuladoFichas[i]["fi_serial"] = infoVar[j].det_valor
                    }
                    else if(infoVar[j].idVariable == 8){
                        resuladoFichas[i]["fi_modelo"] = infoVar[j].det_valor
                    }
                }
            }

            res.status(200).json(resuladoFichas)
        }
        else{
            res.status(404).json({"mensaje":"No se encontraron fichas en este ambiente"})
        }

    }
    catch(error){
        return res.status(500).json({"message":"Error en el servidor",error})
    }

}



export const listarInfoEspecifica = async(req, res)=>{

    try{
        let idFicha = req.params.idFicha

        //buscamos informacion de la ficha correspondiente
        let sqlFicha = `
        SELECT 
        idFichas, 
        fi_placa_sena,
        fi_imagen,
        fi_estado,
        CodigoQR,
        sit_Nombre, 
        area_nombre,
        sede_nombre,
        sede_regional,
        sede_municipio,
        sede_direccion,
        ficha_respaldo,
        ti_fi_nombre as tipoEquipo

        FROM tipo_equipo
        INNER JOIN fichas_maquinas_equipos ON idTipo_ficha = fi_fk_tipo_ficha
        INNER JOIN ambientes ON fi_fk_sitios = idAmbientes
        INNER JOIN areas ON sit_fk_areas = idArea
        INNER JOIN sedes ON area_fk_sedes = idSede
        WHERE idFichas = ${idFicha}

        `
        const[respuesta] = await conexion.query(sqlFicha)
        
        if(respuesta.length > 0 ){

            //consultar variables y asignarles una clave

            let vari = `
                SELECT
                var_nombre,
                idVariable,
                det_valor
                FROM 
                variable
                INNER JOIN detalles_fichas ON idVariable =  det_fk_variable
                WHERE det_fk_fichas = ${respuesta[0].idFichas} AND var_clase = 'obligatoria'`

            const [variablesInfo] = await conexion.query(vari)


            for(let i = 0; variablesInfo.length > i; i++){
                switch(variablesInfo[i].idVariable){
                    case 1 :
                        respuesta[0]["fi_fecha_adquisicion"] = variablesInfo[i].det_valor
                        break
                    case 2:
                        respuesta[0]["fi_serial"] = variablesInfo[i].det_valor
                        break
                    case 3:
                        respuesta[0]["fi_fecha_inicio_garantia"] = variablesInfo[i].det_valor
                        break
                    case 4:
                        respuesta[0]["fi_fecha_fin_garantia"] = variablesInfo[i].det_valor
                        break
                    case 5:
                        respuesta[0]["fi_descripcion_garantia"] = variablesInfo[i].det_valor
                        break
                    case 6:
                        respuesta[0]["fi_descripcion"] = variablesInfo[i].det_valor
                        break
                    case 7:
                        respuesta[0]["fi_marca"] = variablesInfo[i].det_valor
                        break
                    case 8:
                        respuesta[0]["fi_modelo"] = variablesInfo[i].det_valor
                        break
                    case 9:
                        respuesta[0]["fi_precioEquipo"] = variablesInfo[i].det_valor
                        break
                }
            }
        
            //le envio solo el objeto dentro del array no propiamente el array
            return res.status(200).json(respuesta[0])
           
    
    
        }else{
            return res.status(404).json({"mensaje":"No se encontro ficha"})
        }

    }catch(error){
        return res.status(500).json({"mensaje":"error en el servidor"+error})
    }   
}




export const actualizarFichaEsp = async ( req, res)=>{

    try{
        let {fiEstado, fk_sitio } = req.body

        let idFicha = req.params.idFicha
    

        let sql
        let mensaje

        if (fiEstado !== undefined) {
            sql = `update fichas_maquinas_equipos set fi_estado='${fiEstado}' where idFichas = ${idFicha}`
            mensaje = "Se actualizó correctamente el estado de la ficha"
        } else if (fk_sitio !== undefined) {
            sql = `update fichas_maquinas_equipos set fi_fk_sitios =${fk_sitio} where  idFichas = ${idFicha}`
            mensaje = "Se actualizó correctamente el sitio de la ficha";
        } else {
            return res.status(400).json({ mensaje: "No se proporcionaron datos válidos para actualizar" });
        }
    
        let [respuesta] = await conexion.query(sql)
    
        if(respuesta.affectedRows>0){
            return res.status(200).json({"mensaje": mensaje})
        }
        else{
            return res.status(404).json({"mensaje":"Error al actualizar ficha"})
        }
    }
    catch(error){
        return res.status(500).json({"mensaje":"Error en el servidor".error})
    }
}




export const eliminarFicha = async(req, res)=>{
    try{
        let idFicha = req.params.idFicha

        let sql = `delete from  fichas where idFichas=${idFicha}`

        let[respuesta]= await conexion.query(sql)

        if (respuesta.affectedRows>0){
            res.status(200).json({"mensaje":"Se elimino correctamente"})
        }
        else{
            res.status(404).json({"mensaje":"No se elimino"})
        }

    }catch(error){
        return res.status(500).json({"mensaje":"Error en el servidor"})
    }
}


export const listarFichaUnica=async (req, res)=>{
    try{

        let idFicha = req.params.idFicha
    
    
        /* Conusultamos la informacion basica del equipo */
    
        let sqlEquipo =  `
        SELECT 
            fi_placa_sena, 
            fi_imagen, 
            ficha_respaldo,
            fi_estado,
            idAmbientes,
            fi_fk_sitios,
            sit_nombre,
            area_nombre,
            sede_nombre,
            sede_regional,
            sede_municipio,
            ti_fi_nombre 
        
            FROM tipo_equipo
            INNER JOIN fichas_maquinas_equipos ON idTipo_ficha = fi_fk_tipo_ficha
            INNER JOIN ambientes ON fi_fk_sitios = idAmbientes
            INNER JOIN areas ON sit_fk_areas = idArea
            INNER JOIN sedes ON area_fk_sedes = idSede
                
            WHERE idFichas =${idFicha}
            `
    
        const [infoEquipo] = await conexion.query(sqlEquipo)
    
    
        if (infoEquipo.length >0 ){
    
            let sqlVariables = `
            SELECT
                idDetalle,
                det_valor,
                idVariable,
                var_nombre,
                var_descripcion,
                var_clase,
                var_tipoDato
                FROM detalles_fichas
                INNER JOIN variable ON det_fk_variable = idVariable
                WHERE det_fk_fichas = ${idFicha} 
            `
        
            const [varEquipo] = await conexion.query(sqlVariables)


            let objFicha = {
                infoFicha: infoEquipo,
                infoVar:varEquipo
            }

            return res.status(200).json(objFicha)

        }
        else{
            return res.status(404).json({"mensaje":"No se encontraro la ficha."})
        }

    
       }catch(error){
            return res.status(500).json({"mensaje":"Error en el servidor"})
       }
}





export const  listarMantenimientosMaquina = async (req, res)=>{

    try{

        let idFicha = req.params.idFicha

        let sqlMantenimientos = `

        SELECT
        idMantenimiento,
        nombre_solicitante,
        mant_codigo_mantenimiento,
        mant_estado,
        mant_costo_final,
        man_fecha_realizacion,
        mant_descripcion, 
        mant_ficha_soporte,
        mant_fecha_proxima,
        soli_descripcion_problemas,
        fecha_solicitud,
        soli_costo_estimado,
        fk_tecnico,
        mant_costo_final,
        tipo_mantenimiento 
        FROM tipo_mantenimiento
        INNER JOIN mantenimiento ON idTipo_mantenimiento = fk_tipo_mantenimiento
        INNER JOIN solicitud_mantenimiento ON fk_solicitud_mantenimiento = idSolicitud
        INNER JOIN solicitud_has_fichas ON idSolicitud = fk_solicitud
        INNER JOIN fichas_maquinas_equipos ON fk_fichas = idFichas
        WHERE idFichas = ${idFicha}
        GROUP BY idMantenimiento
        `
        
        const[mantenimientos] = await conexion.query(sqlMantenimientos)

        if (mantenimientos.length > 0){

            
            for (let i = 0; i < mantenimientos.length; i++) {
                const tecnicoId = mantenimientos[i].fk_tecnico

                // Consulta para obtener los detalles del técnico
                let sqlTec = `
                    SELECT
                        us_nombre,
                        us_apellidos, 
                        us_empresa
                    FROM usuarios
                    WHERE idUsuarios = ${tecnicoId}
                `

                const [userTec] = await conexion.query(sqlTec);
                
                // Agregamos los detalles del técnico al objeto del mantenimiento
                if (userTec.length > 0) {
                    mantenimientos[i].tecnico = {
                        nombre: userTec[0].us_nombre,
                        apellidos: userTec[0].us_apellidos,
                        empresa: userTec[0].us_empresa,
                    };
                }
            }
            


            return res.status(200).json(mantenimientos)
        }
        else{
            return res.status(404).json({"mensaje":"No se encontraron mantenimientos para este equipo"})
        }

    }catch(error){
        return res.status(500).json({"mensaje":"Error en el servidor"+error})
    }
}

export const ExcelAmbiente = async (req, res) => {
    try {
        let idAmbientes = req.params.idAmbientes;
  
        /* Consultamos la información básica del equipo */
        let sqlEquipo = `
        SELECT DISTINCT
            idAmbientes,
            fi_fk_sitios,
            sit_nombre,
            sit_fecha_registro,
            area_nombre,
            sede_nombre,
            sede_subdirector,
            contacto,
            sede_direccion,
            tipo_tenencia,
            sede_nombre_centro,
            sede_nombre,
            sede_regional,
            sede_municipio,
            ti_fi_nombre 
        FROM tipo_equipo
        INNER JOIN fichas_maquinas_equipos ON idTipo_ficha = fi_fk_tipo_ficha
        INNER JOIN ambientes ON fi_fk_sitios = idAmbientes
        INNER JOIN areas ON sit_fk_areas = idArea
        INNER JOIN sedes ON area_fk_sedes = idSede
        WHERE idAmbientes = ${idAmbientes} AND  fi_placa_sena IS NULL
        `;
  
        const [infoEquipo] = await conexion.query(sqlEquipo);
  
        if (infoEquipo.length > 0) {
            let sqlVariables = `
            SELECT
                idDetalle,
                det_valor,
                idVariable,
                var_nombre,
                var_descripcion,
                var_clase,
                var_tipoDato
            FROM detalles_fichas
            INNER JOIN variable ON det_fk_variable = idVariable
            WHERE det_fk_fichas IN (
                SELECT idFichas 
                FROM fichas_maquinas_equipos 
                WHERE fi_fk_sitios = ${idAmbientes} AND ficha = "ambiente"
            )
            `;
  
            const [varEquipo] = await conexion.query(sqlVariables);
  
            let objFicha = {
                infoFicha: infoEquipo,  // Información básica sin duplicados
                infoVar: varEquipo      // Variables relacionadas con la ficha
            };
  
            return res.status(200).json(objFicha);
        } else {
            return res.status(404).json({ "mensaje": "No se encontraron fichas para este ambiente." });
        }
    } catch (error) {
        return res.status(500).json({ "mensaje": "Error en el servidor" });
    }
  };