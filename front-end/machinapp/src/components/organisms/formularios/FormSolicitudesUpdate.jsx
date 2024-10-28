import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { 
  Image,
  Divider,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableCell,
  TableRow,
  TableBody,
 } from "@nextui-org/react";
import { toast } from 'react-toastify';

import { V, InputUpdate, axiosCliente, SelectComponent, ButtonNext, CardStyle, TextAreaComponent } from "../../../index.js";

export const FormSolicitudesUpdate = () => {
  const { t } = useTranslation(); 
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { register, control, handleSubmit,getValues , reset, formState: { errors } } = useForm({
    defaultValues: {
      prioridad: '',
      descripcion: '',
      costo_estimado: '',
      obsevaciones: '',
      temaLegal: '',
      nombre_solicitante: '',
      correo_solicitante: '',
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const solicitudesResponse = await axiosCliente.get(`/solicitud/listarPorId/${id}`);
        const solicitudData = solicitudesResponse.data;

        reset({
          prioridad: solicitudData.soli_prioridad || '',
          descripcion: solicitudData.soli_descripcion_problemas || '',
          costo_estimado: solicitudData.soli_costo_estimado || '',
          obsevaciones: solicitudData.soli_observaciones || '',
          temaLegal: solicitudData.temas_legal || '',
          nombre_solicitante: solicitudData.nombre_solicitante || '',
          correo_solicitante: solicitudData.correo_solicitante || '',
        });


        const actividadesResponse = await axiosCliente.get(`/actividades/listarSolicitud/${id}`);
        setActividades(actividadesResponse.data.resultadoActividad || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(t("error_loading_request"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, reset, t]);

  const onSubmit = async (data) => {

    setIsLoading(true);
    setError(null);

    try {
      await axiosCliente.put(`/solicitud/actualizar/${id}`, data);
      toast.success(t("update_success"));
      navigate('/solicitud');
    } catch (error) {
      console.error("Error updating request:", error);
      setError(t("update_error"));
      toast.error(t("update_error"));
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleUpdateActividad = async (idActividades) => {

    const acti_nombre = getValues(`nombre_actividad_${idActividades}`);
    const acti_descripcion = getValues(`actividad_${idActividades}`);
  

    const actividadExistente = actividades.find(act => act.idActividades === idActividades);
    if (
      actividadExistente.acti_nombre === acti_nombre &&
      actividadExistente.acti_descripcion === acti_descripcion
    ) {
      toast.info("Los datos son los mismos, no se realizaron cambios.");
      return; 
    }
  

    try {
      const response = await axiosCliente.put(`/actividades/actualizar/${idActividades}`, {
        acti_nombre,
        acti_descripcion,
      });
      toast.success(t(response.data.message));

      const updatedActividades = actividades.map((actividad) => {
        if (actividad.idActividades === idActividades) {
          return { ...actividad, acti_nombre, acti_descripcion };
        }
        return actividad;
      });
      setActividades(updatedActividades);
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error(t("Error updating activity"));
    }
  };
  

  const onActivityUpdate = (idActividades) => {
    const nombreActividad = actividades.find(act => act.idActividades === idActividades).acti_nombre;
    const descripcionActividad = actividades.find(act => act.idActividades === idActividades).acti_descripcion;
    
    handleUpdateActividad(idActividades, nombreActividad, descripcionActividad);
  };

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 w-11/12 pt-12">
        <div className="flex flex-row h-20">
          <figure className="flex-shrink-0 h-full w-1/3 border flex justify-center items-center">
            <Image
              src={V.logoSena}
              className="h-20 w-full object-contain"
              alt="logo-sena"
            />
          </figure>
          <div className="flex-grow text-center border px-4 text-base h-full w-1/3 flex items-center justify-center">
            {t("maintenance_service_request")}
          </div>
          <div className="flex-shrink-0 w-1/3 h-full border flex items-center">
            <p className="overflow-hidden overflow-ellipsis text-center">
            Centro de Gestión y Desarrollo Sostenible Surcolombiano
            </p>
          </div>
        </div>
        <div className="border flex flex-col gap-4 p-14">
          <CardStyle
            subtitle={t("applicant_information")}
          >
            <div className="flex gap-5 max-md:inline justify-between">
              <Controller
                name="nombre_solicitante"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <InputUpdate
                    {...field}
                    label={t("name_of_applicant")}
                    tipo="text"
                    errors={errors}
                    isUpdating={true}
                  />
                )}
              />
              <Controller
                name="correo_solicitante"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <InputUpdate
                    {...field}
                    label={t("applicants_email")}
                    tipo="email"
                    errors={errors}
                    isUpdating={true}
                  />
                )}
              />
            </div>
          </CardStyle>
          <Divider />
          <Controller
            name="prioridad"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value, name, ref } }) => (
              <SelectComponent
                options={[
                  { id: 'inmediata', valor: t("immediate") },
                  { id: 'urgente', valor: t("urgent") },
                  { id: 'normal', valor: t("normal") },
                ]}
                placeholder={t("select_priority")}
                valueKey="id"
                textKey="valor"
                label={t("Priority")}
                onChange={onChange}
                value={value}
                name={name}
                register={() => ({ onChange, value, name, ref })}
              />
            )}
          />
          <Divider />
          <div className="flex flex-col gap-3">
            {t("Description_of_the_Request")}
            <div className="border-b-4 border-orange-400 inline-block w-24"></div>
            <TextAreaComponent
              errors={errors}
              descripcion={t("maintenance_description")}
              label={t("maintenance_description")}
              register={() => register("descripcion")}
            />
          </div>
          <Divider />
          <div className="flex flex-col gap-3">
            {t("Legal_Part")}
            <div className="border-b-4 border-orange-400 inline-block w-24"></div>
            <TextAreaComponent
              errors={errors}
              descripcion={t("Legal_Part")}
              label={t("Legal_Part")}
              register={() => register("temaLegal")}
            />
          </div>
          <Divider />
          <div className="flex flex-col gap-4">
            {t("Observations")}
            <div className="border-b-4 border-orange-400 inline-block w-24"></div>
            <TextAreaComponent
              errors={errors}
              descripcion={t("Observations")}
              label={t("Observations")}
              register={() => register("obsevaciones")}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-3">
              {t("cost")}
              <div className="border-b-4 border-orange-400 inline-block w-24"></div>
              <span className="font-semibold">
                {t("Total_price_of_repairs_and_maintenance")}
              </span>
            </div>
            <div className="flex justify-center items-center h-full">
              <Controller
                name="costo_estimado"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <InputUpdate
                    {...field}
                    tipo="number"
                    errors={errors}
                    isUpdating={true}
                  />
                )}
              />
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="mt-12">
            <ButtonNext type="submit" text={t("actualizar")} className="bg-green-600 text-white w-full"/>
          </div>
        </div>
        
