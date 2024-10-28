// eslint-disable-next-line no-unused-vars

// layout
import { Layout, BuscarUsuario, Breadcrumb } from "../../index.js";
import { useTranslation } from "react-i18next";

export const Perfil = () => {
  const { t } = useTranslation();
  return (
    <>
      <Layout>
        <Breadcrumb pageName={t("informacion_personal")} />
        <BuscarUsuario />
      </Layout>
    </>
  );
};

