import { useState } from "react";
import {
  useGlobalData,
  useRegistrarUsuario,
  ButtonNext,
  InputforForm,
  SelectComponent,
  V,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const FormUser = () => {
  const { registrarUsuario, loading } = useRegistrarUsuario();
  const { refreshDataUser, roles } = useGlobalData();
  const [errorUser, setError] = useState("");
  const { t } = useTranslation();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const handleSumitData = async (data) => {
    try {
      const res = await registrarUsuario(data);

      if (res && res.Mensaje) {
        await refreshDataUser();
        reset();
        toast.success(res.Mensaje);
        setError("");
      }
    } catch (error) {
      /*  console.log(error); */
      toast.error("Error en peticion");
      let newErrors = {};

      if (error.response?.data.error) {
        error.response.data.error.forEach((element) => {
          newErrors[element.path[0]] = element.message;
        });
      }

      if (error.response?.data.mensaje) {
        newErrors.correo = error.response.data.mensaje;
      }

      if (error.response?.data.mensajeDoc) {
        newErrors.numeroDocumento = error.response.data.mensajeDoc;
      }

      setError(newErrors);
    }
  };

  return (
    <>
      <form
        action=""
        className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md"
        onSubmit={handleSubmit(handleSumitData)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="flex flex-col">
            <InputforForm
              errors={errors}
              register={register}
              name={"nombre"}
              label={t("nombre")}
            />
          </div>

          <div className="flex flex-col">
            <InputforForm
              errors={errors}
              register={register}
              name={"apellidos"}
              label={t("apellidos")}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <InputforForm
            tipo={"email"}
            errors={errors}
            register={register}
            name={"correo"}
            label={t("correo")}
          />
          {errorUser.correo}
        </div>

        <div className="flex flex-col">
          <SelectComponent
            options={[
              { name: "cedula de ciudadania", tra : t("cedula_ciudadania") },
              { name: "tarjeta identidad", tra : t("tarjeta_identidad")  },
              { name: "cedula extranjeria" , tra : t("cedula_extranjeria")},
            ]}
            name="tipo_documento"
            placeholder={t("tipo_documento")}
            valueKey="name"
            textKey="tra"
            register={register}
            label={t("tipo_documento")}
          />
        </div>

        <div className="flex flex-col">
          <InputforForm
            errors={errors}
            register={register}
            name={"numero_documento"}
            label={t("numero_documento")}
          />
          {errorUser.numeroDocumento && (
            <span className="text-red-500 text-sm mt-1">
              {errorUser.numeroDocumento}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="flex flex-col">
            <InputforForm
              errors={errors}
              register={register}
              name={"contrasenia"}
              label={t("contrasena")}
            />
            {errorUser.contrasenia && (
              <span className="text-red-500 text-sm mt-1">
                {errorUser.contrasenia}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <SelectComponent
              options={roles}
              name="rol"
              placeholder="Rol"
              valueKey="idRoles"
              textKey="rol_nombre"
              register={register}
              label="Rol"
            />
          </div>
        </div>

        <ButtonNext
          color="s"
          type="submit"
          className={`${V.btnSecundary} ${V.text_white}`}
        >
          {loading ? "Registrando..." : t("registrar")}
        </ButtonNext>
      </form>
    </>
  );
};
