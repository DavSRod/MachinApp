import {
  useGlobalData,
  ModalComponte,
  FormRol,
  FormUser,
  PaginateTable,
  SearchComponent,
  ButtonNext,
  Icons,
  V,
} from "../../../../index.js";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const ListarUsuarios = () => {
  const { dataUser, roles } = useGlobalData();
  const [data, setData] = useState(true);

  const [filteredData, setFilteredData] = useState([]);
  const { t } = useTranslation();

  const navigate = useNavigate();

  // definimos las columnas para la tabla
  const columns = [
    t("nombre"),
    t("apellidos"),
    t("correo"),
    t("tipo_documento"),
    t("numero_documento"),
    "Rol",
    t("acciones"),
  ];

  const capitalizarPrimeraLetra = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // columnas para roles []
  const ColumnsRoles = ["id", "Rol", t("descripcion")];



  // definimos las filas: nota => hay que tener en cuanta que tanto las columnas y filas deben ser igual en numero
  // si envio 4 columnas debo tambien de enviarle 4 filas, de lo contrario nos arrojara un error
  const newArrayDataUser = dataUser.map((item) => ({
    nombre: capitalizarPrimeraLetra(item.us_nombre),
    apellidos: capitalizarPrimeraLetra(item.us_apellidos),
    correo: item.us_correo,
    tipo_documento: capitalizarPrimeraLetra(item.us_tipo_documento),
    numero_documento: item.us_numero_documento,
    rol:  capitalizarPrimeraLetra(item.rol_nombre),
  }));

  const handleEdit = (id) => {
    const resultadoUsuario = dataUser.find(
      (persona) => persona.us_numero_documento === id
    );

    // Navega a la ruta deseada con la información del usuario
    navigate("/panelcontrol/user", { state: { resultadoUsuario } });
  };

  // esta funcion mustra en la tabla la infomacion de los usuarios
  const handleDataUser = () => {
    setData(true);
  };

  // muestra la informacion de los roles
  const handleDataRol = () => {
    setData(false);
  };

  // filtro para poder buscar a los usuarios
  const handleSearchUsuario = (search) => {
    const filtered = newArrayDataUser.filter((usuario) => {
      return (
        usuario.numero_documento.toLowerCase().includes(search.toLowerCase()) ||
        usuario.nombre.toLowerCase().includes(search.toLowerCase()) ||
        usuario.correo.toLowerCase().includes(search.toLowerCase()) ||
        usuario.rol.toLowerCase().includes(search.toLowerCase())
      );
    });

    setFilteredData(filtered);
  };

  return (
    <>
      <div className="min-h-screen p-6 flex flex-col gap-8 ">
        {/* Contenedor de la tabla */}
        <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between p-4 items-center bg-gray-100 border-b space-y-4 md:space-y-0">
            <SearchComponent
              label={`${t("nombre")}, ${t("correo")}, ${t("numero_documento")}`}
              onSearch={handleSearchUsuario}
              className="w-full md:w-auto"
            />
            <div className="flex gap-2 flex-wrap justify-center md:justify-end w-full md:w-auto">
              <ButtonNext
                type="submit"
                variant="bordered"
                color="success"
                onClick={handleDataUser}
                startContent={<Icons icon={V.UserGroupIcon} />}
              >
                {" "}
                {t("usuarios")}
              </ButtonNext>
              <ButtonNext
                startContent={<Icons icon={V.ShieldCheckIcon} />}
                variant="bordered"
                color="success"
                onClick={handleDataRol}
                className="text-xs md:text-sm"
              >
                Roles
              </ButtonNext>
            </div>
            <ModalComponte
              buttonModal={
                data ? t("usuarios_añadir_nuevo") : t("rol_añadir_nuevo")
              }
              componente={data ? <FormUser /> : <FormRol />}
              tittleModal={data ? t("registrar_usuario") : t("registrar_rol")}
              size={""}
              className="w-full md:w-auto"
            />
          </div>

          {/* Tabla Paginada */}
          <div className="w-full overflow-x-scroll">
            <span className="text-gray-600 text-sm md:text-base">
              {data ? (
                <>
                  <span className="flex">
                    <Icons icon={V.UserCircleIcon} /> {t("usuarios")} :
                    {" " + filteredData.length}
                  </span>
                </>
              ) : (
                `Total de roles en el sistema: ${roles.length}`
              )}
            </span>
            <div className="w-full min-w-max">
              <PaginateTable
                columns={data ? columns : ColumnsRoles}
                data={
                  data
                    ? filteredData.map((row) => ({
                        ...row,
                        acciones: (
                          <>
                            <ButtonNext
                              color={"warning"}
                              variant={"faded"}
                              type="submit"
                              isIconOnly={true}
                              onClick={() => handleEdit(row.numero_documento)}
                            >
                              {" "}
                              <Icons icon={V.PencilIcon} />
                            </ButtonNext>
                          </>
                        ),
                      }))
                    :roles
                }
                className="w-full table-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
