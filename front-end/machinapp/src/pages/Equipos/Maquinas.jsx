import { useEffect, useState, useContext } from "react";
import {
  Layout,
  Icons,
  Breadcrumb,
  PaginateTable,
  SearchComponent,
  useGlobalData,
} from "../../index.js";
import { Link } from "react-router-dom";
import { Button } from "@nextui-org/react";
import { PlusIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@nextui-org/react";
import { FaEye } from "react-icons/fa"
import { AuthContext } from '../../contexts/AuthContext.jsx'
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const Maquinas = () => {
  const { equiposData, eroresMaquinas } = useGlobalData();
  const { t } = useTranslation();

  const [maquinasFilt, setMaquinasFil] = useState([])

  const { rol } = useContext(AuthContext)
  const isAdmin = rol === "Administrador"

  useEffect(() => {
    if (eroresMaquinas) {
      /* toast.error() */
      toast.error(eroresMaquinas.mensaje);
      return;
    }
  }, [eroresMaquinas]);

  // columnas para la tabla

  const columns = [
    "Id",
    t("placaSena"),
    t("serial"),
    t("marca"),
    t("modelo"),
    t("ubicacion"),
    t("estado"),
    "",
  ];

  const contentTable = equiposData.map((maquina) => ({
    idFichas: maquina.idFichas,
    placa_sena: maquina.fi_placa_sena,
    serial: maquina.fi_serial,
    marca: maquina.fi_marca,
    modelo: maquina.fi_modelo,
    ubicacion: maquina.sit_nombre,
    estado: maquina.fi_estado,
  }));

  const buscarMaquina = (search) => {
    const filtrarMaquinas = contentTable.filter((maquina) => {
      return (
        maquina.placa_sena.toLowerCase().includes(search.toLowerCase()) ||
        maquina.ubicacion.toLowerCase().includes(search.toLowerCase()) ||
        maquina.estado.toLowerCase().includes(search.toLowerCase())
      );
    });
    setMaquinasFil(filtrarMaquinas);
  };

  return (
    <>
      <Layout titlePage="Maquinas">
        <Breadcrumb pageName={t("FichasTecnicas")} />

        {
          isAdmin && (
          <div className="pt-3 px-9 mt-10 flex justify-between">
            <div>
              <Button type="suc" className="text-white text-base bg-green-600 ">
                <Link
                  to={"/crearTiposFichaTec"}
                  className="flex gap-2 justify-center items-center h-full w-full"
                >
                  {t("RegistrarTipoFicha")} <Icons icon={PlusIcon} />
                </Link>
              </Button>

            </div>
  
            <Button type="suc" className="text-white text-base bg-green-600">
              <Link
                to={"/crearfichaequipos"}
                className="flex gap-2 justify-center items-center h-full w-full"
              >
                {t("agregarEquipo")} <Icons icon={PlusIcon} />
              </Link>
            </Button>
          </div>
          )
        }

        <div className="pt-3 px-9 mt-8 mb-10">
          <div className="mb-6">
            <SearchComponent
              label={`${t("placaSena")}, ${t('estado')}`}
              onSearch={buscarMaquina}
              className="w-full md:w-auto"
            />
          </div>

          <PaginateTable
            columns={columns}
            data={maquinasFilt.map((maquina) => ({
              ...maquina,
              estado: (
                <>
                  <div
                    className={`opacity-[.67] ${
                      maquina.estado === "operacion"
                        ? "bg-green-500/40"
                        : maquina.estado === "fuera_de_servicio"
                        ? "bg-red-500/40"
                        : "bg-yellow-500/40"
                    } py-1 px-2 flex justify-center rounded-3xl `}
                  >
                    <p
                      className={` ${
                        maquina.estado === "operacion"
                          ? "text-green-600"
                          : maquina.estado === "fuera_de_servicio"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }  flex justify-center rounded-md `}
                    >
                      {maquina.estado}
                    </p>
                  </div>
                </>
              ),
              ver: (
                <Link
                  to={`/infoMaquina/${maquina.idFichas}`}
                  className="bg-slate-900"
                >
                  <Tooltip content="Details">
                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                      <FaEye />
                    </span>
                  </Tooltip>
                </Link>
              ),
            }))}
          />
        </div>
      </Layout>
    </>
  );
};
