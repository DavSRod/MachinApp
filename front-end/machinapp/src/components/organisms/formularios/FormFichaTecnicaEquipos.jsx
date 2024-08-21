import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { axiosCliente } from "../../../service/api/axios.js"
import { useNavigate } from 'react-router-dom'

import {Button} from "@nextui-org/button";
import { Image } from "@nextui-org/react"

import { multiFormData } from "../../../utils/formData.js"
// -> multiFormData => para poder enviar archivos como imagenes al sevidor

// componentes
import {InputForm,TextAreaComponent, ButtonNext, SelectComponent  } from "../../../index.js"


export const FormFichaTecnica = () => {

  const navigate = useNavigate()



  const [ambientes, setAmbientes] = useState([])
  const [tipoEquipo, setTipoEquipo] = useState([])
  
  //funcion para mostrar el formulario
  const [mostrarFormulario, setMostrarFormulario ] = useState(false)

  //arrais de las variables
  const [varObligatorias, setVarObligatorias] = useState({})
  const [varEspTecnicas, setVarEspTecnicas] = useState([])
  const [varSecciones, setVarSecciones] = useState([])
  const [varEspecificas, setVarEspecificas] = useState([])



  //fechas 
/*   const [fechaAdquisicion, setDateAduisicion] = useState("")
  const [fechaInicioGarantia, setInicioGarantia] = useState("")
  const [fechaFinGarantia, setFinGarantia] = useState("") */
  
  // previsua// hookslizar una imagen
  const [previewImagen, setPreviewImagen] = useState(null)

  //documentos
  const [imagen, setImagen] = useState(null)
  const [fichaRespaldo, setFicha] = useState(null)

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues
  } = useForm();

  //const navigate = useNavigate()


  // poder enviar los datos al servidor por metodo POST
  const handleSubmitData = async (data) => {


    //data.variables trae el fk de la variable en el name del input, y el valor es el valor del detalle

    const transformedArray = Object.entries(data.variables).map(([key, value]) => ({   //asi ordenamos los datos y contruimos un array de objetos
      detFkVariable: key,             // Incluye la fk de la variable
      detValor: value  // Incluye el valor 
    }))

    console.log(transformedArray)


    //objeto para registrar la ficha con los datos fijos del formulario
    const dataFicha = {
      fk_tipo_ficha:data.tipo_equipo,
      fiImagen:imagen,
      fk_sitio: data.ambiente,
      fiEstado: "operacion",
      fiTecnica:fichaRespaldo,
      placaSena:data.placaSena
    }



    try{
      
      //registramos la ficha tecnica
      const response = await  multiFormData("http://localhost:3000/ficha/registrar", dataFicha, "POST" )
    
      const idFicha = response.data.id

      //objeto para registrar todas las variables del formulario
      const dataVariables = {
        idFicha:idFicha,
        detalles:transformedArray
      }

      //empezamos a registrar las variables
      const responseDet = await axiosCliente.post('detalle/registrarDetalles', dataVariables)

      navigate(`/infoMaquina/${idFicha}`)


    }catch(error){
      console.error(error.response)
    }

    console.log(dataFicha)


    //creamos un objeto y organizamos con la informacion que traemos en el data.-- esto por q las claves del formulario y lo que acepta la api son diferentes

/*     const dataFicha = {
      placaSena: data.Placa,
      serial: data.Serial,
      fechaAdquisicion: fechaAdquisicion, 
      fechaInicioGarantia: fechaInicioGarantia, 
      fechaFinGarantia: fechaFinGarantia, 
      descipcionGarantia: data.descripcionGarantia,
      descripcion: data.DescripcionEquipo,
      fiEstado: "operacion",
      fk_sitio: data.ambiente, 
      fk_tipo_ficha: data.tipo_equipo,
      marca: data.Marca, 
      modelo: data.Modelo,
      fiImagen: imagen,
      fiTecnica:fichaRespaldo,
      precio: data.Precio
    }

    console.log(dataFicha)

    try{
      const response = await  multiFormData("http://localhost:3000/ficha/registrar",dataFicha, "POST" )
    
      const id = response.data.id

      navigate(`/infoMaquina/${id}`)
    }
    catch(e){
      alert("Error al registrar ficha tecnica")
      console.log(e)
    } */


  }

  // tomar la imagen del input file, para poder visualizarla y enviarla al back-end
  const handleFileUpload = (event) => {
    const archivo = event.target.files[0]

    if (archivo) {
      const previewUrl = URL.createObjectURL(archivo);
      setPreviewImagen(previewUrl)
      setImagen(archivo)
    } else {
      setPreviewImagen(null)
    }

  }

  //cargar ficha tecnica de respaldo
  const cargardocumento = (event) =>{
    setFicha(event.target.files[0])
  }

  useEffect(() => {
    const fechtData = async () => {
      try {
        const [ambientesRes, tipoMaquinaRes] = await Promise.all([
          axiosCliente.get("sitio/listarsitio"),
          axiosCliente.get("tipoFicha/listar")
        ])

        const ambientesArray = ambientesRes.data.resultadoSitio.map((item) => ({
          id: item.idAmbientes,
          valor: item.area_nombre,
        }));

        const tipoEquipoArray = tipoMaquinaRes.data.map((item) => ({
          id: item.idTipo_ficha,
          valor: item.ti_fi_nombre,
        }));

        setAmbientes(ambientesArray)
        setTipoEquipo(tipoEquipoArray)
      } catch (error) {
        console.error(error.response)
      }
    }
    fechtData();
  }, []);

  const tipoFicha = async() =>{
    
    let idTipoFicha = getValues("tipo_equipo") //traemos solo el valor del input con ese nombre

    if(idTipoFicha != ""){
      
      try{

        const response = await axiosCliente.get(`variable/listarVars/${idTipoFicha}`)

        //traemos todas las variables de ese tipo de ficha
        let variables = response.data.respuesta

        //Separamos las variables en diferentes arrais dependiendo de la clase. 
        setVarEspTecnicas(variables?.filter(item => item.var_clase == "especificacionesTecnicas"))
        setVarSecciones(variables?.filter(item => item.var_clase == "seccion"))
        setVarEspecificas(variables?.filter(item => item.var_clase == "especifica"))   
        

        //para las que son obligatorias como se muestran los inpust ya creados, entonces creamos un objeto con estas variables

        let varObligatoriasArr = variables?.filter(item => item.var_clase == "obligatoria")
        
        const varObligatoriasObj = {}

        //recorre el array y crea objetos destro del objeto definido anteriormente, esto para no tener que recurrir al orden en que se encuentran en el array.

        for(let i =0; i<varObligatoriasArr.length; i++){

          const variable = varObligatoriasArr[i]   

          varObligatoriasObj[ `idVar${variable.idVariable}`] = {
            idVariable: variable.idVariable,
            var_tipoDato: variable.var_tipoDato,
            var_nombre: variable.var_nombre
          }
        }


        setVarObligatorias(varObligatoriasObj)

        console.log(varObligatoriasArr)
        console.log(varObligatoriasObj)
      

        setMostrarFormulario(true)

      }catch(error){
        console.error(error.response)
      }
    }
    else{
      alert("Seleccionar un tipo de ficha")
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(handleSubmitData)}
      >
        <div className="flex flex-row items-center justify-around mb-20 border-b-2 border-b-green-600 pb-10">
          <label className="flex flex-row items-center gap-4"> Seleccionar un tipo de ficha
            <SelectComponent
                options={tipoEquipo}
                name="tipo_equipo"
                placeholder="Seleccione una opción"
                valueKey="id"
                textKey="valor"
                register={register}
            />
          </label>

          <Button  onClick={tipoFicha}  color="success">
            Siguiente 
          </Button>
          
        </div>
        {
          mostrarFormulario &&(
          <div  className="bg-white border rounded-lg md:p-14 w-full sm:w-11/12  mx-auto ">
            
            {/* cabezera */}
            <div className="flex flex-row h-auto items-center">
              <figure className="flex-shrink-0 h-16 w-1/3 border flex justify-center items-center">
                <Image
                  src="logoSenaNaranja.png"
                  className="h-16 w-full object-contain"
                  alt="logo-sena"
                />
              </figure>
              <div className="flex-grow text-center border px-4 h-16 w-1/3 flex items-center justify-center">
                Ficha Técnica
              </div>
              <div className="flex-shrink-0 w-1/3 h-16 border flex items-center">
                <p className="overflow-hidden overflow-ellipsis text-center">
                  Centro de Gestión y Desarrollo Sostenible Surcolombiano
                </p>
              </div>
            </div>

            {/* Contenido */}
            <div>
              <div className=" flex flex-col sm:flex-row mt-5 w-full "> {/* sm:h-96 */}

                <div className="w-full sm:w-2/4 p-2">
                  <h3 className="w-full text-gray-900 text-2xl pl-7 my-5" >Información Básica</h3>
                  <div className="grid grid-cols-2 gap-3 ">
                    

                    <InputForm
                      errors={errors}
                      register={register}
                      tipo={"text"}
                      name={"placaSena"}
                      text={"Placa SENA "}
                    />

                    {/* serial */}
                    <InputForm
                      errors={errors}
                      register={register}
                      tipo={`${varObligatorias.idVar2.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                      name={`variables.${varObligatorias.idVar2.idVariable}`}
                      text={`${varObligatorias.idVar2.var_nombre}`}
                    />

                    {/* precio */}
                    <InputForm
                      errors={errors}
                      register={register}
                      tipo={`${varObligatorias.idVar9.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                      name={`variables.${varObligatorias.idVar9.idVariable}`}
                      text={`${varObligatorias.idVar9.var_nombre}`}
                    />


                    {/* Marca */}
                    <InputForm
                      errors={errors}
                      register={register}
                      tipo={`${varObligatorias.idVar7.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                      name={`variables.${varObligatorias.idVar7.idVariable}`}
                      text={`${varObligatorias.idVar7.var_nombre}`}
                    />
                    
                    
                    {/* Modelo */}
                    <InputForm
                      errors={errors}
                      register={register}
                      tipo={`${varObligatorias.idVar8.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                      name={`variables.${varObligatorias.idVar8.idVariable}`}
                      text={`${varObligatorias.idVar8.var_nombre}`}
                    />

                    {/* fecha adquicicion */}
                    <InputForm
                      errors={errors}
                      register={register}
                      tipo={`${varObligatorias.idVar1.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                      name={`variables.${varObligatorias.idVar1.idVariable}`}  //le ponemos variables para que nos agrupe toda la informacion de los input en ese espacio del formulario
                      text={`${varObligatorias.idVar1.var_nombre}`}
                    />
                    

                  </div>
                  <div className="w-full mt-4">
                  <SelectComponent
                      options={ambientes}
                      name="ambiente"
                      placeholder="Ambiente"
                      valueKey="id"
                      textKey="valor"
                      register={register}
                      label="Ambiente"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-2/4 p-2 ml-11">
                  <div className="flex items-center justify-center w-full h-[284px] bg-gray-300 rounded sm:w-full dark:bg-gray-700 mt-24">
                    <img
                      className="h-full w-full object-contain rounded"
                      alt=""
                      src={previewImagen}
                    />
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="appearance-none  w-full py-2 px-4 mt-6 rounded-lg bg-gray-200 focus:outline-none focus:bg-white focus:border-blue-500  "
                  />
                </div>
                
              </div>


              <div className="flex items-center justify-center flex-row gap-4 p-4 border-b-1 border-t-1 border-b-green-600  border-t-green-600 rounded-lg  my-14">
                <label className="text-gray-700 ">
                  Subir ficha técnica de respaldo (opcional):
                </label>
                <input
                  type="file"
                  onChange={cargardocumento}
                  className="appearance-none py-2 px-4 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* recorremos todas las variables de especificas */}              {/* especificas(otros) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                {
                  varEspecificas.map((varEspec) =>(
                    <div key={varEspec.idVariable}>
                    <InputForm
                      errors={errors}
                      register={register}
                      tipo={`${varEspec.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                      name={`variables.${varEspec.idVariable}`}  //le ponemos variables para que nos agrupe toda la informacion de los input en ese espacio del formulario
                      text={`${varEspec.var_nombre}`}
                    />
                    </div>
                  ))
                }
              </div>



              <div className="w-full my-5">
                <label > Descripción del equipo</label>
                <TextAreaComponent
                  errors={errors}
                  register={register}
                  name={`variables.${varObligatorias.idVar6.idVariable}`}
                  descripcion={'Descripción general del equipo'}
                />
              </div>

              {/* Especificaciones tecnicas */}
              <div className="my-14">
                <h3 className="w-full text-gray-900 text-2xl pl-7 my-5" >Especificaciones técnicas</h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 text-left font-medium text-gray-700 w-1/4 border-b border-gray-300">Nombre</th>
                        <th className="py-2 px-4 text-left font-medium text-gray-700 border-b border-gray-300">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {varEspTecnicas.map((varEspTecnica ) => (
                        <tr key={varEspTecnica.idVariable} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b border-gray-300 w-1/4">{varEspTecnica.var_nombre}</td>
                          <td className="py-2 px-4 border-b border-gray-300">
                            <InputForm
                              errors={errors}
                              register={register}
                              tipo={`${varEspTecnica.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                              name={`variables.${varEspTecnica.idVariable}`}  //le ponemos variables para que nos agrupe toda la informacion de los input en ese espacio del formulario
                              text={`${varEspTecnica.var_nombre}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>


              {/* GARANTIA */}
              <div>
                <h3 className="w-full text-gray-900 text-2xl pl-7 my-5" >Informacion de Garantía</h3>
                <div className=" flex flex-col sm:flex-row mt-5 w-full ">

                  <div className="w-full sm:w-2/4 p-2  items-center">

                    <div className="my-3">
                      <InputForm
                        errors={errors}
                        register={register}
                        tipo={`${varObligatorias.idVar3.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                        name={`variables.${varObligatorias.idVar3.idVariable}`}  //le ponemos variables para que nos agrupe toda la informacion de los input en ese espacio del formulario
                        text={`${varObligatorias.idVar3.var_nombre}`}
                      />
                    </div>
                    <div className="my-3">
                      <InputForm
                        errors={errors}
                        register={register}
                        tipo={`${varObligatorias.idVar4.var_tipoDato}`}   // aca accedemos al objeto del que queremos traer la informacion
                        name={`variables.${varObligatorias.idVar4.idVariable}`}  //le ponemos variables para que nos agrupe toda la informacion de los input en ese espacio del formulario
                        text={`${varObligatorias.idVar4.var_nombre}`}
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-2/4 p-2 flex mt-9">
                    <TextAreaComponent
                    errors = {errors}
                    register={register}
                    name={`variables.${varObligatorias.idVar5.idVariable}`}
                    descripcion={'Descripción de la garantía'}
                    />
                  </div>
                </div>
              </div>



              {/* Secciones */}
              <div>
                <h3 className="w-full text-gray-900 text-2xl pl-7 my-5" >Información relevante</h3>
                
                <div>
                  {
                    varSecciones.map((varSeccion)=>(

<div className="overflow-x-auto my-14" key={varSeccion.idVariable}>
  <table className="min-w-full  ">
    <tbody>
      <tr>
        <td className="py-2 px-4 flex justify-between items-center border border-gray-300 rounded-lg">
          <span className="font-medium text-lg">{varSeccion.var_nombre}</span>
          <span className="text-sm text-gray-500">{varSeccion.var_descripcion}</span>
        </td>
      </tr>
      <tr>
        <td className="py-2 ">
          <TextAreaComponent
            errors={errors}
            register={register}
            name={`variables.${varSeccion.idVariable}`}
            descripcion={`Descripcion ${varSeccion.var_nombre}`}
          />
        </td>
      </tr>
    </tbody>
  </table>
</div>

                    ))
                  }
                </div>

              </div>


            </div>
            <ButtonNext color="primary" text="Registrar ficha técnica" type="submit"/>
          </div>
          )
        }

      </form>
    </>
  )
}