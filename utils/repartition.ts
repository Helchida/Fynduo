export interface RepartitionResult {
  montants: Record<string, number>;
  error: string | null;
}

export function calculateRepartition(
  beneficiaireIds: string[],
  montantTotal: number,
  locked: Record<string, number>, 
): RepartitionResult {
  const totalCents = Math.round(montantTotal * 100);

  const lockedIds = beneficiaireIds.filter((id) => locked[id] !== undefined);
  const unlockedIds = beneficiaireIds.filter((id) => locked[id] === undefined);

  const lockedCentsTotal = lockedIds.reduce(
    (sum, id) => sum + Math.round(locked[id] * 100),
    0,
  );

  const remainingCents = totalCents - lockedCentsTotal;

  if (remainingCents < 0) {
    return {
      montants: {},
      error: "La somme des montants saisis dépasse le montant total.",
    };
  }

  const montants: Record<string, number> = {};

  lockedIds.forEach((id) => {
    montants[id] = Math.round(locked[id] * 100) / 100;
  });

  if (unlockedIds.length > 0) {
    const baseShare = Math.floor(remainingCents / unlockedIds.length);
    let remainder = remainingCents - baseShare * unlockedIds.length;

    unlockedIds.forEach((id) => {
      let cents = baseShare;
      if (remainder > 0) {
        cents += 1;
        remainder -= 1;
      }
      montants[id] = cents / 100;
    });
  } else if (remainingCents !== 0) {
    return {
      montants: {},
      error: "La répartition ne correspond pas exactement au montant total.",
    };
  }

  return { montants, error: null };
}