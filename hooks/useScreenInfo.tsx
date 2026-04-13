import { useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { InfoButton } from "../components/ui/InfoButton/InfoButton";

export const useScreenInfo = () => {
  const navigation = useNavigation();
  const [showInfoModal, setShowInfoModal] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <InfoButton onPress={() => setShowInfoModal(true)} />
      ),
    });
  }, [navigation]);

  return {
    showInfoModal,
    setShowInfoModal,
  };
};