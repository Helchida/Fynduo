import * as Linking from "expo-linking";
import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "@/types";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "fynduo://"],

  config: {
    screens: {
      Home: "",
      Charges: "depenses",
      Revenus: "revenus",
      ChargesFixes: "charges-fixes",
      Loyer: "loyer-apl",
      Epargne: "epargne",
      Budgets: "budgets",
      Stats: "statistiques",
      Regulation: "reglement",
      SummaryRegulation: "resume-reglement",
      History: "historique",
      UserSettings: "parametres",
      Notifications: "notifications",
      Households: "foyers",

      HistoryDetail: "historique/:moisAnnee",

      ChargeDetail: "depenses/:chargeId/:description",
      RevenuDetail: "revenus/:revenuId/:description",

      Login: "connexion",
      Register: "inscription",
      EmailVerification: "verification-email",
    },
  },
};

export default linking;
