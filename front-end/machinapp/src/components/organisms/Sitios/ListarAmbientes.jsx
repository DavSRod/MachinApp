import { ButtonC, V, axiosCliente } from "../../../index.js"
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";
import { AiFillInfoCircle } from "react-icons/ai";
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción

// eslint-disable-next-line react/prop-types
export const BuscarAmbientes = ({ idArea }) => {
  const { t } = useTranslation(); // Usar el hook para obtener la función de traducción
  const [ambientes, setAmbientes] = useState([]);

  useEffect(() => {
    const listarSitio = async () => {
      try {
        const response = await axiosCliente.get(`/sitio/listarporarea/${idArea}`);
        setAmbientes(response.data.resultadoSitios);
      } catch (error) {
        console.error(error);
      }
    };

    listarSitio();
  }, [idArea]);

  const handleImageError = (event) => {
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    const errorMessage = document.createElement('div');
    errorMessage.className = 'absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500 font-bold';
    errorMessage.textContent = t('no_image_found'); // Usar la traducción para el mensaje de error
    parent.appendChild(errorMessage);
  };

  return (
    <div className='bg-gray-200 min-h-screen'>
      <header className={`py-16 shadow-md top-0 z-10 ${V.bg_sena_verde}`}>
        <h1 className='text-4xl font-extrabold text-center text-white'>
        Centro de Gestión y Desarrollo Sostenible Surcolombiano
        </h1>
        <p className='text-center text-white mt-6 mx-4 md:mx-0'>
          {t('descripcion_centro')} {/* Usar la traducción para la descripción */}
        </p>
      </header>
      <div className='container mx-auto p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          {ambientes.map((ambiente, index) => (
            <div className='bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl relative' key={index}>
              <div className='relative h-72 items-center justify-center flex'>
                <img
                  src={`${import.meta.env.VITE_API_IMAGE}imagenes/${ambiente.img_sitio}`}
                  alt={ambiente.area_nombre}
                  className='h-full'
                  onError={(e) => e.target.src = `${import.meta.env.VITE_API_IMAGE}imagenes/noEncontrada.jpg`}
                />
              </div>
              <Link to={`/Ambientes/InfoAmbiente/${ambiente.idAmbientes}`}>
                <button className='absolute text-4xl top-4 right-4 text-blue-600 hover:cursor-pointer hover:text-blue-700'>
                  <AiFillInfoCircle />
                </button>
              </Link>
              <div className='p-6'>
                <div className='flex justify-end'>
                  <Link to={`/Ambientes/Actualizar/${ambiente.idAmbientes}`}>
                    <button className="text-4xl text-orange-400 hover:cursor-pointer hover:text-orange-500">
                      <FaEdit />
                    </button>
                  </Link>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>
                  {ambiente.sit_nombre} ({ambiente.tipo_sitio}) {/* Aquí puedes usar la traducción si es necesario */}
                </h2>
                <p className='text-gray-700 mt-4'>{t('instructor')} {ambiente.instructor_encargado}</p> {/* Usar traducción para "Instructor" */}
                <div className='mt-4 flex justify-end'>
                  <Link to={`/MaquinasAmb/${ambiente.idAmbientes}`}>
                    <ButtonC bgColor="bg-green-400 hover:bg-green-600 text-white" name={t('entrar')} /> {/* Usar traducción para "Ingresar" */}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}