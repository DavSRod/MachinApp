import { ButtonNext, InputUpdate, SelectComponent } from "../../../index.js";
import { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { multiFormData } from "../../../utils/formData.js";
import { FaUpload } from "react-icons/fa";
import { axiosCliente } from "../../../service/api/axios.js";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AuthContext } from "../../../contexts/AuthContext.jsx";

export const FormAreasUpdate = () => {
  const { t } = useTranslation();
  const [sedes, setSedes] = useState([]);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { rol } = useContext(AuthContext);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors }
  } = useForm();

  // Para debug - observar todos los valores del formulario
  const formValues = watch();
  useEffect(() => {
    console.log("Valores actuales del formulario:", formValues);
  }, [formValues]);
  
  const navigate = useNavigate();

  const handleSubmitData = async (data) => {
    console.log("Datos enviados:", data); // Debug
    const dataArea = {
      area_nombre: data.Nombre_del_area,
      area_fk_sedes: data.sede,
      img: imagen,
    };

    try {
      await multiFormData(
        `area/editararea/${id}`,
        dataArea,
        "PUT"
      );

      alert(t("update_sede_success"));
      navigate("/Areas");
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

  useEffect(() => {
    const fetchSedesAndArea = async () => {
      setIsLoading(true);
      try {
        const [sedeResponse, areaResponse] = await Promise.all([
          axiosCliente.get("sede/listarsede"),
          axiosCliente.get(`area/listararea/${id}`),
        ]);

        // Debug - ver las respuestas
        console.log("Respuesta del área:", areaResponse.data);
        console.log("Respuesta de sedes:", sedeResponse.data);

        const sedeArray = sedeResponse.data.resultadoSede.map((sede) => ({
          id: sede.idSede,
          valor: sede.sede_nombre,
        }));

        setSedes(sedeArray);
        
        // Obtener los datos del área y establecer los valores
        const areaData = areaResponse.data.resultadoArea[0]; // Accedemos al primer elemento del array
        if (areaData) {
          console.log("Estableciendo valores del área:", {
            nombre: areaData.area_nombre,
            sede: areaData.idSede
          });

          setValue("Nombre_del_area", areaData.area_nombre);
          setValue("sede", areaData.idSede?.toString());

          if (areaData.img_area) {
            setPreviewImagen(
              `${import.meta.env.VITE_API_IMAGE}imagenes/${areaData.img_area}`
            );
          }
        }
      } catch (error) {
        console.error("Error: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSedesAndArea();
  }, [id, setValue]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (rol !== "Administrador") {
    toast.error("Acceso denegado. Solo los administradores pueden acceder a este apartado.");
    navigate("/Areas"); 
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
            {t("update_area")}
          </h1>
        </header>

        <div className="flex flex-col w-full mt-8 items-center justify-center">
          <div className="flex items-center justify-center h-80 rounded bg-gray-100 w-3/5 shadow-inner">
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

          <h2 className="mt-5 text-xl font-semibold">
            {t("area_image")}
          </h2>
          <label className="mt-2 w-64 flex flex-col items-center px-4 py-2 bg-green-500 text-white rounded-lg shadow-md tracking-wide uppercase border border-green-600 cursor-pointer hover:bg-green-600">
            <FaUpload className="text-xl" />
            <span className="mt-2 text-base leading-normal">
              {t("select_file")}
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
              {t("area_info")}
            </h2>

            <div className="grid grid-cols-2 gap-6 mt-4">
              <Controller
                name="Nombre_del_area"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputUpdate
                    {...field}
                    label={t("area_name")}
                    tipo="text"
                    errors={errors}
                    isUpdating={true}
                  />
                )}
              />
              
              <Controller
                name="sede"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value, name } }) => (
                  <SelectComponent
                    options={sedes}
                    placeholder={t("select_sede")}
                    valueKey="id"
                    textKey="valor"
                    label={t("sede_area")}
                    value={value}
                    name={name}
                    register={() => register(name)}
                    onChange={(e) => {
                      console.log("Cambio en sede:", e.target.value);
                      onChange(e.target.value);
                    }}
                  />
                )}
              />
            </div>
          </div>
          <div className="pb-8">
            <ButtonNext
              color="success"
              text={t("update_area")}
              type="submit"
            />
          </div>
        </div>
      </form>
    </>
  );
};