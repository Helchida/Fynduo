import { useContext } from "react";
import { CategoriesContext } from "../context/CategoriesContext";

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error(
      "useCategories doit être utilisé dans un CategoriesProvider"
    );
  }
  return context;
};
