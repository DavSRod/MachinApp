import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import {
  Image,
  Button,
  Radio,
  RadioGroup,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import {
  CardStyle,
  InputforForm,
  Breadcrumb,
  axiosCliente,
  SelectComponent,
  useGlobalData,
} from "../../../index.js";

const Textarea = ({ register, name, placeholder, rows }) => (
  <textarea
    {...register(name)}
    placeholder={placeholder}
    rows={rows}
    className="w-full p-2 border rounded"
  />
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Se detectó un error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo salió mal. Intente actualizar la página.</h1>;
    }
    return this.props.children;
  }
}

export const FormFichaDeMantenimiento = () => {
  const { t } = useTranslation();
  const { dataUser } = useGlobalData();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mant_codigo_mantenimiento: "",
      mant_estado: "",
      mant_fecha_proxima: "",
      man_fecha_realizacion: "",
      mant_descripcion: "",
      mant_ficha_soporte: null,
      mant_costo_final: "",
      fk_tipo_mantenimiento: "",
      fk_solicitud_mantenimiento: "",
      mant_maquina: "",
      tecnico: "",
      repuestos: [{ nombreRepuesto: "", costo: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "repuestos",
  });

  const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [noMaquinasMensaje, setNoMaquinasMensaje] = useState("");

  const selectedSolicitud = watch("fk_solicitud_mantenimiento");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tiposMantenimientoRes, solicitudesRes] = await Promise.all([
          axiosCliente.get("tipomantenimiento/listar"),
          axiosCliente.get("/solicitud/")
        ]);

        setTiposMantenimiento(tiposMantenimientoRes.data || []);
        setSolicitudes(solicitudesRes.data || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError(t("error_loading_data"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

useEffect(() => {
  const fetchMaquinas = async () => {
    if (selectedSolicitud) {
      try {
        const response = await axiosCliente.get(
          `/mantenimiento/maquinas/solicitud/${selectedSolicitud}`
        );
        if (response.data.length === 0) {
          setNoMaquinasMensaje("Solicitud seleccionada no tiene máquinas registradas");
          setMaquinas([]);
        } else {
          setNoMaquinasMensaje("");
          setMaquinas(response.data);
        }
        setValue("mant_maquina", "");
      } catch (error) {
        console.error("Error al obtener máquinas:", error);
        setMaquinas([]);
        setNoMaquinasMensaje("Error al cargar máquinas"); // Mensaje en caso de error
      }
    } else {
      setMaquinas([]);
      setNoMaquinasMensaje(""); // Limpiamos el mensaje si no hay solicitud seleccionada
    }
  };

  fetchMaquinas();
}, [selectedSolicitud, setValue]);


  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setFileError(null);
    try {
      const formData = new FormData();
      formData.append("mant_codigo_mantenimiento", data.mant_codigo_mantenimiento);
      formData.append("mant_estado", data.mant_estado);
      formData.append("mant_fecha_proxima", data.mant_fecha_proxima);
      formData.append("man_fecha_realizacion", data.man_fecha_realizacion);
      formData.append("mant_descripcion", data.mant_descripcion);
      if (selectedFile) {
        formData.append("mant_ficha_soporte", selectedFile);
      }
      formData.append("mant_costo_final", data.mant_costo_final);
      formData.append("fk_tipo_mantenimiento", data.fk_tipo_mantenimiento);
      formData.append("fk_solicitud_mantenimiento", data.fk_solicitud_mantenimiento);
      formData.append("fk_tecnico", data.tecnico);
      formData.append("mant_maquina", data.mant_maquina);

      const response = await axiosCliente.post(
        "mantenimiento/registrar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.idMantenimiento) {
        const mantenimientoId = response.data.idMantenimiento;

        const partesMantenimiento = data.repuestos.map((repuesto) => ({
          par_fk_mantenimientos: mantenimientoId,
          par_nombre_repuesto: repuesto.nombreRepuesto,
          par_costo: parseFloat(repuesto.costo),
        }));

        await axiosCliente.post(
          "partes_mantenimiento/registrar",
          partesMantenimiento
        );

        toast.success(t("registration_success"));
        reset();
        navigate('/historial');
      } else {
        throw new Error(t("no_maintenance_id_received"));
      }
    } catch (error) {
      let errorMessage = t("registration_error");
      if (error.response) {
        errorMessage += `: ${error.response.status} - ${
          error.response.data.message || error.response.statusText
        }`;
        setFileError(
          error.response.data.mensaje || JSON.stringify(error.response.data)
        );
      } else if (error.request) {
        errorMessage += t("no_server_response");
      } else {
        errorMessage += error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <Breadcrumb pageName={t("register_maintenance")} />
      <ErrorBoundary>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-7xl mx-auto p-8 space-y-8"
        >
          <div className="flex items-center justify-between mb-8 border p-4 rounded-lg shadow-sm">
            <div className="w-1/4">
              <Image
                src="/logoSenaNaranja.png"
                className="h-20 w-full object-contain"
              />
            </div>
            <div className="w-1/2 text-center">
              <h2 className="text-xl font-bold">
                {t("maintenance_work_order")}
              </h2>
            </div>
            <div className="w-1/4 text-right">
              <p className="text-sm">Centro de Gestión y Desarrollo Sostenible Surcolombiano</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
            <CardStyle
              titleCard={t("maintenance_code")}
              className="p-6 shadow-md rounded-lg"
            >
              <InputforForm
                register={register}
                errors={errors}
                name="mant_codigo_mantenimiento"
                tipo="text"
                placeholder={t("enter_maintenance_code")}
                label={t("enter_maintenance_code")}
              />
            </CardStyle>

            <CardStyle titleCard={t("Tecnico_encargado")}>
              <SelectComponent
                options={dataUser
                  .filter((item) =>
                    item.rol_nombre.trim().toLowerCase().startsWith("tecnico")
                  )
                  .map((item) => ({
                    id: item.idUsuarios,
                    valor: item.us_nombre + " " + item.us_apellidos,
                  }))}
                name="tecnico"
                placeholder={t("Tecnico_encargado")}
                valueKey="id"
                textKey="valor"
                register={register}
                label={t("Tecnico_encargado")}
                required
              />
            </CardStyle>

            <CardStyle
              titleCard={t("status")}
              className="p-6 shadow-md rounded-lg"
            >
              <Controller
                name="mant_estado"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={t("select_status")}
                    aria-label="hola"
                  >
                    <SelectItem key="Pendiente" value="Pendiente">
                      {t("pending")}
                    </SelectItem>
                    <SelectItem key="En Proceso" value="En Proceso">
                      {t("in_progress")}
                    </SelectItem>
                    <SelectItem key="Completado" value="Completado">
                      {t("completed")}
                    </SelectItem>
                    <SelectItem key="En Espera" value="En Espera">
                      {t("on_hold")}
                    </SelectItem>
                  </Select>
                )}
              />
            </CardStyle>

            <CardStyle
              titleCard={t("Fecha_realizacion")}
              className="p-6 shadow-md rounded-lg"
            >
              <InputforForm
                register={register}
                errors={errors}
                name="man_fecha_realizacion"
                tipo="date"
                placeholder={t("select_next_date")}
                label={t("select_next_date")}
              />
            </CardStyle>

            <CardStyle
              titleCard={t("next_date")}
              className="p-6 shadow-md rounded-lg"
            >
              <InputforForm
                register={register}
                errors={errors}
                name="mant_fecha_proxima"
                tipo="date"
                placeholder={t("select_next_date")}
                label={t("select_next_date")}
                min={today}
              />
            </CardStyle>

            <CardStyle titleCard={t("maintenance_type")}>
              <Controller
                name="fk_tipo_mantenimiento"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field}>
                    {tiposMantenimiento && tiposMantenimiento.length > 0 ? (
                      tiposMantenimiento.map((tipo) => (
                        <Radio
                          key={tipo.idTipo_mantenimiento}
                          value={tipo.idTipo_mantenimiento.toString()}
                        >
                          {t(tipo.tipo_mantenimiento) || t("no_maintenance_type")}
                        </Radio>
                      ))
                    ) : (
                      <p>{t("no_maintenance_types_available")}</p>
                    )}
                  </RadioGroup>
                )}
              />
            </CardStyle>

            <CardStyle
              titleCard={t("maintenance_description")}
              className="p-6 shadow-md rounded-lg"
            >
              <Textarea
                register={register}
                name="mant_descripcion"
                placeholder={t("provide_detailed_description")}
                label={t("provide_detailed_description")}
                rows={6}
              />
            </CardStyle>

            <CardStyle
              titleCard={t("work_executed")}
              className="p-6 shadow-md rounded-lg"
            >
              <input type="file" onChange={handleFileChange} className="mb-2" />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  {t("selected_file")}: {selectedFile.name}
                </p>
              )}
              {fileError && (
                <p className="text-red-500 text-sm mt-2">{fileError}</p>
              )}
            </CardStyle>

            <CardStyle
              titleCard={t("final_cost")}
              className="p-6 shadow-md rounded-lg"
            >
              <InputforForm
                register={register}
                errors={errors}
                name="mant_costo_final"
                tipo="number"
                placeholder={t("enter_final_cost")}
                label={t("enter_final_cost")}
                min="0"
                step="0.01"
              />
            </CardStyle>

            <CardStyle
              titleCard={t("maintenance_request")}
              className="p-6 shadow-md rounded-lg"
            >
              <Controller
                name="fk_solicitud_mantenimiento"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={t("seleccione_solicitud_pendiente")}
                    aria-label="solicitudes-mantenimiento"
                  >
                    {solicitudes.map((solicitud) => (
                      <SelectItem
                        key={solicitud.idSolicitud}
                        value={solicitud.soli_descripcion_problemas.toString()}
                      >
                        
                        {`${solicitud.soli_descripcion_problemas}`}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              </CardStyle>

              <CardStyle
                titleCard={t("machine")}
                className="p-6 shadow-md rounded-lg"
              >
                <Controller
                  name="mant_maquina"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={t("select_machine")}
                      aria-label="maquinas"
                      isDisabled={!selectedSolicitud}
                    >
                      {maquinas.map((maquina) => (
                        <SelectItem
                          key={maquina.id_maquina}
                          value={maquina.id_maquina.toString()}
                        >
                          {maquina.referencia_maquina}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </CardStyle>
          </div>

          <CardStyle
          titleCard={t("parts_used_and_costs")}
          className="mt-8 p-6 shadow-md rounded-lg"
          >
          <div className="flex justify-end mb-4">
            <Button
              color="primary"
              onClick={() => append({ nombreRepuesto: "", costo: "" })}
            >
              <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              {t("add_part")}
            </Button>
          </div>
          <Table aria-label={t("parts_table")}>
            <TableHeader>
              <TableColumn>{t("part_name")}</TableColumn>
              <TableColumn>{t("cost")}</TableColumn>
              <TableColumn>{t("actions")}</TableColumn>
            </TableHeader>
            <TableBody>
              {fields.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <InputforForm
                      register={register}
                      errors={errors}
                      name={`repuestos.${index}.nombreRepuesto`}
                      tipo="text"
                      placeholder={t("part_name")}
                      label={t("part_name")}
                    />
                  </TableCell>
                  <TableCell>
                    <InputforForm
                      register={register}
                      maxLength={9}
                      errors={errors}
                      name={`repuestos.${index}.costo`}
                      tipo="number"
                      placeholder={t("cost")}
                      label={t("cost")}
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Button color="error" onClick={() => remove(index)}>
                      <TrashIcon
                        className="h-5 w-5 mr-2"
                        aria-hidden="true"
                      />
                      {t("delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </CardStyle>

          <Button
            type="submit"
            color="success"
            className="mt-8 w-full py-4 text-lg font-semibold"
            disabled={isLoading}
          >
            {isLoading ? t("registering") : t("register_maintenance")}
          </Button>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </form>
    </ErrorBoundary>
  </div>
);
}
