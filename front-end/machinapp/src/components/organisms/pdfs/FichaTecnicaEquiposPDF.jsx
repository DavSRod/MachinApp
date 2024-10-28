import { Document, Page, Text, View, StyleSheet, Image} from '@react-pdf/renderer';
import { useEffect, useState } from 'react';
import { axiosCliente } from '../../../service/api/axios'
import { useTranslation } from "react-i18next"




export const FichaTecnicaEquiposPDF = ({idMaquina}) => {
    
  const { t } = useTranslation()

    //informacio de la maquina 
    const [infoMaquina , setMaquinaGen] = useState({})

    //informacion de las variables.
    const [varEspec, setVarEspec] = useState([])
    const [varEspTecnicas, setVarEspTec ] = useState([])
    const [varSecciones, setVarSecciones ] = useState([])
    const [varObligatorias, setVarObligatorias] = useState({})
    

    useEffect(()=>{

        const informacionMaquina   = async () =>{
            try{
                const response = await axiosCliente.get(`ficha/listarUnica/${idMaquina}`)
                setMaquinaGen(response.data.infoFicha[0])
    
    
                //variables
    
                let variables = response.data.infoVar
    
                //separamos las clases de las variables para poder mapearlas
                setVarEspTec(variables?.filter(item => item.var_clase == "especificacionesTecnicas"))
                setVarSecciones(variables?.filter(item => item.var_clase == "seccion"))
                setVarEspec(variables?.filter(item => item.var_clase == "especifica")) 
    
                
                //para las variables obligatorias.
                let varObligatorias = variables?.filter(item => item.var_clase == "obligatoria")
    
                const objVarObligatorias = {}
    
                for(let i = 0; i< varObligatorias.length; i++){
                const variable = varObligatorias[i]
    
                objVarObligatorias[`idVar${variable.idVariable}`] ={
                    idDetalle: variable.idDetalle,
                    det_valor: variable.det_valor, 
                    var_nombre: variable.var_nombre,
                    var_descripcion: variable.var_descripcion,
                    var_tipoDato: variable.var_tipoDato
                }
    
                }
    
                setVarObligatorias(objVarObligatorias)

        
            }catch(error){
                console.error(error.response)
            }
        }
        informacionMaquina()
    }, [idMaquina])




    const styles = StyleSheet.create({
      /* basicos */
      page: {
        padding: 30,
        gap:10,
        flexDirection: 'column',
        backgroundColor: 'white',
      },
      container: {
        flexDirection: 'column', 
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 10,
        border: 1,
        padding: 5,
        borderRadius: 5,
        borderColor: '#dbe0e1'
      },
      containerTitulo : {
        width:'100%',
        paddingLeft: 12,
        paddingVertical: 4, 
        paddingRight: 3,
        fontSize: 16
      },
      textoTitulo:{
        color:'#16a34a',
        paddingBottom:'2',

      },
      /* seccion de informacion basica */
      containerContent :{
        flexDirection: 'row',
        width:'100%', 
        gap:9,
        borderTop:'2',
        borderTopColor:'#16a34a',
        paddingBottom:14
      },
      containerHijo:{
        flex: 1,
        paddingTop:20,
        paddingBottom:4,
        gap:3
      },
      contenedorInfo:{
        flexDirection: 'row',
        width:'100%',
        paddingVertical:4,
        paddingLeft:12,
        flexWrap: 'wrap',
      },
      tituloInfo:{
/*         fontSize: 14,
        color:'#303030' */
        fontSize:11,
        color: '#333',
      },
      respuestaInfo:{
/*         fontSize: 14,
        color: '#4e4e4e', */
        fontSize:11,
        color: '#333',
        flexWrap: 'wrap',     
        overflow: 'hidden', 
      },
      contentedorVarios:{
        flexDirection:'column',
        width:'100%'
      },
      contenedorDes:{
        flexDirection: 'column',
        width:'100%',
        paddingVertical:8,
        paddingHorizontal:12,
        paddingBottom:20,
        gap:2
      },
      contenedorRow:{
        flexDirection:'row'
      },
      subTituloSecc:{
        padding:5,
        fontSize: 14,
        color:'#292929',
        backgroundColor:'#f9f9f9'
      },
      contenedorImagen:{  
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       width: '100%',
       height: '245px',
       borderRadius: 6, // equivalente a rounded-md
       backgroundColor: '#FFFFFF', 
       paddingHorizontal:5,
       paddingVertical:5,
       border:1,
       borderColor:'#dcdcdc'
      },
      imagen:{
        height: '100%',
        width: '100%',
        objectFit: 'contain', // equivalente a object-contain
        borderRadius: 12 
      },
      garantiaDes:{
        borderLeft: 1,
        borderLeftColor: 'green',
        gap:5
      },

      /* Para las caracteristicas generales */
      contenidoCaractGen: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'start',
        padding: 10,
        paddingTop:25,
        gap:3,
        borderTop:'2',
        borderTopColor:'#16a34a',
      },
      infoCaractGen: {
        width: '24%', 
        marginBottom: 25,
        justifyContent: 'start',
        alignItems: 'start',
      },
      tituloCaractGen: {
        padding:4,
        paddingVertical:6,
        backgroundColor:'#eaeaea',
        fontSize:11,
        color: '#333',
        borderTopLeftRadius:4,
        borderTopRightRadius:4,
      },
      contCaractGen: {
        padding:4,
        paddingVertical:10,
        textAlign: 'left',
        flexWrap: 'wrap',
        fontSize:11,
        color: '#333',
        borderBottom:1,
        borderBottomColor:'#eaeaea',
        borderTopLeftRadius:4,
        borderTopRightRadius:4,
      },
      containerTituloSeccion: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        padding: 10, 
        backgroundColor: '#f0f0f0',
        borderRadius: 4
      },
      textoTituloSeccion: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#333',
      },
      textoDescripcion: {
          fontSize: 11,
          color: '#555',
          flex: 1, 
          textAlign: 'right',
          overflow: 'visible', 
          maxWidth: '80%', 
      },
      contenidoSecccion:{
        padding:5,
        marginTop:8,
        fontSize:11,
        color: '#333',
      }, 

      /* Especificaciones tecnicas */
      contentEspecTec:{
        width:'100%',
        borderTop:2, 
        borderTopColor: 'green',
        paddingVertical:10
      },

      /* Estilos para la tabla */
      table: {
        display: "table",
        width: "auto",
        margin: 10,
        borderStyle: "solid",
        borderWidth: 0,
        borderRadius: 5,
        
      },
      tableRow: {
        flexDirection: "row",
        backgroundColor: '#f9f9f9', 
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1, 
      },
      tableHeader: {
        backgroundColor: '#eaeaea', 
        fontWeight: 'bold',
        borderTopLeftRadius: 5, 
        borderTopRightRadius: 5,
      },
      tableCol35: {
        width: "35%",
        padding: 10, 
        borderBottomWidth: 0, // Eliminar el borde inferior
        flexWrap: 'wrap',
      },
      tableCol65: {
        width: "65%",
        padding: 10,
        borderBottomWidth: 0,
        flexWrap: 'wrap',
        maxWidth:'100%'
      },
      tableCell: {
        fontSize: 11,
        textAlign: 'left',
        color: '#333', 
        flexWrap: 'wrap',
      },
      tableCellRight: {
        fontSize: 11,
        textAlign: 'left',
        color: '#333',
        flexWrap: 'wrap',
      },
      tableRowBasico:{
        flexDirection: "row",
        backgroundColor: '#f9f9f9', 
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1, 
        borderRadius:4
      },
      tableCol35Basico:{
        backgroundColor:'#eaeaea',
        width: "35%",
        padding: 10, 
        flexWrap: 'wrap',
        borderBottomLeftRadius: 4,
        borderTopLeftRadius:4 
      } ,
      gapTable :{
        gap:2
      },
      paddignTopMa:{
        paddingTop:30,
      },
      
      /* Para la descripcion del equipo y garantia */
      tituloVarios:{
        fontSize:13,
        color:'#333',
      },
      contSecciones:{
        gap:5
      }, 
      contDescripcion:{
        padding:5,
        marginBottom:5
      },
      tituloDesccripcion:{
        color:'#374151',
        borderBottom:1,
        borderColor: "#374151",
        fontSize: 13,
        paddingBottom:4
      },
      contGarantia: {
        flexDirection: 'row',  // Coloca los hijos en una fila
        width: '100%',         // Hace que el contenedor ocupe todo el ancho disponible
        fontSize:11,
        color:"#333",
        marginVertical:20,
      },
      contFechaGarantia: {
        flex: 1,               // Hace que cada hijo ocupe la mitad del espacio disponible
        flexDirection:'row',
        gap:4,
        justifyContent:'center'
      },



      /* Cabecera */
  containerCa: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 'auto',
    border: 1,
    borderRadius: 5,
    borderColor: '#e0e0e0'
  },
  logoContainerCa: {
    flexShrink: 0,
    height: 64, // Equivalente a "h-16"
    width: '33.33%', // Equivalente a "w-1/3"
    borderRight: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor:"#e0e0e0"
  },
  logo: {
    width:70,
    height: 70,
  },
  titleContainerCa: {
    flexGrow: 1,
    textAlign: 'center',
    borderRight:1,
    borderColor:"#e0e0e0",
    paddingHorizontal: 6,
    height: 64, // Equivalente a "h-16"
    justifyContent: 'center',
    alignItems: 'center',

  },
  titleTextCa: {
    textAlign: 'center',
    fontSize:15,
    marginBottom: 10,
    color:'#333'
  },
  subtitleCa:{
    textAlign: 'center',
    fontSize:11,
    color:'#333'
  },
  descriptionContainerCa: {
    flexShrink: 0,
    width: '33.33%', // Equivalente a "w-1/3"
    height: 64, // Equivalente a "h-16"
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  descriptionTextCa: {
    textAlign: 'center',
    overflow: 'hidden', // Equivalente a "overflow-hidden"
    fontSize:11,
    color:'#333'
  },
  textContainerCa:{
    textAlign: 'center',
    marginBottom:6
  }, 
  dateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    textAlign: 'center',
    fontSize: 11,  // Puedes ajustar el tamaño de la fuente si es necesario
    color:'#333'
  },

  /* ubicacion  */

  containerUb: {
    flexDirection: 'row',  // Coloca los elementos en fila
    border: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 20
  },
  boxUb: {
    flex: 1,  // Cada contenedor ocupa el mismo espacio
    borderRight: 1, 
    borderColor: '#e0e0e0',
    alignItems: 'center',  // Alineación centrada del contenido
    justifyContent: 'center',
    paddingVertical: 7 ,
    paddingHorizontal: 4 
  },
  boxUbN:{
    flex: 1,  // Cada contenedor ocupa el mismo espacio
    alignItems: 'center',  // Alineación centrada del contenido
    justifyContent: 'center',
    paddingVertical:7,
    paddingHorizontal: 4 
  },
  titleUb: {
    fontSize:13,
    color: '#333',
    marginBottom: 6
  },
  contentUb:{
    fontSize: 11,
    color: '#333'
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 8,
    color: 'gray'
  },
  contenidoGen:{
    marginBottom: 20
  }


    })


    return (
      <>
        <Document>
          <Page size="A4" style={styles.page}>

            <View styles={styles.contenidoGen}>

            {/* Cabecera */}
            <View style={styles.containerCa}>
              <View style={styles.logoContainerCa}>
                <View style={styles.contLogo}>
                  <Image
                    src="/logoSenaNaranja.png"
                    style={styles.logo}
                    resizeMode="contain"
                    alt="logo-sena"
                  />
                </View>
              </View>

              <View style={styles.titleContainerCa}>
                <Text  style={styles.titleTextCa}>{infoMaquina.ti_fi_nombre}</Text>
                <Text style={styles.subtitleCa}>{t('fichaTecnica')}</Text>
              </View>
              
              <View style={styles.descriptionContainerCa}>
                <View style={styles.textContainerCa}>
                  <Text style={styles.descriptionTextCa}>Centro de gestion y desarrollo Sostenible SurColombiano
                  </Text>
                </View>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>
                    {new Date().toLocaleDateString()} {/* Aquí puedes usar la fecha que necesites */}
                  </Text>
                </View>
              </View>

            </View>

              {/* Ubicacion */}
            <View style={styles.containerUb}>
              <View style={styles.boxUb}>
                <Text style={styles.titleUb}>{t('region')}</Text>
                <Text style={styles.contentUb}>{infoMaquina.sede_municipio}, {infoMaquina.sede_regional}</Text>
              </View>
              <View style={styles.boxUb}>
                <Text style={styles.titleUb}>{t('sedeFormacion')}</Text>
                <Text style={styles.contentUb}>{infoMaquina.sede_nombre}</Text>
              </View>
              <View style={styles.boxUb}>
                <Text style={styles.titleUb}>{t('unidadProduct')}</Text>
                <Text style={styles.contentUb}>{infoMaquina.area_nombre}</Text>
              </View>
              <View style={styles.boxUbN}>
                <Text style={styles.titleUb}>{t('aula')}</Text>
                <Text style={styles.contentUb}>{infoMaquina.sit_nombre}</Text>
              </View>
            </View>


            <View style={styles.container}> 
              <View style={styles.containerTitulo}>
                <Text style={styles.textoTitulo}>{t('infoBasica')}</Text>
              </View>

              <View style={styles.containerContent}>
                <View style={styles.containerHijo}>
                  <View style={[styles.table, styles.gapTable]}>
                    
                    <View  style={styles.tableRowBasico}>
                      <View style={styles.tableCol35Basico}>
                        <Text style={styles.tableCell}>{t('placaSena')}: </Text>
                      </View>
                      <View style={styles.tableCol65}>
                        <Text style={styles.tableCellRight}>{infoMaquina.fi_placa_sena}</Text>
                      </View>
                    </View>

                    <View  style={styles.tableRowBasico}>
                      <View style={styles.tableCol35Basico}>
                        <Text style={styles.tableCell}>{t('serial')}: </Text>
                      </View>
                      <View style={styles.tableCol65}>
                        <Text style={styles.tableCellRight}>{varObligatorias?.idVar2?.det_valor}</Text>
                      </View>
                    </View>

                    <View  style={styles.tableRowBasico}>
                      <View style={styles.tableCol35Basico}>
                        <Text style={styles.tableCell}>{t('precio')}: </Text>
                      </View>
                      <View style={styles.tableCol65}>
                        <Text style={styles.tableCellRight}>{varObligatorias?.idVar9?.det_valor}</Text>
                      </View>
                    </View>

                    <View  style={styles.tableRowBasico}>
                      <View style={styles.tableCol35Basico}>
                        <Text style={styles.tableCell}>{t('marca')}: </Text>
                      </View>
                      <View style={styles.tableCol65}>
                        <Text style={styles.tableCellRight}>{varObligatorias?.idVar7?.det_valor}</Text>
                      </View>
                    </View>

                    <View  style={styles.tableRowBasico}>
                      <View style={styles.tableCol35Basico}>
                        <Text style={styles.tableCell}>{t('modelo')}: </Text>
                      </View>
                      <View style={styles.tableCol65}>
                        <Text style={styles.tableCellRight}>{varObligatorias?.idVar8?.det_valor}</Text>
                      </View>
                    </View>

                    <View  style={styles.tableRowBasico}>
                      <View style={styles.tableCol35Basico}>
                        <Text style={styles.tableCell}>{t('fechaAdquisi')}: </Text>
                      </View>
                      <View style={styles.tableCol65}>
                        <Text style={styles.tableCellRight}>{varObligatorias?.idVar1?.det_valor}</Text>
                      </View>
                    </View>

                  </View>


                </View>

                <View style={[styles.containerHijo , styles.paddignTopMa]}>
                  <View style={styles.contenedorImagen}>
                    
                    <Image style={styles.imagen}   src={`${import.meta.env.VITE_API_IMAGE}imagenes/ficha/${infoMaquina.fi_imagen}`} />
                  </View> 
                </View>
              </View>


              {/* Descripcion de equipo */}
              <View style={styles.contDescripcion}>
                <View>
                  <Text style={ styles.tituloDesccripcion }>{t('descripEquipo')}</Text>
                </View>
                <View style={styles.contenidoSecccion}>
                  <Text>{varObligatorias?.idVar6?.det_valor}</Text>
                </View>
              </View>

              <View style={styles.contDescripcion}>
                <View>
                  <Text style={ styles.tituloDesccripcion }>{t('descripGarantia')}</Text>
                </View>
                <View style={styles.contenidoSecccion}>
                  <Text>{varObligatorias?.idVar5?.det_valor}</Text>
                </View>

                <View style={styles.contGarantia}>
                  <View style={styles.contFechaGarantia}>
                    <Text>{t('inicioGarantia')}: </Text>
                    <Text>{varObligatorias?.idVar3?.det_valor}</Text>
                  </View>
                  <View style={styles.contFechaGarantia}>
                    <Text>{t('finGarantia')}: </Text>
                    <Text>{varObligatorias?.idVar4?.det_valor}</Text>
                  </View>
                </View>
              </View>
            </View>


            {/* para las caraceristicas generales */}
            {
              varEspec.length>0 ? (
                <View style={styles.container}> 
                <View style={styles.containerTitulo}>
                  <Text style={styles.textoTitulo}>{t('carGenerales')}</Text>
                </View>

                <View style={styles.contenidoCaractGen}>
                  {
                    varEspec.map((varEspeci, index)=>(
                      <View key={index} style={styles.infoCaractGen}>
                        <Text style={styles.tituloCaractGen}>{varEspeci.var_nombre}</Text>
                        <Text style={styles.contCaractGen}>{varEspeci.det_valor}</Text>
                      </View>
                    ))
                  }
                </View>


              </View>
              ):(<></>)
            }

            {/* para especificaciones tecnicas */}
            
            {
              varEspTecnicas.length>0 ? (
              <View style={styles.container}> 
                <View style={styles.containerTitulo}>
                  <Text style={styles.textoTitulo}>{t('especTecnicas')}</Text>
                </View>

                <View style={styles.contentEspecTec}>
                  <View style={styles.table}>
                    {/*  encabezados */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <View style={styles.tableCol35}>
                        <Text style={styles.tableCell}>{t('nombre')}</Text>
                      </View>
                      <View style={styles.tableCol65}>
                        <Text style={styles.tableCell}>{t('valor')}</Text>
                      </View>
                    </View>

                    {/* contenido Tabla*/}

                    {
                      varEspTecnicas.map((varTecnica, index)=>(
                        <View key={index} style={styles.tableRow}>
                        <View style={styles.tableCol35}>
                          <Text style={styles.tableCell}>{varTecnica.var_nombre}</Text>
                        </View>
                        <View style={styles.tableCol65}>
                          <Text style={styles.tableCellRight}>{varTecnica.det_valor}</Text>
                        </View>
                      </View>
                      ))
                    }



                  </View>
                </View>
              </View>
              ):(<></>)
            }

            {/* para secciones */}
            <View style={styles.contSecciones}>
            {
              varSecciones.length > 0 ? 
              
              varSecciones.map((varseccion, index)=>(

                <View key={index} style={styles.container}> 
                  <View style={styles.containerTituloSeccion}>
                    <Text style={styles.textoTituloSeccion}>{varseccion.var_nombre}</Text>
                    <Text style={styles.textoDescripcion}>{varseccion.var_descripcion}</Text>
                  </View>
                  <View style={styles.contenidoSecccion}>
                    <Text>{varseccion.det_valor}</Text>
                  </View>
                </View>
              ))
              :(<></>)
            }       
            </View>   
            </View>

          </Page>
        </Document>
      </>
    )
}