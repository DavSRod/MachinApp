import { ModalComponte } from "../../molecules/index.js"
import { Button } from "@nextui-org/react"
import { PencilSquareIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { PDFDownloadLink,PDFViewer } from '@react-pdf/renderer';
import {FichaTecnicaEquiposPDF} from "../../index.js"
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next"

export const VistaFichaTecnica = ({idMaquina})=>{
    
    const navigate = useNavigate()
    const { t } = useTranslation()


    const handleEdit =()=>{
        navigate(`/listarFichaTecnica/${idMaquina}`)
    }

    const componenteModal = (
        <div className="flex flex-col space-y-4">
        <div className="flex justify-end space-x-2">
            <Button
            color="warning"
            startContent={<PencilSquareIcon className="h-5 w-5" />}
            className="text-white"
            onClick={handleEdit}
            >
            {t('editar')}
            </Button>

            <PDFDownloadLink
                document={<FichaTecnicaEquiposPDF idMaquina = {idMaquina}/>}
                fileName={`ficha-${idMaquina}.pdf`}
            >

                <Button
                color="success"
                startContent={<DocumentArrowDownIcon className="h-5 w-5" />}
                className="text-white"
                >
                {t('descargar_pdf')}
                </Button>

            </PDFDownloadLink>

        </div>
        <div style={{ height: '70vh', width: '100%' }}>
            <PDFViewer style={{ width: "100%", height: "100%" }}>
                <FichaTecnicaEquiposPDF idMaquina = {idMaquina}/>
            </PDFViewer>
        </div>
        </div>
    )
    
    return (
        <>
            <ModalComponte
            buttonModal={t('fichaTecnica')}
            tittleModal={t('vistaPdf')}
            componente={componenteModal}
            size="5xl"
            variantButton="shadow"
            colorButton="success"
            classNames= "text-white" 
            />
        </>
    )
}