{/* Sección de Actividades */}
<div className="mt-8">
          <Table
            aria-label="Table with activities"
            className="bg-red"
          >
            <TableHeader>
              <TableColumn className={`${V.bg_sena_verde} ${V.text_white}`}>{t("Name_of_the_activity")}</TableColumn>
              <TableColumn className={`${V.bg_sena_verde} ${V.text_white}`}>{t("Description_of_the_activity")}</TableColumn>
              <TableColumn className={`${V.bg_sena_verde} ${V.text_white}`}>{t("acciones")}</TableColumn>
            </TableHeader>

            <TableBody>
              {actividades.length > 0 ? (
                actividades.map((actividad) => (
                  <TableRow key={actividad.idActividades}>

                    <TableCell className="flex items-center">
                      <Controller
                        name={`nombre_actividad_${actividad.idActividades}`}
                        control={control}
                        defaultValue={actividad.acti_nombre}
                        render={({ field }) => (
                          <InputUpdate
                            {...field}
                            errors={errors}
                            isUpdating={true}
                            label={t("Name_of_the_activity")}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`actividad_${actividad.idActividades}`}
                        control={control}
                        defaultValue={actividad.acti_descripcion}
                        render={({ field }) => (
                          <InputUpdate
                            {...field}
                            isUpdating={true}
                            errors={errors}
                            label={t("Description_of_the_activity")}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => onActivityUpdate(actividad.idActividades)}>
                        {t("editar")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    {t("No activities found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </form>
    </>
  );
};
