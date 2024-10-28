import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosCliente } from '../../../service/api/axios';
import { FaArrowLeft } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const InfoDetalladaAmbiente = () => {
  const { idAmbientes } = useParams();
  const [ambiente, setAmbiente] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const obtenerAmbiente = async () => {
      try {
        const response = await axiosCliente.get(`/sitio/listarsitioporid/${idAmbientes}`);
        console.log(response.data.resultadoSitio)
        setAmbiente(response.data.resultadoSitio);
      } catch (error) {
        console.error(error);
      }
    };

    obtenerAmbiente();
  }, [idAmbientes]);

  if (!ambiente) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8">

        {/* Header con navegación */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('ambiente_info')}</h1>
          <Link to="/Ambientes">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              <FaArrowLeft className="mr-2" /> {t('back')}
            </button>
          </Link>
        </div>

        {/* Imagen del ambiente */}
        <div className="relative flex justify-center items-center w-full h-80 mb-6">
          <img
            src={`${import.meta.env.VITE_API_IMAGE}imagenes/${ambiente[0].img_sitio}`}
            alt={ambiente[0].sit_nombre}
            className="h-full rounded-lg shadow-md"
            onError={(e) => e.target.src = `${import.meta.env.VITE_API_IMAGE}imagenes/noEncontrada.jpg`}
          />
        </div>

        {/* Ficha técnica en formato tabla */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <table className="table-auto w-full text-left text-gray-700">
            <thead className="bg-green-600">
              <tr>
                <th className="px-4 py-2 font-semibold text-gray-800">{t('campo_ambiente')}</th>
                <th className="px-4 py-2 font-semibold text-gray-800">{t('valor_sede')}</th>
              </tr>
            </thead>
            <tbody>
              {ambiente.map((detalle, index) => (
                <React.Fragment key={index}>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{t('id')}:</td>
                    <td className="px-4 py-2">{detalle.idAmbientes}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{t('nombre_sitio')}:</td>
                    <td className="px-4 py-2">{detalle.sit_nombre}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{t('fecha_registro')}:</td>
                    <td className="px-4 py-2">{new Date(detalle.sit_fecha_registro).toLocaleDateString()}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{t('area_ubicada')}:</td>
                    <td className="px-4 py-2">{detalle.area_nombre}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{t('tipo_sitio')}:</td>
                    <td className="px-4 py-2">{detalle.tipo_sitio}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{t('instructor_encargado')}:</td>
                    <td className="px-4 py-2">{detalle.instructor_encargado}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{t('tipo_tenencia')}:</td>
                    <td className="px-4 py-2">{detalle.tipo_tenencia}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{t('estado')}:</td>
                    <td className="px-4 py-2">{detalle.sit_estado}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InfoDetalladaAmbiente;