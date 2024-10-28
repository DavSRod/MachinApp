import { useAuth, Icons } from "../../../index";
import { DropDown } from "../navigation/Dropdown";
import { User } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  UserCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export const AvatarCom = () => {
  const { logout, user, loading } = useAuth();
  const { t } = useTranslation();
   const capitalizarPrimeraLetra = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const ItemsDrop = [
    <>
      <p className="font-bold">{`${user.us_nombre} ${user.us_apellidos}`}</p>
      <p className="font-bold">{user.us_correo}</p>
    </>,
    <>
      <Link to={"/perfil"} className="flex gap-4">
        <Icons icon={UserCircleIcon} /> <p>{t("administrar_perfil_usuario")}</p>
      </Link>
    </>,
    <>
      <Link to={"/ayuda"} className="flex gap-4">
        <Icons icon={QuestionMarkCircleIcon} />{" "}
        <p>
          {t("ayuda")} & {t("retroalimentacion")}
        </p>
      </Link>
    </>,
    <>
      <div className="flex gap-4" onClick={logout}>
        <Icons icon={ArrowRightOnRectangleIcon} />
        <p> {t("salir")}</p>
      </div>
    </>,
  ];

  return (
    <>
      <DropDown
        DropdownTriggerElement={
          <User
            className="cursor-pointer font-bold"
            avatarProps={{
              isBordered: true,
            }}
            name={
              loading ? t("loading") : `${capitalizarPrimeraLetra(user.us_nombre)} ${capitalizarPrimeraLetra(user.us_apellidos)}`
            }
          />
        }
        dropdown={ItemsDrop}
      />
    </>
  );
};
