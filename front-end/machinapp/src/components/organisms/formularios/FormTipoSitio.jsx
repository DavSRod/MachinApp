import {
  axiosCliente,
  ButtonNext,
  InputforForm,
} from "../../../index.js";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext.jsx";
import { useContext } from "react";

export const FormTipoSitio = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { rol } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmitData = async (data) => {
    const dataTipoSitio = {
      tipo_sitio: data.tipo_sitio,
    };
    console.log(dataTipoSitio);
    try {
      await axiosCliente.post(
        "tipositio/registrartipositio",
        dataTipoSitio
      );

      toast.success(t("successMessage"));

    } catch (error) {
      toast.error(error.response?.data?.mensaje || t("unknownError"));
    }
  };

  if (rol !== "Administrador") {
    toast.error("Acceso denegado. Solo los administradores pueden acceder a este apartado.");
    navigate("Ambientes"); 
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitData)}
      className="bg-white shadow-lg border rounded-lg w-full mx-auto"
    >
      <header className="bg-gradient-to-r from-green-400 to-green-600 h-20 flex justify-center items-center rounded-t-lg">
        <h1 className="text-3xl font-bold text-white">
          {t("registrar_nuevo_tipositio")}
        </h1>
      </header>

      <div className="flex flex-col w-full mt-8 items-center justify-center">
        <div className="w-3/4 my-8 p-4 bg-gray-50 rounded-lg shadow-md">
          <h2 className="mt-5 text-2xl font-semibold text-center text-gray-700">
            {t("tipo_sitio_info")}
          </h2>

          <div className="mt-4">
            <InputforForm
              errors={errors}
              register={register}
              tipo={"text"}
              name={"tipo_sitio"}
              label={t("tipo_sitio")}
              required
            />
          </div>
        </div>
        <div className="pb-8">
          <ButtonNext
            color="success"
            text={t("registrar_tipo_sitio")}
            className={"text-white"}
            type="submit"
          />
        </div>
      </div>
    </form>
  );
};