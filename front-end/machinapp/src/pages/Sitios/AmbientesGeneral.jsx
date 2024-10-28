import { Layout, Breadcrumb, BuscarAmbientesGeneral } from "../../index";
import { useTranslation } from "react-i18next";

export const AmbientesGeneral = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <Breadcrumb pageName={t("ambiente1")} />
      <BuscarAmbientesGeneral />
    </Layout>
  );
};