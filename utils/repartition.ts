export interface RepartitionResult {
  montants: Record<string, number>;
  error: string | null;
}

/**
 * Keeps a custom split expressed in euros proportional when its total changes.
 * Values are rounded to cents and the last value receives any rounding residue,
 * so a fully locked split remains valid for the new total.
 */
export function scaleLockedRepartition(
  locked: Record<string, number>,
  previousTotal: number,
  nextTotal: number,
  locksCoverEntireSplit = false,
): Record<string, number> {
  const entries = Object.entries(locked);

  if (!entries.length || previousTotal <= 0 || nextTotal <= 0) {
    return locked;
  }

  const nextTotalCents = Math.round(nextTotal * 100);
  const scale = nextTotal / previousTotal;
  let assignedCents = 0;

  return Object.fromEntries(
    entries.map(([uid, amount], index) => {
      const isLastLockedAmount = index === entries.length - 1;
      const cents = locksCoverEntireSplit && isLastLockedAmount
        ? nextTotalCents - assignedCents
        : Math.round(amount * scale * 100);
      assignedCents += cents;
      return [uid, cents / 100];
    }),
  );
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
