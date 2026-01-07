export const calculSimplifiedTransfers = (balances: Record<string, number>) => {
  let debiteurs = Object.keys(balances)
    .filter((id) => balances[id] < -0.01)
    .map((id) => ({ id, montant: Math.abs(balances[id]) }));

  let creanciers = Object.keys(balances)
    .filter((id) => balances[id] > 0.01)
    .map((id) => ({ id, montant: balances[id] }));

  const virements: { de: string; a: string; montant: number }[] = [];

  let indexDebiteur = 0;
  let indexCreancier = 0;

  while (
    indexDebiteur < debiteurs.length &&
    indexCreancier < creanciers.length
  ) {
    const debiteur = debiteurs[indexDebiteur];
    const creancier = creanciers[indexCreancier];
    const montantVirement = Math.min(debiteur.montant, creancier.montant);

    virements.push({
      de: debiteur.id,
      a: creancier.id,
      montant: montantVirement,
    });

    debiteur.montant -= montantVirement;
    creancier.montant -= montantVirement;

    if (debiteur.montant <= 0.01) indexDebiteur++;
    if (creancier.montant <= 0.01) indexCreancier++;
  }

  return virements;
};
