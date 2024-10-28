import { useEffect } from "react";
import { Layout, FormUserUpdate } from "../../index";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const UpdateUserAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const resultadoUsuario = location.state?.resultadoUsuario;

  useEffect(() => {
    if (!resultadoUsuario) {
      navigate("/Panelcontrol");
    }
  }, [resultadoUsuario, navigate]);

  if (!resultadoUsuario) {
    return <div>{t("loading")}</div>;
  }
   const capitalizarPrimeraLetra = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const DataUser = {
    id: resultadoUsuario.idUsuarios,
    nombre: capitalizarPrimeraLetra(resultadoUsuario.us_nombre),
    apellidos: capitalizarPrimeraLetra(resultadoUsuario.us_apellidos),
    correo: resultadoUsuario.us_correo,
    tipo_documento: resultadoUsuario.us_tipo_documento,
    numero_documento: resultadoUsuario.us_numero_documento,
    empresa: capitalizarPrimeraLetra(resultadoUsuario.us_empresa),
    especialidad: capitalizarPrimeraLetra(resultadoUsuario.us_especialidad),
    rol: resultadoUsuario.rol_nombre,
    id_rol: resultadoUsuario.fk_roles,
  };

  return (
    <>
      <Layout>
        <FormUserUpdate userData={DataUser} />
      </Layout>
    </>
  );
};
