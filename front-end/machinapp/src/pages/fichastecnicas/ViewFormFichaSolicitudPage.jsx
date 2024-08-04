import Layout from "../../components/template/Layout";
import { FormFichaSolicitud } from "../../components/organisms/formularios/FormFichaSolicitud";

export const FichaSolicitudPage = () => {
  return (
    <>
      <Layout titlePage="Ficha solicitud">
        <div className="px-10 pt-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Crear Ficha de solicitud
          </h1>
          <div className="border-b-4 border-blue-500 inline-block w-full"></div>
        </div>
        <FormFichaSolicitud />
      </Layout>
    </>
  );
};