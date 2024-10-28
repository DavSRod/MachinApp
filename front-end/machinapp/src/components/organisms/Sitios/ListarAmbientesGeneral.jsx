import {
  PaginateTable,
  SearchComponent,
  useGlobalData,
  ButtonNext,
  V,
  Icons,
} from "../../../index";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip, Select, SelectItem, Button } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { ExcelAmbientes } from "../excel/ExcelAmbientes.jsx"; // Import the Excel component
import { toast } from "react-toastify"; // Import toast for notifications
import { axiosCliente } from '../../../service/api/axios';

export const BuscarAmbientesGeneral = () => {
  const [data, setData] = useState([]);
  const [filtroAmbientes, setFiltroAmbientes] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState(""); 
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos"); // Filtro de estado
  const { ambientes } = useGlobalData();
  const { t } = useTranslation();



  const [selectedIdAmbiente, setSelectedIdAmbiente] = useState(null);

const handleDownloadClick = (idAmbiente) => {
  setSelectedIdAmbiente(idAmbiente); // Actualiza el estado con el idAmbiente seleccionado
};





  const columns = [
    "ID",
    t("nombre_aula"),
    t("tipo_aula"),
    t("area"),
    t("profesor_encargado"),
    t("estado"), // Nueva columna para el estado
    t("acciones"),
  ];

  const obtenerAreasUnicas = () => {
    return [...new Set(ambientes.map((sitio) => sitio.area_nombre))];
  };

  // Manejo del toggle para cambiar estado del ambiente
  const toggleEstado = async (id, estadoActual) => {
    const confirmMessage = estadoActual === 'activo'
      ? t("quieres_desactivar_este_ambiente")
      : t("quieres_activar_este_ambiente");

    if (window.confirm(confirmMessage)) {
      try {
        const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
        const response = await axiosCliente.put(`/sitio/editarsitio/${id}`, { sit_estado: nuevoEstado });
        
        if (response.status === 200) {
          // Actualiza el estado localmente
          setData((prevData) =>
            prevData.map((ambiente) =>
              ambiente.id === id
                ? { ...ambiente, estado: nuevoEstado, estadoToggle: (
                    <button
                      onClick={() => toggleEstado(ambiente.id, nuevoEstado)} // Cambia estado basado en la respuesta de la API
                      className={`h-6 w-6 rounded-full ${nuevoEstado === 'activo' ? "bg-green-500" : "bg-red-500"}`} // Cambiar color según el estado
                    ></button>
                  ) }
                : ambiente
            )
          );
          toast.success(t("estado_ambiente_actualizado"));
        } else {
          toast.error(t("error_actualizar_estado"));
        }
      } catch (error) {
        console.error("Error al actualizar el estado:", error);
        toast.error(t("error_actualizar_estado"));
      }
    }
  };

  useEffect(() => {
    const fetchData = () => {
      const sitios = ambientes.map((sitio) => ({
        id: sitio.idAmbientes,
        nombre: sitio.sit_nombre,
        tipositio: sitio.tipo_sitio,
        area: sitio.area_nombre,
        municipio: sitio.instructor_encargado,
        estado: sitio.sit_estado, // Almacena el estado como 'activo' o 'inactivo'
        estadoToggle: ( // Renderiza el toggle aquí basado en el estado
          <button
            onClick={() => toggleEstado(sitio.idAmbientes, sitio.sit_estado)} // Cambia estado basado en la respuesta de la API
            className={`h-6 w-6 rounded-full ${sitio.sit_estado === 'activo' ? "bg-green-500" : "bg-red-500"}`} // Cambiar color según el estado
          ></button>
        ),
        acciones: (
          <div className="flex space-x-2"> {/* Alinea los íconos horizontalmente */}
            <ButtonNext isIconOnly color="warning" variant="faded">
              <Tooltip content="Editar" aria-label={"fasd"}>
                <Link
                  to={`/Ambientes/Actualizar/${sitio.idAmbientes}`}
                  className="flex justify-center items-center h-full w-full"
                >
                  <Icons icon={V.PencilIcon} className="h-6 w-6" />
                </Link>
              </Tooltip>
            </ButtonNext>

            {/* Ícono de Descargar Excel */}
            <Button isIconOnly color="warning" variant="faded"
            onClick={() => handleDownloadClick(sitio.idAmbientes)}
            >
afas
            </Button>

          </div>
        ),
      }));
      setData(sitios);
      setFiltroAmbientes(sitios); 
    };

    fetchData();
  }, [ambientes]);

  const filtrarAmbientes = (buscar) => {
    let resultado = data.filter((ambiente) => {
      return (
        ambiente.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
        ambiente.tipositio.toLowerCase().includes(buscar.toLowerCase()) ||
        ambiente.area.toLowerCase().includes(buscar.toLowerCase()) ||
        ambiente.municipio.toLowerCase().includes(buscar.toLowerCase())
      );
    });
  
    if (areaSeleccionada) {
      resultado = resultado.filter(
        (ambiente) => ambiente.area === areaSeleccionada
      );
    }
  
    // Filtrar por estado
    if (estadoSeleccionado === "activo") {
      resultado = resultado.filter(ambiente => ambiente.estado === 'activo');
    } else if (estadoSeleccionado === "inactivo") {
      resultado = resultado.filter(ambiente => ambiente.estado === 'inactivo');
    }
  
    // Si se selecciona "todos", no aplicar ningún filtro de estado
    setFiltroAmbientes(resultado);
  };

  useEffect(() => {
    filtrarAmbientes("");
  }, [areaSeleccionada, estadoSeleccionado]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("sitios")}</h1>
      <div className="flex flex-col mb-4 gap-6">
        <div className="flex flex-row justify-end gap-6">
          <ButtonNext className={`${V.bg_sena_verde} ${V.text_white}`}   startContent={<Icons icon={V.PlusIcon} />} >
            <Link to={"/Ambientes/Registrar"} >
              {t("registrar_nuevo_ambiente")}
            </Link>
          </ButtonNext>

          <ButtonNext
            type="submit"
            className={`${V.bg_sena_verde} ${V.text_white}`}
            startContent={<Icons icon={V.PlusIcon} />}
          > <Link to={"/TipoSitio/Registrar"}>
            {t("registrar_nuevo_tipositio")}
             </Link>
          </ButtonNext>

        </div>
        <div className="flex flex-row gap-6">
        <SearchComponent
          onSearch={filtrarAmbientes}
          label={`${t("tipo_aula")}, ${t("area")}, ${t("profesor_encargado")}`}
        />

        <Select
          placeholder={t("filtrar_por_area")}
          value={areaSeleccionada}
          onChange={(e) => setAreaSeleccionada(e.target.value)}
          className="w-full sm:w-40 lg:w-60"
          aria-label="area"
        >
          <SelectItem key="" value="" aria-label="erer">
            {t("todas_las_areas")}
          </SelectItem>
          {obtenerAreasUnicas().map((area) => (
            <SelectItem key={area} value={area} aria-label="erer" >
              {area}
            </SelectItem>
          ))}
        </Select>

        {/* Filtro por estado */}
        <Select
          placeholder={t("filtrar_por_estado")}
          value={estadoSeleccionado}
          onChange={(e) => setEstadoSeleccionado(e.target.value)}
          className="w-full sm:w-40 lg:w-60"
          aria-label="estado-12"
        >
          <SelectItem key="todos" value="todos" aria-label="erer">
            {t("todos_los_estados")} {/* Asegúrate de que la clave sea correcta */}
          </SelectItem>
          <SelectItem key="activo" value="activo" aria-label="erer">
            {t("activo")}
          </SelectItem>
          <SelectItem key="inactivo" value="inactivo" aria-label="erer">
            {t("inactivo")}
          </SelectItem>
        </Select>
        </div>
      </div>

      <PaginateTable
        columns={columns}
        data={filtroAmbientes.map((ambiente) => ({
          id: ambiente.id, // ID
          nombre: ambiente.nombre, // Nombre
          tipo_aula: ambiente.tipositio, // Tipo Aula
          area: ambiente.area, // Area
          profesor_encargado: ambiente.municipio, // Profesor Encargado
          estado: ( // Renderiza el toggle basado en el estado
            <button
              onClick={() => toggleEstado(ambiente.id, ambiente.estado)} // Actualiza el estado al hacer clic
              className={`h-6 w-6 rounded-full ${ambiente.estado === 'activo' ? "bg-green-500" : "bg-red-500"}`} // Cambiar color según el estado
            ></button>
          ), 
          acciones: ambiente.acciones, // Acciones
        }))}
      />
      {selectedIdAmbiente && (
      <ExcelAmbientes
        idAmbiente={selectedIdAmbiente}
        onDownloadSuccess={() => toast.success(t("excel_descargado_exitosamente"))}
      />
    )}
    </div>
  );
};