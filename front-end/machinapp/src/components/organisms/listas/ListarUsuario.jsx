import { useAuth, Icons, V } from "../../../index.js";

import { Divider, Button } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const BuscarUsuario = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const newd = {
    [t("nombre")]: user.us_nombre,
    [t("apellidos")]: user.us_apellidos,
    [t("correo")]: user.us_correo,
    [t("numero_documento")]: user.us_numero_documento,
    [t("especialidad")]: user.us_especialidad,
    [t("empresa")]: user.us_empresa,
  };

  const iconArray = {
    [t("nombre")]: V.UserIcon,
    [t("apellidos")]: V.UserIcon,
    [t("correo")]: V.EnvelopeIcon,
    [t("numero_documento")]: V.DocumentTextIcon,
    [t("especialidad")]: V.UserCircleIcon,
    [t("empresa")]: V.TruckIcon,
  };

  const newUser = Object.entries(newd);

    const capitalizarPrimeraLetra = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      <div className="px-5 flex justify-end">
        <Button color="primary" type="submit" radius="sm">
          <Link
            to={"/perfil/settings"}
            className="h-full w-full text-sm flex justify-center items-center "
          >
            {t("editar_informacion")}
          </Link>
        </Button>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 rounded-lg">
        <Divider />

        <div className="text-base sm:text-lg lg:text-xl">
          <div
            action=""
            className="space-y-8 md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
          >
            <div className="flex items-center  md:w-2/5 justify-center w-full bg-gray-300 rounded dark:bg-gray-700 overflow-hidden">
              <img
                src={
                  user.us_imagen
                    ? `${import.meta.env.VITE_API_IMAGE}imagenes/${user.us_imagen}`
                    : null
                }
                className="object-cover w-full h-48 sm:h-64 md:h-80 lg:h-96"
              />
            </div>

            <div className="w-full">
              <div className="p-3 sm:p-1 lg:flex-auto">
                <div className="mt-10 flex items-center gap-x-1">
                  <span className="flex-none text-sm font-semibold leading-6 text-indigo-600">
                    {t("informacion_personal")}
                  </span>
                  <div className="h-px flex-auto bg-gray-100"></div>
                </div>
                <ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                  {newUser.map(([key, value]) => (
                    <li
                      key={key}
                      className={`${V.radius} flex flex-col p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300`}
                    >
                      <label className="flex flex-col space-y-2">
                        <span className="font-semibold text-gray-800 capitalize">
                          {key}
                        </span>
                        <div className="flex items-center gap-2">
                          <Icons icon={iconArray[key]} />
                          <span className="text-gray-700">
                            {capitalizarPrimeraLetra(value) || "No disponible"}
                          </span>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <Divider />
        </div>
      </div>
    </>
  );
};

