import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { Image, Button, TableCell, TableRow, Table, TableHeader, TableColumn, TableBody } from "@nextui-org/react";
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { Layout, CardStyle, InputUpdate, Breadcrumb, axiosCliente, TextAreaComponent, SelectComponent, ButtonNext, useGlobalData, InputforForm } from "../../../index.js";

export const Editar_Component = () => {
  const { t } = useTranslation();
  

    // para poder obtener los tecnicos que nos trae el api
    const { dataUser } = useGlobalData();

  const { idMantenimiento } = useParams();
  const navigate = useNavigate();
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      mant_codigo_mantenimiento: '',
      mant_estado: '',
      mant_fecha_proxima: '',
      mant_descripcion: '',
      mant_ficha_soporte: null,
      mant_costo_final: '',
      fk_tipo_mantenimiento: '',
      fk_solicitud_mantenimiento: '',
      mant_maquina: '',
      repuestos: []
    }
  });
  const watchedSolicitud = watch("fk_solicitud_mantenimiento");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "repuestos"
  });

  const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null);
  
  const [, setPartesMantenimiento] = useState([]);
  const [, setMantenimiento] = useState(null);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tiposMantenimientoRes, solicitudesRes] = await Promise.all([
          axiosCliente.get('tipomantenimiento/listar'),
          axiosCliente.get('solicitud/')
        ]);
        setTiposMantenimiento(tiposMantenimientoRes.data || []);
        setSolicitudes(solicitudesRes.data || []);
  
        if (idMantenimiento) {
          const mantenimientoRes = await axiosCliente.get(`mantenimiento/listar_por_id/${idMantenimiento}`);
          const mantenimientoData = mantenimientoRes.data;
  
          if (mantenimientoData) {
            // Cargar las máquinas de la solicitud actual
            if (mantenimientoData.fk_solicitud_mantenimiento) {
              const maquinasRes = await axiosCliente.get(`mantenimiento/maquinas/solicitud/${mantenimientoData.fk_solicitud_mantenimiento}`);
              setMaquinas(maquinasRes.data || []);
            }
  
            setMantenimiento(mantenimientoData);
            reset({
              ...mantenimientoData,
              mant_codigo_mantenimiento: mantenimientoData.codigo_mantenimiento || '',
              mant_estado: mantenimientoData.mant_estado || '',
              mant_fecha_proxima: formatDateForInput(mantenimientoData.mant_fecha_proxima) || '',
              mant_descripcion: mantenimientoData.descripcion_mantenimiento || '',
              mant_ficha_soporte: mantenimientoData.mant_ficha_soporte || null,
              mant_costo_final: mantenimientoData.mant_costo_final || '',
              fk_tipo_mantenimiento: mantenimientoData.tipo_mantenimiento.idTipo_mantenimiento || '',
              fk_solicitud_mantenimiento: mantenimientoData.fk_solicitud_mantenimiento || '',
              mant_maquina: mantenimientoData.mant_maquina?.toString() || '',  // Aseguramos que sea string
              tecnico: mantenimientoData.id_tecnico
            });
          }
  
          const partesRes = await axiosCliente.get(`partes_mantenimiento/listar_por_idmantenimiento/${idMantenimiento}`);
          const partes = partesRes.data;
  
          setPartesMantenimiento(partes);
  
          if (Array.isArray(partes)) {
            reset(formValues => ({
              ...formValues,
              repuestos: partes.map(parte => ({
                id_partes_mantenimiento: parte.id_partes_mantenimiento,
                par_fk_mantenimientos: parte.par_fk_mantenimientos,
                nombreRepuesto: parte.par_nombre_repuesto,
                costo: parseFloat(parte.par_costo)
              }))
            }));
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error.response);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [idMantenimiento, reset]);

  useEffect(() => {
    const fetchMaquinas = async () => {
      if (watchedSolicitud) {
        try {
          const response = await axiosCliente.get(`mantenimiento/maquinas/solicitud/${watchedSolicitud}`);
          setMaquinas(response.data || []);
          
          if (response.data && response.data.length === 1) {
            const maquinaId = response.data[0].id_maquina.toString();
            reset(formValues => ({
              ...formValues,
              mant_maquina: maquinaId
            }));
          }
        } catch (error) {
          console.error("Error al obtener máquinas:", error);
          setMaquinas([]);
        }
      } else {
        setMaquinas([]);
        reset(formValues => ({
          ...formValues,
          mant_maquina: ''
        }));
      }
    };
  
    fetchMaquinas();
  }, [watchedSolicitud, reset]);
  

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setFileError(null);
  
    try {
      // Actualizar el mantenimiento principal
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'repuestos') {
          formData.append(key, data[key]);
        }
      });
      if (selectedFile) {
        formData.append('mant_ficha_soporte', selectedFile);
      }
  
      await axiosCliente.put(`mantenimiento/Actualizar_mantenimiento/${idMantenimiento}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Actualizar partes de mantenimiento
      for (const repuesto of data.repuestos) {
        const parteData = {
          par_fk_mantenimientos: idMantenimiento,
          par_nombre_repuesto: repuesto.nombreRepuesto,
          par_costo: parseFloat(repuesto.costo) // Asegúrate de que esto sea un número
        };
        console.log(parteData)
        if (repuesto.id_partes_mantenimiento) {
          // Si existe id_partes_mantenimiento, actualizar la parte existente
          await axiosCliente.put(`partes_mantenimiento/Actualizar/${repuesto.id_partes_mantenimiento}`, parteData);
        } else {
          // Si no existe id_partes_mantenimiento, crear una nueva parte
          await axiosCliente.post(`partes_mantenimiento/registrar`, [parteData]);
        }
      }
  
      toast.success(t("update_success"));
      navigate('/Historial');
    } catch (error) {
      let errorMessage = t("update_error");
      if (error.response) {
        errorMessage += `: ${error.response.status} - ${error.response.data.message || error.response.statusText}`;
        setFileError(error.response.data.mensaje || JSON.stringify(error.response.data));
      } else if (error.request) {
        errorMessage += t("no_server_response");
      } else {
        errorMessage += error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const handleDeleteParte = async (index, id_partes_mantenimiento) => {
    try {
      if (id_partes_mantenimiento) {
        await axiosCliente.delete(`partes_mantenimiento/eliminar/${id_partes_mantenimiento}`);
        toast.success(t("partes_eliminadas"));
      }
      remove(index);
    } catch (error) {
      console.error("Error al eliminar la parte:", error);
      toast.error(t("error_deleting_part"));
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  return (
    <Layout titlePage={t("edit_maintenance")}>
      <Breadcrumb pageName={t("edit_maintenance")} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between mb-8 border p-4 rounded-lg shadow-sm">
          <div className="w-1/4">
            <Image
              src="/logoSenaNaranja.png"
              className="h-20 w-full object-contain"
            />
          </div>
          <div className="w-1/2 text-center">
            <h2 className="text-xl font-bold">{idMantenimiento ? t("edit_maintenance") : t("maintenance_work_order")}</h2>
          </div>
          <div className="w-1/4 text-right">
            <p className="text-sm">Centro de gestión y desarrollo sostenible surColombiano</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
          <CardStyle titleCard={t("maintenance_code")} className="p-6 shadow-md rounded-lg">
            <Controller
              name="mant_codigo_mantenimiento"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <InputUpdate
                  {...field}
                  label={t("enter_maintenance_code")}
                  tipo="text"
                  errors={errors}
                  isUpdating={true}
                />
              )}
            />
          </CardStyle>
          
          <div>
          <CardStyle titleCard={t("status")} className="p-6 shadow-md rounded-lg">
            <Controller
              name="mant_estado"
              control={control}
              render={({ field: { onChange, value, name, ref } }) => (
                <SelectComponent
                  options={[
                    { idMantenimiento: "Pendiente", valor: t("pending") },
                    { idMantenimiento: "En Proceso", valor: t("in_progress") },
                    { idMantenimiento: "Completado", valor: t("completed") },
                    { idMantenimiento: "En Espera", valor: t("on_hold") }
                  ]}
                  placeholder={t("select_status")}
                  valueKey="idMantenimiento"
                  textKey="valor"
                  label={t("status")}
                  onChange={onChange}
                  value={value}
                  name={name}
                  register={() => ({ onChange, value, name, ref })}
                />
              )}
            />
          </CardStyle>
          </div>

          <CardStyle titleCard={t("next_date")} className="p-6 shadow-md rounded-lg">
            <Controller
              name="mant_fecha_proxima"
              control={control}
              render={({ field }) => (
                <InputUpdate
                  {...field}
                  label={t("next_date")}
                  tipo="date"
                  errors={errors}
                  isUpdating={true}
                  min={today}
                />
              )}
            />
          </CardStyle>

          <CardStyle titleCard={t("maintenance_description")} className="p-6 shadow-md rounded-lg">
        
                <TextAreaComponent
              
                  errors={errors}
                  descripcion={t("maintenance_description")}
                  label={t("maintenance_description")}
                  register={() => register("mant_descripcion")}
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

         
          <CardStyle titleCard={t("maintenance_type")} className="p-6 shadow-md rounded-lg">
            <Controller
              name="fk_tipo_mantenimiento"
              control={control}
              rules={{ required: t("select_maintenance_type") }}
              render={({ field: { onChange, value, name, ref } }) => (
                <>
                  <SelectComponent
                    options={tiposMantenimiento.map(tipo => ({
                      idTipo_mantenimiento: tipo.idTipo_mantenimiento,
                      tipo_mantenimiento: tipo.tipo_mantenimiento
                    }))}
                    valueKey="idTipo_mantenimiento"
                    textKey="tipo_mantenimiento"
                    placeholder={t("select_maintenance_type")}
                    label={t("maintenance_type")}
                    onChange={onChange}
                    value={value}
                    name={name}
                    register={() => ({ onChange, value, name, ref })}
                  />
                  {errors.fk_tipo_mantenimiento && (
                    <p className="text-red-500 text-sm mt-1">{errors.fk_tipo_mantenimiento.message}</p>
                  )}
                </>
              )}
            />
          </CardStyle>

          <CardStyle titleCard={t("maintenance_request")} className="p-6 shadow-md rounded-lg">
            <Controller
              name="fk_solicitud_mantenimiento"
              control={control}
              render={({ field: { onChange, value, name, ref } }) => (
                <SelectComponent
                  options={solicitudes.map(solicitud => ({
                    id: solicitud.idSolicitud,
                    valor: solicitud.soli_descripcion_problemas
                  }))}
                  placeholder={t("enter_maintenance_request")}
                  valueKey="id"
                  textKey="valor"
                  label={t("maintenance_request")}
                  onChange={(newValue) => {
                    onChange(newValue);
                    // Limpiar la máquina seleccionada cuando cambia la solicitud
                    reset(formValues => ({
                      ...formValues,
                      mant_maquina: '',
                      fk_solicitud_mantenimiento: newValue
                    }));
                  }}
                  value={value}
                  name={name}
                  register={() => ({ onChange, value, name, ref })}
                />
              )}
            />
          </CardStyle>
            
                    <CardStyle titleCard={t("machine")} className="p-6 shadow-md rounded-lg">
            <Controller
              name="mant_maquina"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value, name, ref } }) => (
                <SelectComponent
                  options={maquinas.map(maquina => ({
                    id: maquina.id_maquina,
                    valor: maquina.referencia_maquina
                  }))}
                  placeholder={maquinas.length > 0 ? t("enter_machine") : t("select_request_first")}
                  valueKey="id"
                  textKey="valor"
                  label={t("machine")}
                  onChange={onChange}
                  value={value}
                  name={name}
                  register={() => ({ onChange, value, name, ref })}
                  disabled={!control._formValues.fk_solicitud_mantenimiento}
                />
              )}
            />
          </CardStyle>

          <CardStyle titleCard={t("work_executed")} className="p-6 shadow-md rounded-lg">
            <input type="file" onChange={handleFileChange} />
            
            {fileError && <p className="text-red-500">{fileError}</p>}
          </CardStyle>

          <CardStyle titleCard={t("final_cost")} className="p-6 shadow-md rounded-lg">
            <div>
              <Controller
                name="mant_costo_final"
                control={control}
                render={({ field }) => (
                  <InputUpdate
                    {...field}
                    label={t("final_cost")}
                    tipo="number"
                    errors={errors}
                    isUpdating={true}
                  />
                )}
              />
            </div>
          </CardStyle>

          <div className="mt-8 col-span-full">
            <CardStyle
              titleCard={t("parts_used_and_costs")}
              className="p-6 shadow-md rounded-lg"
            >
            <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                color="primary"
                onClick={() => append({ nombreRepuesto: "", costo: "" })}
                className="flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                {t("add_part")}
              </Button>
            </div>
                
            <div className="overflow-x-auto">
              <Table aria-label={t("parts_table")} className="min-w-full">
                <TableHeader>
                  <TableColumn className="w-2/5">{t("part_name")}</TableColumn>
                  <TableColumn className="w-2/5">{t("cost")}</TableColumn>
                  <TableColumn className="w-1/5">{t("actions")}</TableColumn>
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
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <InputforForm
                          register={register}
                          errors={errors}
                          name={`repuestos.${index}.costo`}
                          tipo="number"
                          placeholder={t("cost")}
                          label={t("cost")}
                          min="0"
                          step="0.01"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                      <ButtonNext
                        type="button"
                        text={t("remove")}
                        className="bg-red-600 text-white"
                        onClick={() => handleDeleteParte(index, item.id_partes_mantenimiento)}
                      >
                  <TrashIcon className="h-5 w-5" />
                </ButtonNext>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          </div>
          
          {fields.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              {t("no_parts_added")}
            </p>
          )}
        </div>
      </CardStyle>
    </div>
          {error && <p className="text-red-500">{error}</p>}

          {<div className="mt-12">
            <ButtonNext type="submit" text={t("actualizar")} className="bg-green-600 text-white w-full"/>
          </div>}
        </div>
      </form>
    </Layout>
  );
};