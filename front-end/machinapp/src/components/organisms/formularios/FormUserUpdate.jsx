import {
  useAuth,
  useFetchRoles,
  SelectComponent,
  InputForm,
  InputUpdate,
  V,
  multiFormData,
  ButtonNext,
  slepp,
} from "../../../index";

import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Spinner, Input } from "@nextui-org/react";

// eslint-disable-next-line react/prop-types
export const FormUserUpdate = ({ userData }) => {
  const { rol, refreshUserLoged } = useAuth();
  const { roles } = useFetchRoles();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = userData;

  const ADMIN = "Administrador";

  const [admin, setAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Inicialmente true

  // manejo de erroes
  const [errores, setErrors] = useState("");
  const [localUser, setLocalUser] = useState({ imagen: "" });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    data.rol =
      data.rol === "undefined" || !data.rol
        ? String(user.id_rol)
        : String(data.rol);
    // data.tipo_documento = data.tipo_documento || user.tipo_documento;

    try {
      const res = await multiFormData(
        `user/actualizar/${user.id}`,
        data,
        "PUT"
      );

      await refreshUserLoged();

      if (res) {
        await slepp(300);
        toast.success(res.data.Mensaje);
        if (res.data && rol === ADMIN) {
          navigate("/Panelcontrol");
        } else {
          navigate("/perfil");
          await refreshUserLoged();
        }
      }
    } catch (error) {
      setIsLoading(false);

      toast.error("Error, ya existe usuario con este número de documento");
      /*       console.log(error.response); */
      let errores = error.response.data.mensaje
        ? { num: error.response.data.mensaje }
        : "";

      let neWerrores = {};
      if (error.response?.data.error) {
        error.response.data.error.forEach((element) => {
          neWerrores[element.path[0]] = element.message;
        });
      }
      setErrors(Object.keys(neWerrores).length > 0 ? neWerrores : errores);
    }
  };

  const handleFileUpload = (event) => {
    const imagen = event.target.files[0];

    setLocalUser((prevState) => ({
      ...prevState,
      imagen: imagen,
    }));
  };
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      reset({
        nombre: user.nombre || "",
        correo: user.correo || "",
        numero_documento: user.numero_documento || "",
        apellidos: user.apellidos || "",
        imagen: localUser.imagen || user.imagen || "",
        empresa: user.empresa || "",
        especialidad: user.especialidad || "",
        rol: user.id_rol || "",
        tipo_documento: user.tipo_documento,
      });
    }
    setIsLoading(false);
  }, [user, reset, localUser, roles]);

  useEffect(() => {
    const comprobarAdmin = () => {
      if (rol === ADMIN) {
        setAdmin(true);
        return;
      }
      setAdmin(false);
    };
    comprobarAdmin();
  }, [rol, admin]);

  if (isLoading) {
    return <div>{t("cargando_datos_usuario")}</div>;
  }
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-5 gap-8"
      >
        <div className="col-span-5 xl:col-span-2 flex flex-col gap-10">
          <div
            className={`rounded-sm border border-stroke shadow-default dark:border-strokedark dark:bg-boxdark`}
          >
            <div
              className={`border-b border-stroke py-3 px-5 dark:border-strokedark ${V.bg_sena_verde}`}
            >
              <span className="font-medium text-black dark:text-white">
                {t("tu_foto")}
              </span>
            </div>
            <div className="p-7">
              <div
                id="FileUpload"
                className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                        fill="#3C50E0"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                        fill="#3C50E0"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                        fill="#3C50E0"
                      />
                    </svg>
                  </span>
                  <p>
                    <span className="text-primary">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                  <p>(max, 800 X 800px)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-80 w-full border items-center">
            <div
              className={`border-b border-stroke py-3 px-5 dark:border-strokedark ${V.bg_sena_verde}`}
            >
              <span className="font-medium text-black dark:text-white">
                {t("restablecer_contresena")}
              </span>
            </div>
            <div className="p-10">
              <label className="mb-3 block text-green-500 dark:text-gray-400text-sm font-medium ">
                {t("nueva_contrasena")}
              </label>
              <Input
                {...register("password")}
                placeholder={t("contrasena")}
                autoComplete="off"
                variant="bordered"
                radius="sm"
                size="md"
              />
            </div>
          </div>
        </div>

        <div className="col-span-5 xl:col-span-3 border">
          <div
            className={`border-b border-stroke py-3 px-7  ${V.bg_sena_verde}`}
          >
            <h3 className="font-medium text-black dark:text-white">
              {t("informacion_personal")}
            </h3>
          </div>
          <div className="p-7">
            {userData ? (
              <div>
                <div className="mb-5.5 flex flex-col gap-10 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <Controller
                      name="nombre"
                      control={control}
                      defaultValue={user?.nombre || ""}
                      rules={{ required: "Correo es obligatorio" }}
                      render={({ field }) => (
                        <InputUpdate
                          {...field}
                          errors={errors}
                          label={t("nombre")}
                          tipo="text"
                          isUpdating={true}
                        />
                      )}
                    />
                  </div>

                  <div className="w-full sm:w-1/2">
                    <Controller
                      name="apellidos"
                      control={control}
                      rules={{ required: true }}
                      defaultValue={user?.apellidos || ""}
                      render={({ field }) => (
                        <InputUpdate
                          {...field}
                          errors={errors}
                          label={t("apellidos")}
                          tipo="text"
                          isUpdating={true}
                        />
                      )}
                    />
                  </div>
                </div>
                <Controller
                  name="correo"
                  control={control}
                  rules={{ required: "Correo es obligatorio" }}
                  defaultValue={user?.correo || ""}
                  render={({ field }) => (
                    <InputUpdate
                      {...field}
                      label={t("correo")}
                      errors={errors}
                      tipo="email"
                      isUpdating={true}
                    />
                  )}
                />

                <div className="mb-5.5  flex flex-col gap-10 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <Controller
                      name="numero_documento"
                      control={control}
                      rules={{ required: true }}
                      defaultValue={user?.numero_documento || ""}
                      render={({ field }) => (
                        <InputUpdate
                          {...field}
                          errors={errors}
                          label={t("numero_documento")}
                          tipo="text"
                          isUpdating={true}
                        />
                      )}
                    />
                    {errores.numero_documento && (
                      <p className="text-red-500">{errores.numero_documento}</p>
                    )}
                    {errores.num && (
                      <>
                        <p className="text-red-500">{errores.num} </p>
                      </>
                    )}
                  </div>
                  {admin && (
                    <>
                      <div className="w-full sm:w-1/2 flex justify-center items-center">
                        <SelectComponent
                          options={[
                              {value: "cedula de ciudadania", tra: t("cedula_ciudadania")},
                              {value: "tarjeta identidad", tra: t("tarjeta_identidad")},
                              {value: "cedula extranjeria", tra: t("cedula_extranjeria")},

                          ]}
                          name="tipo_documento"
                          placeholder={t("tipo_documento")}
                          valueKey="value"
                          value={false}
                          textKey="tra"
                          register={register}
                          label={t("tipo_documento")}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-5.5 flex flex-col gap-10 sm:flex-row">
                  <div className="w-full sm:w-1/2"> {localUser.rol}</div>
                  {admin && (
                    <>
                      <div className="w-full sm:w-1/2 flex justify-center items-center">
                        <SelectComponent
                          options={roles}
                          name="rol"
                          placeholder={t("rol")}
                          valueKey="idRoles"
                          value={false}
                          textKey="rol_nombre"
                          register={register}
                          label={t("rol")}
                        />
                      </div>
                    </>
                  )}
                </div>

                {admin && (
                  <>
                    <div className="mb-5.5 flex flex-col gap-10 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <InputForm
                          errors={errors}
                          register={register}
                          name={"empresa"}
                          text={t("empresa")}
                        />
                      </div>
                      <div className="w-full sm:w-1/2">
                        <InputForm
                          errors={errors}
                          register={register}
                          name={"especialidad"}
                          text={t("especialidad")}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-4.5">
                  <ButtonNext
                    type="submit"
                    text={" "}
                    className={`${V.text_white} ${V.bg_sena_verde}`}
                    isLoading={isLoading}
                  >
                    {t("actualizar")}
                  </ButtonNext>
                </div>
              </div>
            ) : (
              <>
                <Spinner />
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
};
