import {saveAs} from 'file-saver';
import ExcelJS from 'exceljs';
import {DocumentArrowDownIcon} from "@heroicons/react/24/outline";
import {axiosCliente} from "../../../index.js"
import {useState, useEffect} from "react";

// eslint-disable-next-line react/prop-types
export const ExcelAmbientes = ({idAmbiente}) => {

    // para poder almacenar la informacion del ambiente general
    const [infoAmbiente, setAmbiente] = useState({});
/*     const [infoEquipo, setEquipo] = useState({}); */

    // obtenemos todas las variables
    const [variablesAmbientes, setVariablesAmbientes] = useState([]);

    // clasificamos las variables por clase
    const [variableClase, setVariableClase] = useState([]);


    const getAmbientes = async () => {
        try {
            const response = await axiosCliente.get(`/ficha/excelambientes/${idAmbiente}`)
            console.log('Datos de equipos:', response.data);
            setAmbiente(response.data.infoFicha);
            setVariablesAmbientes(response.data.infoVar || []);
        } catch (e) {
            console.error(e.response);
        }
    }

    useEffect(() => {
        getAmbientes()
    }, [idAmbiente])

    useEffect(() => {


        const clasificarPorVarClase = variablesAmbientes.reduce((acc, item) => {
            const clase = item.var_clase;
            if (!acc[clase]) {
                acc[clase] = [];
            }
            acc[clase].push(item);
            return acc;
        }, {});
        setVariableClase(clasificarPorVarClase);
    }, [variablesAmbientes])

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Hoja1');

        // Aumentar el ancho de las columnas
        worksheet.columns = [
            {width: 20}, {width: 20}, {width: 20}, {width: 20},
            {width: 20}, {width: 20}, {width: 20}, {width: 20},
            {width: 20}, {width: 20}, {width: 20}, {width: 20}
        ];

        const addBorders = (range) => {
            worksheet.getCell(range).border = {
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'}
            };
        };

        // Aumentar la altura de las filas con contenido extenso
        worksheet.getRow(1).height = 30;
        worksheet.getRow(3).height = 40;
        worksheet.getRow(14).height = 50;

        worksheet.mergeCells('A1:L1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'IDENTIFICACIÓN DEL ESTADO ACTUAL DEL AMBIENTE DE APRENDIZAJE "FIJO"';
        titleCell.font = {bold: true, size: 14};
        titleCell.alignment = {horizontal: 'center', vertical: 'middle', wrapText: true};
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFFD966'}
        };
        addBorders('A1:L1');

        worksheet.mergeCells('A2:L2');
        const subtitleCell = worksheet.getCell('A2');
        subtitleCell.value = '(MODALIDAD PRESENCIAL )';
        subtitleCell.font = {bold: true, size: 12};
        subtitleCell.alignment = {horizontal: 'center', vertical: 'middle'};
        subtitleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFFD966'}
        };
        addBorders('A2:L2');

        worksheet.mergeCells('A3:L3');
        const descriptionCell = worksheet.getCell('A3');
        descriptionCell.value = 'Grupo de Ejecución de la Formación Profesional - Dirección de Formación Profesional\nGrupo de Construcciones - Dirección Administrativa y Financiera';
        descriptionCell.font = {size: 10};
        descriptionCell.alignment = {horizontal: 'center', vertical: 'middle', wrapText: true};
        descriptionCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFFD966'}
        };
        addBorders('A3:L3');

        worksheet.mergeCells('A4:L4');
        const infoHeaderCell = worksheet.getCell('A4');
        infoHeaderCell.value = '1.INFORMACIÓN GENERAL';
        infoHeaderCell.font = {bold: true, size: 11};
        infoHeaderCell.alignment = {horizontal: 'left', vertical: 'middle'};
        infoHeaderCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFA6A6A6'}
        };
        addBorders('A4:L4');

        const generalInfo = [
            ['FECHA DILIGENCIAMIENTO:', '', infoAmbiente[0].sit_fecha_registro, '', 'MUNICIPIO:', '', infoAmbiente[0].sede_municipio],
            ['REGIONAL:', '', infoAmbiente[0].sede_regional, '', 'DATOS DE CONTACTO:', '', infoAmbiente[0].contacto],
            ['CENTRO DE FORMACIÓN:', '', infoAmbiente[0].sede_nombre_centro, '', 'NOMBRE DEL AMBIENTE DE FORMACIÓN:', '', infoAmbiente[0].sit_nombre],
            ['NOMBRE DE LA SEDE:', '', infoAmbiente[0].sede_nombre, '', 'TIPO DE AMBIENTE DE FORMACIÓN:', '', infoAmbiente[0].tipo_sitio],
            ['NOMBRE SUBDIRECTOR DE CENTRO:', '', infoAmbiente[0].sede_subdirector, '', 'TIPO DE TENENCIA:', '', infoAmbiente[0].tipo_tenencia]
        ];

        generalInfo.forEach((row, index) => {
            const rowNumber = index + 5;
            worksheet.getRow(rowNumber).height = 20; // Aumentar altura de estas filas
            worksheet.mergeCells(`A${rowNumber}:C${rowNumber}`);
            worksheet.mergeCells(`D${rowNumber}:F${rowNumber}`);
            worksheet.mergeCells(`G${rowNumber}:I${rowNumber}`);
            worksheet.mergeCells(`J${rowNumber}:L${rowNumber}`);

            ['A', 'D', 'G', 'J'].forEach((col, colIndex) => {
                const cell = worksheet.getCell(`${col}${rowNumber}`);
                cell.value = row[colIndex * 2];
                cell.font = {bold: colIndex % 2 === 0, size: 10};
                cell.alignment = {horizontal: 'left', vertical: 'middle', wrapText: true};
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: 'FFFFF2CC'}
                };
                addBorders(`${col}${rowNumber}:${String.fromCharCode(col.charCodeAt(0) + 2)}${rowNumber}`);

                if (row[colIndex * 2 + 1]) {
                    const valueCell = worksheet.getCell(`${String.fromCharCode(col.charCodeAt(0) + 1)}${rowNumber}`);
                    valueCell.value = row[colIndex * 2 + 1];
                    valueCell.font = {size: 10};
                    valueCell.alignment = {horizontal: 'left', vertical: 'middle', wrapText: true};
                    valueCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {argb: 'FFFFF2CC'}
                    };
                }
            });
        });

        worksheet.mergeCells('A10:L10');
        const descripcionHeaderCell = worksheet.getCell('A10');
        descripcionHeaderCell.value = '2.DESCRIPCIÓN FÍSICA DEL AMBIENTE DE FORMACIÓN';
        descripcionHeaderCell.font = {bold: true, size: 11};
        descripcionHeaderCell.alignment = {horizontal: 'left', vertical: 'middle'};
        descripcionHeaderCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFA6A6A6'}
        };
        addBorders('A10:L10');

        worksheet.mergeCells('A11:D11');
        const dimensionesCell = worksheet.getCell('A11');
        dimensionesCell.value = 'DIMENSIONES';
        dimensionesCell.font = {bold: true, size: 10};
        dimensionesCell.alignment = {horizontal: 'center', vertical: 'middle'};
        dimensionesCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFFF2CC'}
        };

        const subEspecifica = variableClase.especifica.map((nombre) => ({
            nombre: nombre.var_nombre,
            detalle: nombre.det_valor
        }));

        const iniciarCeldaEspecifica = 11

        subEspecifica.forEach((seccion, index) => {
            const rowNumber = iniciarCeldaEspecifica + 1 + index;
            const nombreCell = worksheet.getCell(`A${rowNumber}`);
            const detalleCell = worksheet.getCell(`B${rowNumber}`);

            nombreCell.value = seccion.nombre; //
            nombreCell.font = {bold: true, size: 11};
            nombreCell.alignment = {horizontal: 'left', vertical: 'middle'};

            detalleCell.value = seccion.detalle; // Asignar el detalle a la celda B
            detalleCell.font = {size: 10}; // Formato para el detalle
            detalleCell.alignment = {horizontal: 'left', vertical: 'middle'};

            // Aplicar un color de fondo si deseas
            nombreCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FFA6A6A6'}
            };

            detalleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FFFFFFFF'} // Color para la celda B
            };
        });


        addBorders('A11:D11');

        worksheet.mergeCells('E11:I11');
        const indiceCell = worksheet.getCell('E11');
        indiceCell.value = 'ÍNDICE DE OCUPACIÓN:\nÁREA / No. DE APRENDICES QUE UTILIZAN EL AMBIENTE DE FORMA SIMULTÁNEA';
        indiceCell.font = {bold: true, size: 10};
        indiceCell.alignment = {horizontal: 'center', vertical: 'middle', wrapText: true};
        indiceCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFFF2CC'}
        };
        addBorders('E11:I11');

        worksheet.mergeCells('J11:L11');
        const puertaCell = worksheet.getCell('J11');
        puertaCell.value = 'PUERTA ACCESO';
        puertaCell.font = {bold: true, size: 10};
        puertaCell.alignment = {horizontal: 'center', vertical: 'middle'};
        puertaCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFFF2CC'}
        };
        addBorders('J11:L11');

        worksheet.mergeCells('A17:L17');
        const acabadosHeaderCell = worksheet.getCell('A17');
        acabadosHeaderCell.value = '3.ACABADOS DEL AMBIENTE DE FORMACIÓN';
        acabadosHeaderCell.font = {bold: true, size: 11};
        acabadosHeaderCell.alignment = {horizontal: 'left', vertical: 'middle'};
        acabadosHeaderCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFA6A6A6'}
        };

        const subsections = variableClase.especificacionesTecnicas.map((nombre) => ({
            nombre: nombre.var_nombre,
            valor: nombre.det_valor
        }));
        subsections.forEach((subsection, index) => {
            const rowNumber = 18 + index;
            worksheet.getRow(rowNumber).height = 20;

            const nameCell = worksheet.getCell(`A${rowNumber}`);
            nameCell.value = subsection.nombre;  // Asignar nombre
            nameCell.font = {bold: true, size: 10};
            nameCell.alignment = {horizontal: 'left', vertical: 'middle'};
            nameCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FFFFF2CC'}  // Color de fondo
            };

            const detailCell = worksheet.getCell(`B${rowNumber}`);
            detailCell.value = subsection.valor;  // Asignar valor
            detailCell.font = {bold: true, size: 10};
            detailCell.alignment = {horizontal: 'left', vertical: 'middle'};
            detailCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FFCCE5FF'}
            };
        });

        worksheet.mergeCells('A24:F24');
        worksheet.mergeCells('G24:L24');
        ['4.ESQUEMA FUNCIONAL REAL DEL AMBIENTE DE FORMACIÓN\n(UBICACIÓN DE EQUIPOS INCLUIDOS SUS ESPACIOS COMPLEMENTARIOS, ACCESOS, FLUJOS).', '5.FOTO DEL AMBIENTE REAL DEL CENTRO DE FORMACIÓN'].forEach((header, index) => {
            const cell = worksheet.getCell(index === 0 ? 'A24' : 'G24');
            cell.value = header;
            cell.font = {bold: true, size: 11};
            cell.alignment = {horizontal: 'center', vertical: 'middle', wrapText: true};
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FFA6A6A6'}
            };
        });

        worksheet.mergeCells('A29:L29');
        const confortHeaderCell = worksheet.getCell('A29');
        confortHeaderCell.value = '11.OBSERVACIONES:';
        confortHeaderCell.font = {bold: true, size: 11};
        confortHeaderCell.alignment = {horizontal: 'left', vertical: 'middle'};
        confortHeaderCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFA6A6A6'}
        };

        const VariablesSecciones = variableClase.seccion.map((nombre) => ({
            nombre: nombre.var_nombre,
            detalle: nombre.det_valor
        }));

        const confortHeaderRow = 30;

        VariablesSecciones.forEach((seccion, index) => {
            const rowNumber = confortHeaderRow + 1 + index;
            const nombreCell = worksheet.getCell(`A${rowNumber}`);
            const detalleCell = worksheet.getCell(`B${rowNumber}`);

            nombreCell.value = seccion.nombre; //
            nombreCell.font = {bold: true, size: 11};
            nombreCell.alignment = {horizontal: 'left', vertical: 'middle'};

            detalleCell.value = seccion.detalle; // Asignar el detalle a la celda B
            detalleCell.font = {size: 10}; // Formato para el detalle
            detalleCell.alignment = {horizontal: 'left', vertical: 'middle'};

            // Aplicar un color de fondo si deseas
            nombreCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FFA6A6A6'}
            };

            detalleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FFFFFFFF'} // Color para la celda B
            };
        });


        // Ajustar el ancho de columnas específicas si es necesario
        worksheet.getColumn('B').width = 30; // Aumentar ancho de la columna B para el nombre del equipo
        worksheet.getColumn('G').width = 25; // Aumentar ancho de la columna G para observaciones

        // Aplicar bordes a todas las celdas utilizadas
        // Reemplazar el bloque de código que aplica bordes con este:
        const usedRange = worksheet.usedRange;
        if (usedRange && usedRange.top && usedRange.bottom && usedRange.left && usedRange.right) {
            for (let rowNumber = usedRange.top; rowNumber <= usedRange.bottom; rowNumber++) {
                for (let colNumber = usedRange.left; colNumber <= usedRange.right; colNumber++) {
                    const cell = worksheet.getCell(rowNumber, colNumber);
                    cell.border = {
                        top: {style: 'thin'},
                        left: {style: 'thin'},
                        bottom: {style: 'thin'},
                        right: {style: 'thin'}
                    };
                }
            }
        } else {
            // Si no hay rango utilizado, aplicar bordes a un rango predefinido
            for (let rowNumber = 1; rowNumber <= 42; rowNumber++) {
                for (let colNumber = 1; colNumber <= 12; colNumber++) {
                    const cell = worksheet.getCell(rowNumber, colNumber);
                    cell.border = {
                        top: {style: 'thin'},
                        left: {style: 'thin'},
                        bottom: {style: 'thin'},
                        right: {style: 'thin'}
                    };
                }
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
        saveAs(blob, 'ficha_ambiente.xlsx');
    };

    return (
        <DocumentArrowDownIcon
            className="h-6 w-6 text-blue-500 cursor-pointer"
            onClick={exportToExcel}
        />

    );
};