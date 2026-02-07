import { useContext } from "react";
import { ChargesFixesConfigContext } from "context/ChargesFixesConfigContext";
export const useChargesFixesConfigs = () => {
  const context = useContext(ChargesFixesConfigContext);
  if (context === undefined) {
    throw new Error(
      "useChargesFixesConfigsContext doit être utilisé dans un ChargesFixesConfigsProvider",
    );
  }
  return context;
};
