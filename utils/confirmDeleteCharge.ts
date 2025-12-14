import { Alert } from 'react-native';

export const confirmDeleteCharge = (
  chargeName: string,
  onConfirm: () => Promise<void>
) => {
  Alert.alert(
    'Confirmer la suppression',
    `Voulez-vous vraiment supprimer la charge "${chargeName}" ?`,
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await onConfirm();
            Alert.alert('Succès', `Charge "${chargeName}" supprimée.`);
          } catch {
            Alert.alert('Erreur', 'Échec de la suppression de la charge.');
          }
        },
      },
    ]
  );
};
