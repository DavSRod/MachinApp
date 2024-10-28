import { ButtonNext } from "../../../index.js";
import { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { multiFormData } from "../../../utils/formData.js";
import { FaUpload } from "react-icons/fa";
import { axiosCliente } from "../../../service/api/axios.js";
import { useGlobalData } from "../../../index.js";
import { useTranslation } from "react-i18next";
import { InputUpdate, SelectComponent } from "../../../index.js";
import { AuthContext } from "../../../contexts/AuthContext.jsx";
import { toast } from "react-toastify";

export const FormAmbientesUpdate = () => {
  const [areas, setAreas] = useState([]);
  const [tipositios, setTipositios] = useState([]);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [dataSitio, setDataSitio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { rol } = useContext(AuthContext);
  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm();
  
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { dataUser } = useGlobalData();

  // Para debug - observar todos los valores del formulario
  const formValues = watch();
  useEffect(() => {
    console.log("Valores actuales del formulario:", formValues);
  }, [formValues]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [areaResponse, tipoSitioResponse, sitioResponse] =
          await Promise.all([
            axiosCliente.get("area/listararea"),
            axiosCliente.get("tipositio/listartipositio"),
            axiosCliente.get(`/sitio/listarsitioporid/${id}`)
          ]);

        // Debug - ver las respuestas
        console.log("Respuesta del sitio:", sitioResponse.data);
        console.log("Respuesta de áreas:", areaResponse.data);
        console.log("Respuesta de tipos:", tipoSitioResponse.data);

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

        const sitioData = sitioResponse.data.resultadoSitio[0]; // Asegúrate de acceder al primer elemento del array
        setDataSitio(sitioData);
        
        // Establecer los valores uno por uno para asegurar que se actualicen
        setValue("Nombre_del_ambiente", sitioData.sit_nombre);
        setValue("area", sitioData.sit_fk_areas?.toString());
        setValue("tipo_sitio", sitioData.sit_fk_tipo_sitio?.toString());
        setValue("instructor", sitioData.sit_fk_usuarios?.toString());
        setValue("tipo_de_tenencia", sitioData.tipo_tenencia);
        setValue("sitio_estado", sitioData.sit_estado);

        // Debug - verificar que los valores se establecieron
        console.log("Valores establecidos:", {
          nombre: sitioData.sit_nombre,
          area: sitioData.sit_fk_areas,
          tipo_sitio: sitioData.sit_fk_tipo_sitio,
          instructor: sitioData.sit_fk_usuarios,
          tipo_tenencia: sitioData.tipo_tenencia,
          estado: sitioData.sit_estado
        });

        if (sitioData.img) {
          const previewUrl = `${import.meta.env.VITE_API_IMAGE}imagenes/${sitioData.img}`;
          setPreviewImagen(previewUrl);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  const handleSubmitData = async (data) => {
    console.log("Datos enviados:", data); // Debug
    const dataSitio = {
      sit_nombre: data.Nombre_del_ambiente,
      sit_fk_areas: data.area,
      sit_fk_tipo_sitio: data.tipo_sitio,
      sit_fk_usuarios: data.instructor,
      tipo_tenencia: data.tipo_de_tenencia,
      sit_estado: data.sitio_estado,
      img: imagen,
    };

    try {
      await multiFormData(
        `sitio/editarsitio/${id}`,
        dataSitio,
        "PUT"
      );

      alert(t("update_sede_success"));
      navigate("/Ambientes");
    } catch (error) {
      alert(t("update_sede_error"));
      console.log(error);
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

  // Debug - mostrar el estado actual
  console.log("Estado actual:", {
    areas,
    tipositios,
    dataSitio,
    isLoading,
    formValues
  });

  if (isLoading) {
    return <div>Cargando datos del ambiente...</div>;
  }

  if (rol !== "Administrador") {
    toast.error("Acceso denegado. Solo los administradores pueden acceder a este apartado.");
    navigate("/Ambientes"); 
    return null;
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(handleSubmitData)}
        className="bg-white shadow-lg border rounded-lg w-full mx-auto"
      >
        <header className="bg-gradient-to-r from-green-400 to-green-600 h-24 flex justify-center items-center rounded-t-lg">
          <h1 className="text-3xl font-bold text-white">
            {t("update_ambiente")}
          </h1>
        </header>

        <div className="flex flex-col w-full mt-8 items-center justify-center">
          <div className="flex items-center justify-center h-80 rounded bg-gray-100 w-3/5 shadow-inner">
            {previewImagen ? (
              <img
                className="h-full rounded"
                alt={t("imagePreview")}
                src={previewImagen}
              />
            ) : (
              <FaUpload className="text-gray-400 text-6xl" />
            )}
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            {t("imageAmbiente")}
          </h2>
          <label className="mt-2 w-64 flex flex-col items-center px-4 py-2 bg-green-500 text-white rounded-lg shadow-md tracking-wide uppercase border border-green-600 cursor-pointer hover:bg-green-600">
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

          <div className="w-3/4 my-8 p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="mt-5 text-2xl font-semibold text-center text-gray-700">
              {t("ambiente_info")}
            </h2>

            <div className="flex flex-col gap-6 mt-4">
              <Controller
                name="Nombre_del_ambiente"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputUpdate
                    label={t("environmentName")}
                    tipo="text"
                    errors={errors}
                    isUpdating={true}
                    {...field}
                  />
                )}
              />

              <div className="flex flex-row gap-4">
                <Controller
                  name="tipo_sitio"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value, ...field } }) => (
                    <SelectComponent
                      options={tipositios}
                      name="tipo_sitio"
                      placeholder={t("tipo_sitio")}
                      valueKey="id"
                      textKey="valor"
                      register={register}
                      label={t("tipo_sitio")}
                      value={value}
                      onChange={(e) => {
                        console.log("Cambio en tipo_sitio:", e.target.value);
                        onChange(e.target.value);
                      }}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="instructor"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value, ...field } }) => (
                    <SelectComponent
                      options={dataUser.filter(item => item.rol_nombre === "instructor").map(item => ({
                        id: item.idUsuarios,
                        valor: item.us_nombre + " " + item.us_apellidos,
                      }))}
                      name="instructor"
                      placeholder={t("instructor_encargado")}
                      valueKey="id"
                      textKey="valor"
                      register={register}
                      label={t("instructor_encargado")}
                      value={value}
                      onChange={(e) => {
                        console.log("Cambio en instructor:", e.target.value);
                        onChange(e.target.value);
                      }}
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="flex flex-row gap-4">
                <Controller
                  name="area"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value, ...field } }) => (
                    <SelectComponent
                      options={areas}
                      name="area"
                      placeholder={t("area")}
                      valueKey="id"
                      textKey="valor"
                      register={register}
                      label={t("area")}
                      value={value}
                      onChange={(e) => {
                        console.log("Cambio en area:", e.target.value);
                        onChange(e.target.value);
                      }}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="tipo_de_tenencia"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value, ...field } }) => (
                    <SelectComponent
                      options={[
                        { id: "propio", valor: t("propio") },
                        { id: "comodato", valor: t("comodato") },
                        { id: "arriendo", valor: t("arriendo") },
                        { id: "convenio", valor: t("convenio") },
                      ]}
                      name="tipo_de_tenencia"
                      placeholder={"Type of tenure"}
                      label={"Type of tenure"}
                      valueKey="id"
                      textKey="valor"
                      register={register}
                      value={value}
                      onChange={(e) => {
                        console.log("Cambio en estado:", e.target.value);
                        onChange(e.target.value);
                      }}
                      {...field}
                    />
                  )}
                />
              </div>

              <Controller
                name="sitio_estado"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value, ...field } }) => (
                  <SelectComponent
                    options={[
                      { id: "activo", valor: t("activo") },
                      { id: "inactivo", valor: t("inactivo") },
                    ]}
                    name="sitio_estado"
                    placeholder={"Site status"}
                    valueKey="id"
                    textKey="valor"
                    register={register}
                    label={"Site status"}
                    value={value}
                    onChange={(e) => {
                      console.log("Cambio en estado:", e.target.value);
                      onChange(e.target.value);
                    }}
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <ButtonNext color={"success"} type="submit" text={t("update_ambiente")} />
        </div>
      </form>
    </>
  );
};