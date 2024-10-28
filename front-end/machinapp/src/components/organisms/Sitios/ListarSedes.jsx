import { axiosCliente, V, ButtonNext, Icons } from "../../../index";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { AiFillInfoCircle } from "react-icons/ai";
import { useTranslation } from "react-i18next";

export const BuscarSedes = () => {
  const { t } = useTranslation(); // Hook de traducción
  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    const listarSede = async () => {
      try {
        const response = await axiosCliente.get("/sede/listarsede");
        setSedes(response.data.resultadoSede);
      } catch (error) {
        console.error(error.response.data);
      }
    };

    listarSede();
  }, []);

  const handleImageError = (event) => {
    event.target.style.display = "none";
    const parent = event.target.parentElement;
    const errorMessage = document.createElement("div");
    errorMessage.className =
      "absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500 font-bold";
    errorMessage.textContent = t("imageNotFound"); // Texto traducido
    parent.appendChild(errorMessage);
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <header className={`py-16 shadow-md top-0 z-10 ${V.bg_sena_verde}`}>
        <h1 className="text-4xl font-extrabold text-center text-white">
          Centro de Gestión y Desarrollo Sostenible Surcolombiano
        </h1>
        <p className="text-center text-white mt-6 mx-4 md:mx-0">
          {t("description_centro")} {/* Descripción traducida */}
        </p>
      </header>
      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-7">
          <ButtonNext
            color={"success"}
            startContent={<Icons icon={V.PlusIcon} />}
            className={`text-white`}
          >
            <Link to={"/Sedes/Registrar"}>{t("registerNew")}</Link>
          </ButtonNext>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {sedes.map((sede) => (
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl relative"
              key={sede.idSede}
            >
              <div className="relative h-72 items-center justify-center flex">
                <img
                  src={`${import.meta.env.VITE_API_IMAGE}imagenes/${sede.img_sede}`}
                  alt={sede.sede_nombre}
                  className="h-full"
                  onError={(e) =>
                    (e.target.src = `${import.meta.env.VITE_API_IMAGE}imagenes/noEncontrada.jpg`)
                  }
                />
              </div>
              <Link to={`/Sedes/InfoSede/${sede.idSede}`}>
                <button className="absolute text-4xl top-4 right-4 text-gray-500 hover:cursor-pointer hover:text-gray-700">
                  <AiFillInfoCircle />
                </button>
              </Link>
              <div className="p-6">
                <div className="flex justify-end">
                  <Link to={`/Sedes/Actualizar/${sede.idSede}`}>
                    <button className="text-4xl text-orange-400 hover:cursor-pointer hover:text-orange-500">
                      <FaEdit />
                    </button>
                  </Link>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {sede.sede_nombre}
                </h2>
                <p className="text-gray-600 mt-2">{sede.sede_nombre_centro}</p>
                <div className="mt-4 flex justify-end">
                  <ButtonNext
                    type={"submit"}
                    color={"success"}
                    text={" "}
                    className={"text-white"}
                  >
                    <Link
                      to={`/Sedes/${sede.idSede}`}
                      className=" h-full w-full flex justify-center items-center"
                    >
                      {t("ingresar")}
                    </Link>
                  </ButtonNext>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
