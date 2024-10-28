import {
  ButtonNext,
  InputforForm,
  SelectComponent,
  multiFormData,
  axiosCliente,
  useGlobalData,
} from "../../../index.js";
import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext.jsx";

export const FormAmbientes = () => {
  const { t } = useTranslation();
  const { rol } = useContext(AuthContext);
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [tipositios, setTipositios] = useState([]);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [imagen, setImagen] = useState([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Obtener datos globales de los ambientes
  const { dataUser, refress } = useGlobalData();

  const handleSubmitData = async (data) => {
    // Generar la fecha actual automáticamente
    const fechaActual = new Date().toISOString().split('T')[0];

    // Asignar 'activo' por defecto al campo sit_estado
    const dataSitio = {
      sit_nombre: data.Nombre_del_ambiente,
      sit_fecha_registro: fechaActual, // Fecha actual enviada automáticamente
      sit_fk_areas: data.area,
      sit_fk_tipo_sitio: data.tipo_sitio,
      sit_fk_usuarios: data.instructor,
      img: imagen,
      tipo_tenencia: data.tipo_tenencia,
      sit_estado: 'activo', // Estado asignado automáticamente como 'activo'
    };

    try {
      await multiFormData(
        "sitio/registrarsitio",
        dataSitio,
        "POST"
      );

      toast.success(t("successMessage"));
      await refress();
      reset();

    } catch (error) {
      toast.error(error.response?.data?.mensaje || t("unknownError"));
    }
  };

  const handleFileUpload = (event) => {
    const archivo = event.target.files[0];
    if (archivo) {
      const previewUrl = URL.createObjectURL(archivo);
      setPreviewImagen(previewUrl);
      setImagen(archivo);
    } else {
      setPreviewImagen(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areaResponse, tipoSitioResponse] = await Promise.all([
          axiosCliente.get("area/listararea"),
          axiosCliente.get("tipositio/listartipositio"),
        ]);

        const areaArray = areaResponse.data.resultadoArea.map((item) => ({
          id: item.idArea,
          valor: item.area_nombre,
        }));

        const tipositioArray = tipoSitioResponse.data.map((item) => ({
          id: item.idTipo_sitio,
          valor: item.tipo_sitio,
        }));

        setAreas(areaArray);
        setTipositios(tipositioArray);
      } catch (error) {
        console.error(error.response);
      }
    };
    fetchData();
  }, []);

  if (rol !== "Administrador") {
    toast.error("Acceso denegado. Solo los administradores pueden acceder a este apartado.");
    navigate("/Ambientes"); 
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitData)}
      className="bg-white shadow-lg border rounded-lg w-full mx-auto"
    >
      <header className="bg-gradient-to-r from-green-400 to-green-600 h-20 flex justify-center items-center rounded-t-lg">
        <h1 className="text-3xl font-bold text-white">
          {t("registerEnvironment")}
        </h1>
      </header>

      <div className="flex flex-col w-full mt-8 items-center justify-center">
        <div className="flex items-center justify-center h-64 rounded bg-gray-100 w-3/5 shadow-inner">
          {previewImagen ? (
            <img
              className="h-full rounded"
              alt="Preview"
              src={previewImagen}
            />
          ) : (
            <FaUpload className="text-gray-400 text-6xl" />
          )}
        </div>

        <h2 className="mt-5 text-xl font-semibold">{t("imageEnvironment")}</h2>
        <label className="mt-2 flex flex-col items-center px-4 py-2 bg-green-500 text-white rounded-lg shadow-md tracking-wide uppercase border border-green-600 cursor-pointer hover:bg-green-600">
          <FaUpload className="text-xl" />
          <span className="mt-2 text-base leading-normal">
            {t("selectFile")}
          </span>
          <input
            type="file"
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </label>
        {errors.img_sede && (
          <p className="text-red-500 text-xs mt-2">
            {errors.img_sede.message}
          </p>
        )}

        <div className="w-3/4 my-8 p-4 bg-gray-50 rounded-lg shadow-md">
          <h2 className="mt-5 text-2xl font-semibold text-center text-gray-700">
            {t("environmentInfo")}
          </h2>

          <div className="flex flex-col gap-6 mt-4">
            <InputforForm
              errors={errors}
              register={register}
              tipo={"text"}
              name={"Nombre_del_ambiente"}
              label={t("environmentName")}
              required
            />
            <div className="flex flex-row">
            <SelectComponent
              options={areas}
              name="area"
              placeholder={t("area")}
              valueKey="id"
              textKey="valor"
              register={register}
              label={t("area")}
              required
            />
            <SelectComponent
              options={tipositios}
              name="tipo_sitio"
              placeholder={t("siteType")}
              valueKey="id"
              textKey="valor"
              register={register}
              label={t("siteType")}
              required
            />
                        <SelectComponent
              options={dataUser
                .filter((item) =>
                  item.rol_nombre
                    .trim()
                    .toLowerCase()
                    .startsWith("instructor")
                )
                .map((item) => ({
                  id: item.idUsuarios,
                  valor: item.us_nombre + " " + item.us_apellidos,
                }))}
              name="instructor"
              placeholder={t("instructor_encargado")}
              valueKey="id"
              textKey="valor"
              register={register}
              label={t("instructor_encargado")}
              required
            />
            <SelectComponent
              options={[
                { id: 'propio', valor: 'Propio' },
                { id: 'comodato', valor: 'Comodato' },
                { id: 'arriendo', valor: 'Arriendo' },
                { id: 'convenio', valor: 'Convenio' }
              ]}
              name="tipo_tenencia"
              placeholder={t("tipo_tenencia")}
              valueKey="id"
              textKey="valor"
              register={register}
              label={t("tipo_tenencia")}
              required
            />
            </div>
          </div>
        </div>
        <div className="pb-8">
          <ButtonNext
            color="success"
            text={t("registerEnvironmentButton")}
            className={"text-white"}
            type="submit"
          />
        </div>
      </div>
    </form>
  );
};