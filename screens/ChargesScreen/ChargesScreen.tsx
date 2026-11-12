import React from "react";

import { useAuth } from "../../hooks/useAuth";
import dayjs from "dayjs";
import "dayjs/locale/fr";

import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";

import ChargesScreenContent from "./ChargesScreenContent";

dayjs.locale("fr");

const ChargesScreen: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <NoAuthenticatedUser />;
  }

  return <ChargesScreenContent user={user} />;
};

export default ChargesScreen;
