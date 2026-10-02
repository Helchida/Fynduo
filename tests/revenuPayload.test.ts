import { toRevenuInsertPayload } from "../services/supabase/revenuPayload";

describe("revenue creation payload", () => {
  const revenue = {
    categorie: "cat_salaire",
    description: "Salaire",
    montant: 2500,
    beneficiaire: "user-1",
    dateReception: "2026-10-27T00:00:00.000Z",
    moisAnnee: "2026-10",
    isReferencePay: true,
  };

  it("includes a checked reference-pay value in the first INSERT", () => {
    expect(toRevenuInsertPayload("household-1", "household-1_revenue-1", revenue))
      .toMatchObject({ is_reference_pay: true });
  });

  it("keeps an unchecked revenue out of reference-pay boundaries", () => {
    expect(toRevenuInsertPayload("household-1", "household-1_revenue-2", {
      ...revenue,
      isReferencePay: false,
    })).toMatchObject({ is_reference_pay: false });
  });
});
