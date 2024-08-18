import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosCliente } from '../../../service/api/axios';
import ButtonC from '../../atoms/buttons/BottonC';
import { FaEdit } from 'react-icons/fa';

const BuscarAreas = ({ idSede }) => {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const listarArea = async () => {
      try {
        const response = await axiosCliente.get(`area/listarporsede/${idSede}`);
        setAreas(response.data.resultadoAreas);
      } catch (error) {
        console.error(error);
      }
    };

    listarArea();
  }, [idSede]);

  const handleImageError = (event) => {
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    const errorMessage = document.createElement('div');
    errorMessage.className = 'absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500 font-bold';
    errorMessage.textContent = 'No se encontró imagen';
    parent.appendChild(errorMessage);
  };

  return (
    <div className='bg-gray-200 min-h-screen'>
      <header className='bg-green-500 py-16 shadow-md top-0 z-10'>
        <h1 className='text-4xl font-extrabold text-center text-white'>
          Centro de Gestión y Desarrollo Sostenible Surcolombiano
        </h1>
        <p className='text-center text-white mt-6 mx-4 md:mx-0'>
          Este centro está ubicado en el departamento del Huila, municipio de Pitalito. Este centro cuenta con dos sedes a día de hoy.
        </p>
      </header>
      <div className='container mx-auto p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          {areas.map((area) => (
            <div
              className='bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl relative'
              key={area.idArea}
            >
              <div className='relative h-64'>
                <img
                  src={`http://localhost:3000/imagenes/${area.img_area}`}
                  alt={area.area_nombre}
                  className='w-full h-full object-cover'
                  onError={handleImageError}
                />  
              </div>
              <div className='p-6'>
                <div className='flex justify-end'>
                  <button className="text-4xl text-orange-400 hover:cursor-pointer hover:text-orange-500">
                    <FaEdit />
                  </button>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>{area.area_nombre}</h2>
                <p className='text-gray-600 mt-2'>{area.sede_nombre}</p>
                <div className='mt-4 flex justify-end'>
                  <Link to={`/Areas/${area.idArea}`}>
                    <ButtonC bgColor='bg-green-400 hover:bg-green-600 text-white' name='Ingresar' />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuscarAreas;