import  { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useState, useContext } from "react"
import { BiQrScan } from "react-icons/bi"
import { CiSaveDown1 } from "react-icons/ci"
import {Tooltip} from "@nextui-org/react"
import { Button } from "@nextui-org/react";
import {  DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { toast } from "react-toastify"
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext.jsx'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { 
    Layout, 
    CardStyle, 
    Imagenes,
    BlocInformation, 
    axiosCliente, 
    Breadcrumb, 
    ModalComponte,  
    UpdateEstAmbienteFicha,
    PaginateTable,
    SearchComponent,
    VistaFichaTecnica,
    ExcelMaquinasMant,
    VistaPDF

} from "../../index.js"
import { useTranslation } from "react-i18next"
import { FaLeaf } from "react-icons/fa"


export const InfoMaquina = () => {
    const { t } = useTranslation()

  const [maquina, setInfoMaquina ] = useState([])
  const [maquinaMantenimientos, setMantenimientosMaquina ] = useState([])
  const {idMaquina} = useParams()
  const [mantenimientosFil, setMantenimientosFil] = useState([]);
  const navigate = useNavigate()


  const { rol } = useContext(AuthContext)
  const isAdmin = rol === "Administrador"


  /* estado para la img */


  const [estadoInfo ,setEstadoInfo] =useState(false)

    const buscarInfo = async ()=>{
        try{
            const response = await axiosCliente.get(`ficha/listarInfoEspecifica/${idMaquina}`)
            
            setInfoMaquina(response.data)
            setEstadoInfo(true)


        }catch(error){
            toast.error(error?.response?.data?.mensaje)
        }
    }

    const buscarInfoMantenimientos = async()=>{
        try{
            const mantenimientos  = await axiosCliente.get(`ficha/listarMantenimientosMaquina/${idMaquina}`)

            let dataMantenimientos = mantenimientos.data

            //se hace esto para poder abrir el pdf de los mantenimientos sin problema. 
            const mantenimientosAct = dataMantenimientos.map(({ mant_codigo_mantenimiento, ...contenido }) => ({
                codigo_mantenimiento: mant_codigo_mantenimiento, //aqui cambiamos el nombre de la clave
                ...contenido
            }))        


            setMantenimientosMaquina(mantenimientosAct)

        }catch(error){
            toast.error(error.response.data.mensaje)
        }
    }

    useEffect(()=>{
        buscarInfo()
        buscarInfoMantenimientos()

    }, [idMaquina])

    /* Configuracion de la tabla de mantenimientos */

    const columns = [
        t('codigo'),
        t('nombreSolic'),
        t('estado'),
        t('cost'),
        t('maintenance_type'),
        t('soporte'),
        "Pdf"
    ]




    const contentTable = maquinaMantenimientos.map((mantenimiento)=>({
        codigo_Mantenimiento: mantenimiento.codigo_mantenimiento,
        nombre_solicitante: mantenimiento.nombre_solicitante,
        mant_estado: mantenimiento.mant_estado,
        mant_costo_final: mantenimiento.mant_costo_final,
        tipo_mantenimiento: mantenimiento.tipo_mantenimiento,
        mant_ficha_soporte:mantenimiento.mant_ficha_soporte,
        Pdf: (
            <div className="flex space-x-2">
                <VistaPDF item={mantenimiento} />
            </div>
        )
    }))

    const buscarMantenimientos = (search)=>{
        const filtrarMantenimientos = contentTable.filter((mantenimiento)=>{
            return (
                mantenimiento.codigo_Mantenimiento.toLowerCase().includes(search.toLowerCase()) ||
                mantenimiento.mant_estado.toLowerCase().includes(search.toLowerCase()) ||
                mantenimiento.tipo_mantenimiento.toLowerCase().includes(search.toLowerCase()) ||
                mantenimiento.nombre_solicitante.toLowerCase().includes(search.toLowerCase()) 
            )
        })
        setMantenimientosFil(filtrarMantenimientos)
    }





    const handleEdit =()=>{
        navigate(`/listarFichaTecnica/${idMaquina}`)
    }


    
  return (
    <>
      <Layout titlePage={`${maquina.tipoEquipo}`}>
        <Breadcrumb pageName={`${maquina.tipoEquipo}`} />
        

        <div className=" flex justify-center flex-row flex-wrap pt-12 gap-8 mt-11 mb-20 pb-16  border-b-2 border-b-green-600 h-auto">
          <div className="w-[480px] flex-1 ">
            <div className=" shadow-sm border-1 border-green-600 rounded-lg shadow-green-500 p-3  gap-4 flex flex-row justify-end">
              <div className="w-full flex align-middle">
                <VistaFichaTecnica idMaquina={maquina.idFichas} />

                { isAdmin && (
                <Button
                color="warning"
                startContent={<PencilSquareIcon className="h-5 w-5" />}
                className="text-white ml-4"
                onClick={handleEdit}
                >
                  {t("editar")}
                </Button>
                )
                }

              </div>
              {
                estadoInfo && (
                  <div className="flex flex-row justify-end">
                    <QRCodeLink
                    imageUrl={`${import.meta.env.VITE_API_IMAGE}QRimagenes/${maquina.CodigoQR}`}
                    tooltipContent={t("codigoQR")}
                    icon={<BiQrScan />}
                  />
                
                  <QRCodeLink
                    imageUrl={`${import.meta.env.VITE_API_IMAGE}fichasTecnicas/FichasRespaldo/${maquina.ficha_respaldo}`}
                    tooltipContent={t("fichaRespaldo")}
                    icon={<CiSaveDown1 />}
                  />
                  </div>
                )
              }

            </div>

            <div className=" my-5 rounded-lg  shadow-sm  shadow-gray-500/50 p-4 ">
              <h3 className=" pl-10 text-lg border-b-1 border-b-green-600 pb-2 text-zinc-800  font-medium">
                {" "}
                {t("infoGeneral")}
              </h3>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <BlocInformation
                  titulo={t("fechaAdquisi")}
                  contenido={new Date(
                    maquina.fi_fecha_adquisicion
                  ).toLocaleDateString()}
                />
                <BlocInformation
                  titulo={t("serial")}
                  contenido={maquina.fi_serial}
                />
                <BlocInformation
                  titulo={t("placaSena")}
                  contenido={maquina.fi_placa_sena}
                />
                <BlocInformation
                  titulo={t("marca")}
                  contenido={maquina.fi_marca}
                />
                <BlocInformation
                  titulo={t("modelo")}
                  contenido={maquina.fi_modelo}
                />
                <BlocInformation
                  titulo={t("estado")}
                  contenido={maquina.fi_estado}
                />
              </div>
            </div>

            <div className=" my-5 rounded-lg  shadow-sm  shadow-gray-500/50 p-4 ">
              <h3 className="pl-10 text-lg border-b-1 border-b-green-600 pb-2 text-zinc-800  font-medium">
                {" "}
                {t("infoGarantia")}
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {/* <BlocInformation titulo ={t('fechaAdquisi')} contenido={new Date(maquina.fi_fecha_adquisicion).toLocaleDateString()} /> */}
                <BlocInformation
                  titulo={t("fechaInicioGaran")}
                  contenido={new Date(
                    maquina.fi_fecha_inicio_garantia
                  ).toLocaleDateString()}
                />
                <BlocInformation
                  titulo={t("fechaFinGarantia")}
                  contenido={new Date(
                    maquina.fi_fecha_fin_garantia
                  ).toLocaleDateString()}
                />
              </div>
              <div className=" w-full p-2 rounded-lg text-zinc-700 ">
                <p className=" mb-1 font-medium ">
                  {" "}
                  {t("fechaDescrGarantia")} :
                </p>
                <p>{maquina.fi_descripcion_garantia}</p>
              </div>
            </div>

            <div className=" my-5 rounded-lg  shadow-sm  shadow-gray-500/50 p-4 ">
              <h3 className="pl-10 text-lg border-b-1 border-b-green-600 pb-2 text-zinc-800  font-medium">
                {t("ubicacion")}
              </h3>

              <div className="overflow-x-auto mt-6 mb-3">
                <table className="min-w-full border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        <b>
                          {" "}
                          {t("sede")}{" "}
                          <span className="text-green-600 font-bold">&gt;</span>{" "}
                        </b>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        <b>
                          {" "}
                          {t("area")}{" "}
                          <span className="text-green-600 font-bold">&gt;</span>{" "}
                        </b>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        <b> {t("ambiente")} </b>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b border-gray-300">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {maquina.sede_nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {maquina.area_nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {maquina.sit_Nombre}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className=" flex-1 h-full">
            <CardStyle
              titleCard={` ${t("modelo")}: ${maquina.fi_modelo} `}
              subtitle={`${t("placaSena")}: ${maquina.fi_placa_sena}`}
            >
              <div className="w-full flex justify-center">
                <div className="w-[350px] flex flex-col justify-center  pb-2 ">
                  <figure className="w-full grid justify-items-center bg-white  max-h-[490px] overflow-hidden">
                    {
                      estadoInfo && (
                        <Imagenes rutaImg={`imagenes/ficha/${maquina.fi_imagen}`} />
                      )
                    }
                  </figure>
                </div>
              </div>

              <div className="my-8">
                <p>
                  <b> {t("descripcionEquipo")}:</b> <br />{" "}
                  {maquina.fi_descripcion}{" "}
                </p>
              </div>

              {
                isAdmin && (
                  <div className="flex flex-col gap-4 my-8 ">
                  <ModalComponte
                    buttonModal={`${t("actEstadoEquipo")}`}
                    tittleModal={`${t("actEstadoEquipo")}`}
                    componente={
                      <>
                        <UpdateEstAmbienteFicha
                          dataMaquina={maquina}
                          procesoAct={"EstadoFicha"}
                          buscarInfo={buscarInfo}
                        />
                      </>
                    }
                    variantButton={"bordered"}
                    colorButton={"warning"}
                  />
  
                  <ModalComponte
                    buttonModal={`${t("actAmbienteEquipo")}`}
                    tittleModal={`${t("actAmbienteEquipo")}`}
                    componente={
                      <>
                        <UpdateEstAmbienteFicha
                          dataMaquina={maquina}
                          procesoAct={"AmbienteFicha"}
                          buscarInfo={buscarInfo}
                        />
                      </>
                    }
                    variantButton={"bordered"}
                    colorButton={"warning"}
                  />
                  </div>
                )
              }

            </CardStyle>
          </div>
        </div>

        <div className=" block mx-7 mb-14 ">
          <h3 className="text-3xl font-medium mb-10 text-zinc-700  pb-2">
            {t("mantEquipo")}{" "}
          </h3>

          <div className="w-full flex justify-end px-9 ">
            <ExcelMaquinasMant
              infoMaquina={maquina}
              infoMantenimientos={maquinaMantenimientos}
            />
          </div>

          <div className=" mt-3 mb-10">
            <div className="mb-6">
              <SearchComponent
                label={`${t("codigo")}, ${t("nombreSolic")}, ${t(
                  "maintenance_type"
                )}, ${t("estado")}`}
                onSearch={buscarMantenimientos}
                className="w-full md:w-auto"
              />
            </div>

            <PaginateTable
              columns={columns}
              data={mantenimientosFil.map((mantenimiento) => ({
                ...mantenimiento,
                mant_ficha_soporte: (
                  <>
                    <Button
                      color="default"
                      startContent={
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      }
                      className="text-white"
                    ></Button>
                  </>
                ),
              }))}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}


// eslint-disable-next-line react/prop-types
const QRCodeLink = ({ imageUrl, tooltipContent, icon }) => {
  const [imageExists, setImageExists] = useState(false);

  useEffect(() => {
    const checkImageExistence = async () => {
      try {
        const response = await fetch(imageUrl, { method: "HEAD" })

        if (!response.ok) {
          setImageExists(false)
        }
        else {
          setImageExists(true)
        }

        //setImageExists(response.ok);
      } catch (error) {
        //console.error("Error checking image:", error);
        setImageExists(false)
      }
    };

    checkImageExistence();
  }, [imageUrl]);

  if (!imageExists) {
    return (
      <Tooltip content={tooltipContent}>
        <span className="text-3xl cursor-not-allowed text-zinc-400">
          {/* <BiQrScan /> */}
          {icon}
        </span>
      </Tooltip>
    );
  }

  return (
    <a href={imageUrl} target="_blank" download>
      <Tooltip content={tooltipContent}>
        <span className="text-3xl cursor-pointer text-zinc-800">
         {/*  <BiQrScan /> */}
         {icon}
        </span>
      </Tooltip>
    </a>
  );
};
