import { conexion } from "../database/database.js";
import { validationResult } from "express-validator";
import multer from "multer";
import path from "path";

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/pdfs");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"), false);
    }
  },
}).single("mant_ficha_soporte");

// Middleware para manejar la subida del archivo y procesar los datos del formulario
export const cargarMantenimiento = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ mensaje: "Error en la carga del archivo" });
    } else if (err) {
      return res.status(500).json({ mensaje: "Error inesperado" });
    }

    // Convertir los campos numéricos a su tipo correcto
    if (req.body.mant_costo_final) req.body.mant_costo_final = parseFloat(req.body.mant_costo_final);
    if (req.body.fk_tipo_mantenimiento) req.body.fk_tipo_mantenimiento = parseInt(req.body.fk_tipo_mantenimiento, 10);
    if (req.body.fk_solicitud_mantenimiento) req.body.fk_solicitud_mantenimiento = parseInt(req.body.fk_solicitud_mantenimiento, 10);
    if (req.body.fk_tecnico) req.body.fk_tecnico = parseInt(req.body.fk_tecnico, 10);

    next();
  });
};

export const registrarMantenimiento = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      mant_codigo_mantenimiento,
      mant_estado,
      mant_fecha_proxima,
      man_fecha_realizacion,
      mant_descripcion,
      mant_costo_final,
      fk_tipo_mantenimiento,
      fk_solicitud_mantenimiento,
      fk_tecnico,
      mant_maquina
    } = req.body;

    const mant_ficha_soporte = req.file ? path.basename(req.file.path) : null;

    const sql = `
      INSERT INTO mantenimiento (
        mant_codigo_mantenimiento,
        mant_estado,
        mant_fecha_proxima,
        man_fecha_realizacion,
        fk_tipo_mantenimiento,
        mant_descripcion,
        mant_ficha_soporte,
        mant_costo_final,
        fk_solicitud_mantenimiento,
        fk_tecnico,
        mant_maquina
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [resultado] = await conexion.query(sql, [
      mant_codigo_mantenimiento,
      mant_estado,
      mant_fecha_proxima,
      man_fecha_realizacion,
      fk_tipo_mantenimiento,
      mant_descripcion,
      mant_ficha_soporte,
      mant_costo_final,
      fk_solicitud_mantenimiento,
      fk_tecnico,
      mant_maquina
    ]);

    if (resultado.affectedRows > 0) {
      const idMantenimiento = resultado.insertId;
      return res.status(200).json({
        mensaje: "Se registró el mantenimiento con éxito",
        idMantenimiento,
      });
    } else {
      return res.status(400).json({ mensaje: "No se registró el mantenimiento" });
    }
  } catch (e) {
    return res.status(500).json({ mensaje: "Error: " + e.message });
  }
};


/* 5.1 Generar alertas de mantenimiento de a través de correo electrónico */
import { mantenimiento_correo } from "../config/mantenimiento_email/email_mantenimineto.js";
import { emailHtml_mantenimiento } from "../config/mantenimiento_email/emailhtml_mantenimiento.js";

/* Listo función para verificar y enviar correos electrónicos de mantenimiento automáticamente */
const verificarEnvioCorreosMantenimiento = async () => {
  try {
    const currentDate = new Date(); 

    //calcular la fecha de inicio
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() + 1); 

    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 7);

    //formatear las fechas a 'YYYY-MM-DD'
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const currentDateString = formatDate(currentDate);
    const startDateString = formatDate(startDate);
    const endDateString = formatDate(endDate);

    const sqlMantenimientos = `
      SELECT 
        m.idMantenimiento,
        m.fk_solicitud_mantenimiento,
        m.mant_fecha_proxima, 
        m.mant_codigo_mantenimiento,
        sm.correo_solicitante
      FROM mantenimiento m
      JOIN solicitud_mantenimiento sm ON m.fk_solicitud_mantenimiento = sm.idSolicitud
      WHERE 
        m.mant_fecha_proxima BETWEEN ? AND ?
        AND m.mant_estado != 'Completado'
    `;

    const [mantenimientos] = await conexion.query(sqlMantenimientos, [startDateString, endDateString]);

    // 6. Verificar si se encontraron mantenimientos
    if (mantenimientos.length === 0) {
      console.log("No hay mantenimientos programados en los próximos 7 días.");
      return;
    }

    console.log(`Se encontraron ${mantenimientos.length} mantenimientos programados.`);

    // extrae todos los correos solicitantes únicos
    const correosSolicitantes = [...new Set(mantenimientos.map(m => m.correo_solicitante))];

    if (correosSolicitantes.length === 0) {
      console.log("No se encontraron correos solicitantes para los mantenimientos.");
      return;
    }

    const sqlUsuarios = `
      SELECT 
        us_nombre, 
        us_apellidos, 
        us_correo
      FROM usuarios
      WHERE us_correo IN (?)
    `;

    const [usuarios] = await conexion.query(sqlUsuarios, [correosSolicitantes]);

    const mapaUsuarios = {};
    usuarios.forEach(user => {
      mapaUsuarios[user.us_correo.toLowerCase()] = user;
    });

    for (const mantenimiento of mantenimientos) {
      const correoSolicitante = mantenimiento.correo_solicitante.toLowerCase();
      const usuario = mapaUsuarios[correoSolicitante];

      if (!usuario) {
        console.warn(`No se encontró usuario para el correo solicitante: ${mantenimiento.correo_solicitante}`);
        continue;
      }
      const html = emailHtml_mantenimiento({
        ...mantenimiento,
        us_nombre: usuario.us_nombre,
        us_apellidos: usuario.us_apellidos,
        us_correo: usuario.us_correo,
      });

      try {
        await mantenimiento_correo.sendMail({
          from: '"MachinApp" <machinappsena@gmail.com>',
          to: usuario.us_correo,
          subject: "Recordatorio de Mantenimiento",
          html: html,
        });
      } catch (error) {
        console.error(`Error al enviar correo a ${usuario.us_correo}:`, error);
      }
    }

  } catch (error) {
    console.error("Error al verificar y enviar correos electrónicos:", error);
  }
};

/* ejecuta el codigo para verificar cada dia */
setInterval(verificarEnvioCorreosMantenimiento, 24 * 60 * 60 * 1000);
/* setInterval(verificarEnvioCorreosMantenimiento, 10 * 1000); */

/* front-end */
/* listo listar mantenimientos */
export const listartodosmantenimientos = async (req, res) => {
  try {
    const sql = `
      SELECT
        fme.fi_placa_sena AS referencia_maquina,
        m.idMantenimiento,
        m.mant_codigo_mantenimiento,
        m.mant_descripcion,
        m.mant_estado,
        m.man_fecha_realizacion,
        m.mant_fecha_proxima,
        m.mant_costo_final,
        a.acti_estado,
        a.idActividades,
        a.acti_nombre,
        tm.tipo_mantenimiento,
        fme.idFichas,
        fme.fi_estado
      FROM
        mantenimiento m
      LEFT JOIN
        solicitud_mantenimiento sm ON m.fk_solicitud_mantenimiento = sm.idSolicitud
      LEFT JOIN
        solicitud_has_fichas shf ON sm.idSolicitud = shf.fk_solicitud
      LEFT JOIN
        fichas_maquinas_equipos fme ON shf.fk_fichas = fme.idFichas
      LEFT JOIN
        actividades a ON a.acti_fk_solicitud = sm.idSolicitud
      LEFT JOIN
        tipo_mantenimiento tm ON m.fk_tipo_mantenimiento = tm.idTipo_mantenimiento
    `;

    const [result] = await conexion.query(sql);

    if (result.length > 0) {
      const mantenimientos = [];
      const idsProcesados = new Set();

      for (const row of result) {
        if (!idsProcesados.has(row.idMantenimiento)) {
          const mantenimiento = {
            idMantenimiento: row.idMantenimiento,
            referencia_maquina: row.referencia_maquina,
            codigo_mantenimiento: row.mant_codigo_mantenimiento,
            descripcion_mantenimiento: row.mant_descripcion,
            mant_fecha_realizacion: row.man_fecha_realizacion ? new Date(row.man_fecha_realizacion).toLocaleDateString("es-ES") : null,
            mant_fecha_proxima: row.mant_fecha_proxima ? new Date(row.mant_fecha_proxima).toLocaleDateString("es-ES") : null,
            mant_costo_final: row.mant_costo_final,
            estado_maquina: row.acti_estado,
            idActividades: row.idActividades,
            acti_nombre: row.acti_nombre,
            tipo_mantenimiento: row.tipo_mantenimiento,
            idFichas: row.idFichas,
            estado_ficha: row.fi_estado,
            mant_estado: row.mant_estado,
          };
          mantenimientos.push(mantenimiento);
          idsProcesados.add(row.idMantenimiento);
        }
      }

      res.status(200).json(mantenimientos);
    } else {
      res.status(404).json({
        message: "No se encontraron mantenimientos en la base de datos.",
      });
    }
  } catch (err) {
    console.error("Error en listartodosmantenimientos:", err);
    res.status(500).json({
      message: "Error en el controlador listartodosmantenimientos: " + err.message,
    });
  }
};

/* listo actualizar */
export const actualizarMantenimiento = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      mant_codigo_mantenimiento,
      mant_estado,
      mant_fecha_proxima,
      mant_descripcion,
      mant_costo_final,
      fk_tipo_mantenimiento,
      fk_solicitud_mantenimiento,
      mant_maquina
    } = req.body;

    const mant_ficha_soporte = req.file ? path.basename(req.file.path) : null;

    const { idMantenimiento } = req.params;

    let sql = `
      UPDATE mantenimiento SET
        mant_codigo_mantenimiento = ?,
        mant_estado = ?,
        mant_fecha_proxima = ?,
        fk_tipo_mantenimiento = ?,
        mant_descripcion = ?,
        mant_costo_final = ?,
        fk_solicitud_mantenimiento = ?,
        mant_maquina = ?
    `;

    const params = [
      mant_codigo_mantenimiento,
      mant_estado,
      mant_fecha_proxima,
      fk_tipo_mantenimiento,
      mant_descripcion,
      mant_costo_final,
      fk_solicitud_mantenimiento,
      mant_maquina
    ];

    if (mant_ficha_soporte) {
      sql += ', mant_ficha_soporte = ?';
      params.push(mant_ficha_soporte);
    }

    sql += ' WHERE idMantenimiento = ?';
    params.push(idMantenimiento);

    const [resultado] = await conexion.query(sql, params);

    if (resultado.affectedRows > 0) {
      return res.status(200).json({ mensaje: "Mantenimiento actualizado con éxito" });
    } else {
      return res.status(404).json({ mensaje: "Mantenimiento no encontrado" });
    }
  } catch (e) {
    return res.status(500).json({ mensaje: "Error: " + e.message });
  }
};

export const graficas = async (req, res) => {
  try {
    const sql = `
                SELECT 
          YEAR(mantenimiento.mant_fecha_proxima) AS anio,
          MONTH(mantenimiento.mant_fecha_proxima) AS mes,
          COUNT(mantenimiento.mant_fecha_proxima) as tota_mantenimientos,
          tipo_mantenimiento.tipo_mantenimiento,
          mantenimiento.mant_estado
          from mantenimiento

          INNER JOIN tipo_mantenimiento ON tipo_mantenimiento.idTipo_mantenimiento = mantenimiento.fk_tipo_mantenimiento

          GROUP BY anio, mes, tipo_mantenimiento.tipo_mantenimiento, mantenimiento.mant_estado
          ORDER by anio, mes;
        `;

    const [result] = await conexion.query(sql);
    

    /* if (result.length === 0) return res.status(404).json({ mensaje: "no" }); */

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(err);
  }
};


export const listarMantenimientoPorId = async (req, res) => {
  try {
    const { idMantenimiento } = req.params;

    const sql = `
      SELECT
        fme.fi_placa_sena AS referencia_maquina,
        m.idMantenimiento,
        m.mant_codigo_mantenimiento,
        m.mant_descripcion,
        m.mant_estado,
        m.mant_fecha_proxima,
        m.man_fecha_realizacion,
        m.mant_costo_final,
        m.fk_solicitud_mantenimiento,
        m.fk_tecnico,
        a.acti_estado,
        a.idActividades,
        a.acti_nombre,
        tm.tipo_mantenimiento,
        fme.idFichas,
        fme.fi_estado
      FROM
        mantenimiento m
      LEFT JOIN
        solicitud_mantenimiento sm ON m.fk_solicitud_mantenimiento = sm.idSolicitud
      LEFT JOIN
        solicitud_has_fichas shf ON sm.idSolicitud = shf.fk_solicitud
      LEFT JOIN
        fichas_maquinas_equipos fme ON shf.fk_fichas = fme.idFichas
      LEFT JOIN
        actividades a ON a.acti_fk_solicitud = sm.idSolicitud
      LEFT JOIN
        tipo_mantenimiento tm ON m.fk_tipo_mantenimiento = tm.idTipo_mantenimiento
      WHERE
        m.idMantenimiento = ?
    `;

    const [result] = await conexion.query(sql, [idMantenimiento]);

    if (result.length > 0) {
      const [tecnico] = await conexion.query(`SELECT * FROM usuarios WHERE idUsuarios = ?`, [result[0].fk_tecnico]);

      const mantenimiento = {
        idMantenimiento: result[0].idMantenimiento,
        referencia_maquina: result[0].referencia_maquina,
        codigo_mantenimiento: result[0].mant_codigo_mantenimiento,
        descripcion_mantenimiento: result[0].mant_descripcion,
        mant_fecha_proxima: result[0].mant_fecha_proxima ? new Date(result[0].mant_fecha_proxima).toLocaleDateString("es-ES") : null,
        man_fecha_realizacion: result[0].man_fecha_realizacion ? new Date(result[0].man_fecha_realizacion).toLocaleDateString("es-ES") : null,
        mant_costo_final: result[0].mant_costo_final,
        fk_solicitud_mantenimiento: result[0].fk_solicitud_mantenimiento,
        tecnico: tecnico[0] ? `${tecnico[0].us_nombre} ${tecnico[0].us_apellidos}` : null,
        id_tecnico: tecnico[0] ? tecnico[0].idUsuarios : null,
        estado_maquina: result[0].acti_estado,
        idActividades: result[0].idActividades,
        acti_nombre: result[0].acti_nombre,
        tipo_mantenimiento: result[0].tipo_mantenimiento,
        idFichas: result[0].idFichas,
        estado_ficha: result[0].fi_estado,
        mant_estado: result[0].mant_estado,
      };

      res.status(200).json(mantenimiento);
    } else {
      res.status(404).json({
        message: "No se encontró un mantenimiento con ese id.",
      });
    }
  } catch (err) {
    console.error("Error en listarMantenimientoPorId:", err);
    res.status(500).json({
      message: "Error en el controlador listarMantenimientoPorId: " + err.message,
    });
  }
};


export const listarMaquinasPorSolicitud = async (req, res) => {
  try {
    const { idSolicitud } = req.params;

    const sql = `
      SELECT DISTINCT
        fme.fi_placa_sena AS referencia_maquina,
        fme.idFichas AS id_maquina
      FROM
        solicitud_mantenimiento sm
      LEFT JOIN
        solicitud_has_fichas shf ON sm.idSolicitud = shf.fk_solicitud
      LEFT JOIN
        fichas_maquinas_equipos fme ON shf.fk_fichas = fme.idFichas
      WHERE
        sm.idSolicitud = ?
    `;

    const [result] = await conexion.query(sql, [idSolicitud]);

    if (result.length > 0) {
      const maquinas = result.map((row) => ({
        referencia_maquina: row.referencia_maquina,
        id_maquina: row.id_maquina
      }));

      res.status(200).json(maquinas);
    } else {
      res.status(404).json({
        message: "No se encontraron máquinas para esa solicitud.",
      });
    }
  } catch (err) {
    console.error("Error en listarMaquinasPorSolicitud:", err);
    res.status(500).json({
      message: "Error en el controlador listarMaquinasPorSolicitud: " + err.message,
    });
  }
};

export const excelconsultavariables = async (req, res) => {
  try {
    const sql = `
      SELECT 
        m.idMantenimiento,
        MAX(fme.fi_placa_sena) AS fi_placa_sena,
        m.mant_codigo_mantenimiento AS codigo_mantenimiento,
        m.mant_fecha_proxima,
        m.man_fecha_realizacion,
        MAX(te.ti_fi_nombre) AS nombre,
        m.mant_costo_final,
        m.fk_tecnico,
        m.mant_descripcion AS descripcion_mantenimiento,
        MAX(tm.tipo_mantenimiento) AS tipo_mantenimiento,
        MAX(a.sit_nombre) AS sit_nombre,
        MAX(ar.area_nombre) AS area_nombre,
        MAX(s.sede_nombre_centro) AS sede_nombre_centro,
        MAX(s.sede_nombre) AS sede_nombre,
        MAX(sm.soli_prioridad) AS soli_prioridad,
        GROUP_CONCAT(DISTINCT pm.par_nombre_repuesto SEPARATOR ', ') AS par_nombre_repuesto,
        (SELECT SUM(pm_inner.par_costo) 
         FROM partes_mantenimiento pm_inner 
         WHERE pm_inner.par_fk_mantenimientos = m.idMantenimiento
        ) AS par_costo_total
      FROM 
        mantenimiento m
        LEFT JOIN solicitud_mantenimiento sm ON m.fk_solicitud_mantenimiento = sm.idSolicitud
        LEFT JOIN solicitud_has_fichas shf ON sm.idSolicitud = shf.fk_solicitud
        LEFT JOIN fichas_maquinas_equipos fme ON shf.fk_fichas = fme.idFichas
        LEFT JOIN tipo_mantenimiento tm ON m.fk_tipo_mantenimiento = tm.idTipo_mantenimiento
        LEFT JOIN tipo_equipo te ON fme.fi_fk_tipo_ficha = te.idTipo_ficha
        LEFT JOIN ambientes a ON fme.fi_fk_sitios = a.idAmbientes
        LEFT JOIN areas ar ON a.sit_fk_areas = ar.idArea
        LEFT JOIN sedes s ON ar.area_fk_sedes = s.idSede
        LEFT JOIN partes_mantenimiento pm ON m.idMantenimiento = pm.par_fk_mantenimientos
      GROUP BY 
        m.idMantenimiento
    `;
    const [resultado] = await conexion.query(sql);
    
    const resultadoCorregido = resultado.map(item => ({
      ...item,
      mant_fecha_proxima: item.mant_fecha_proxima ? new Date(item.mant_fecha_proxima).toISOString().split('T')[0] : null,
      man_fecha_realizacion: item.man_fecha_realizacion ? new Date(item.man_fecha_realizacion).toISOString().split('T')[0] : null,
      mant_costo_final: parseFloat(item.mant_costo_final),
      par_costo_total: parseFloat(item.par_costo_total),
    }));

    res.status(200).json(resultadoCorregido);
  } catch (error) {
    console.error("Error en excelconsultavariables:", error);
    res.status(500).json({
      message: "Error en el controlador excelconsultavariables: " + error.message
    });
  }
};