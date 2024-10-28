import { check } from "express-validator";

export const ActualizarMantenimiento = [
  check('mant_codigo_mantenimiento', 'El código de mantenimiento debe tener entre 1 y 250 caracteres').isLength({ min: 1, max: 250 }),
  check('mant_estado', 'El estado debe ser uno de los valores permitidos').isIn(['Pendiente', 'En Proceso', 'Completado', 'En Espera']),
  check('mant_fecha_proxima', 'La fecha próxima debe ser válida').optional().isISO8601().toDate(),
  check('mant_descripcion', 'La descripción es obligatoria').notEmpty(),
  check('mant_costo_final', 'El costo final debe ser un número válido').isNumeric(),
  check('fk_tipo_mantenimiento', 'El tipo de mantenimiento debe ser un número positivo').isInt({ min: 1 }),
  check('fk_solicitud_mantenimiento', 'La solicitud de mantenimiento debe ser un número positivo').isInt({ min: 1 }),
  check('fk_tecnico', 'El técnico debe ser un número positivo').optional().isInt({ min: 1 }),
  check('mant_maquina', 'La maquina relacionada a este mantenimiento debe tener entre 1 y 100 caracteres').isLength({ min: 1, max: 100 }),
];