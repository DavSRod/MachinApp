import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
//proteger las rutas
import { ProtectedRoute } from "./ProtectedRoute";
import { ProtegerRutasAdminInstru } from "./rutas/AdminRoutes";

// paginas
import {
  Inicio,
  Home,
  Historial,
  Maquinas,
  Sitios,
  Sedes,
  Areas,
  MaquinasAmbiente,
  InfoMaquina,
  ViewFormFichaTecnica,
  ViewFormFicha_De_mantenimiento,
  ResetPassword,
  InfoAmbiente,
  InfoSede,
  AreasGeneral,
  AmbientesGeneral,
  ViewFormTipoFicha,
  RegistrarArea,
  RegistrarSede,
  RegistrarAmbiente,
  Editar_Component,
  ActualizarAmbientes,
  ActualizarAreas,
  UpdateAndListFichaTecnica,
  UpdateFormFichaSolicitud,
  ActualizarSedes,
  Page404,
  SettingsPanelPage,
  ViewFormTipoFichaUpdate,
  RegistrarTipoSitio
} from "../index";

import { PerfilRoutes } from "./rutas/PerfilRoute";
import { SolicitudRouter } from "./rutas/SolicitudRouter";
import { AdminRoute } from "./rutas/AdminRoutes";

export const AppRouter = () => {
  return (
    <>
      <Suspense>
        <Routes>
          <Route path="*" element={<Page404 />} />
          <Route path="/" element={<Inicio />} />
          <Route path="/recuperar" element={<ResetPassword />} />
          <Route path="/infoMaquina/:idMaquina" element={<InfoMaquina />} />


          <Route element={<ProtectedRoute />}>
            <Route element={<ProtegerRutasAdminInstru />}>
              <Route path="/Ambientes/Registrar" element={<RegistrarAmbiente />} />
              <Route path="/Sedes/Registrar" element={<RegistrarSede />} />
              <Route path="/crearfichaequipos" element={<ViewFormFichaTecnica />} />
              <Route path="/crearTiposFichaTec" element={<ViewFormTipoFicha />} />
              <Route path="/crear_ficha_mantenimiento" element={<ViewFormFicha_De_mantenimiento />} />
              <Route path="/Ambientes/Actualizar/:id" element={<ActualizarAmbientes />} />
              <Route path="/Areas/Actualizar/:id" element={<ActualizarAreas />} />
              <Route path="/Sedes/Actualizar/:id" element={<ActualizarSedes />} />
              <Route path="/Areas/Registrar" element={<RegistrarArea />} />
              <Route path="/listar_por_id/:idMantenimiento" element={<Editar_Component />} />
              <Route path="/editar/solicitud/:id" element={<UpdateFormFichaSolicitud/>}/>
               <Route path="/editarTiposFichaTec" element={<ViewFormTipoFichaUpdate/>}/>
               <Route path="/TipoSitio/Registrar" element={<RegistrarTipoSitio />} />
              <Route path="/listarFichaTecnica/:idMaquina" element={<UpdateAndListFichaTecnica />} />
            </Route>
            <Route path="/home" element={<Home />} />
            <Route path="/perfil/*" element={<PerfilRoutes />} />

            <Route path="/ayuda" element={<SettingsPanelPage />} />

            <Route path="/solicitud/*" element={<SolicitudRouter />} />

            <Route path="/Historial" element={<Historial />} />
            <Route path="/Maquinas" element={<Maquinas />} />
            <Route path="/Sedes" element={<Sitios />} />
            <Route path="/Sedes/:idSede" element={<Sedes />} />
            <Route path="/Areas/:idArea" element={<Areas />} />{" "}
            <Route path="/Panelcontrol/*" element={<AdminRoute />} />
            <Route path="/MaquinasAmb/:idAmbiente" element={<MaquinasAmbiente />}  />
            
            <Route path="/Sedes/InfoSede/:idSede" element={<InfoSede />} />
            <Route path="/Ambientes/InfoAmbiente/:idAmbientes" element={<InfoAmbiente />}  />
            <Route path="/Areas" element={<AreasGeneral />} />
            <Route path="/Ambientes" element={<AmbientesGeneral />} />


          </Route>


        </Routes>
      </Suspense>
    </>
  );
};
