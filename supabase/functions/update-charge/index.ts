import { createClient } from "npm:@supabase/supabase-js@2.95.3";
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.3/cors";
import { requireFirebaseUser } from "../_shared/firebase-auth.ts";

const headers = { ...corsHeaders, "content-type": "application/json" };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

const editableFields = new Set([
  "categorie", "description", "montant_total", "payeur", "beneficiaires",
  "date_statistiques", "mois_annee", "scope", "repartition",
]);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const authorId = await requireFirebaseUser(request);
    const body = await request.json();
    const householdId = String(body.householdId ?? "");
    const chargeId = String(body.id ?? "");
    const requested = body.updates;
    if (!householdId || !chargeId || !requested || typeof requested !== "object" || Array.isArray(requested)) {
      return json({ error: "invalid_charge_update" }, 400);
    }

    const updates = Object.fromEntries(
      Object.entries(requested).filter(([key]) => editableFields.has(key)),
    );
    if (!Object.keys(updates).length) return json({ error: "empty_charge_update" }, 400);
    if (updates.description !== undefined && !String(updates.description).trim()) return json({ error: "invalid_description" }, 400);
    if (updates.montant_total !== undefined && (!Number.isFinite(Number(updates.montant_total)) || Number(updates.montant_total) <= 0)) {
      return json({ error: "invalid_amount" }, 400);
    }
    if (updates.beneficiaires !== undefined && (!Array.isArray(updates.beneficiaires) || updates.beneficiaires.length === 0)) {
      return json({ error: "invalid_beneficiaries" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const { data: household, error: householdError } = await supabase
      .from("households").select("members").eq("id", householdId).maybeSingle();
    if (householdError) throw householdError;
    if (!household?.members?.includes(authorId)) return json({ error: "forbidden" }, 403);
    if (updates.payeur !== undefined && !household.members.includes(String(updates.payeur))) return json({ error: "invalid_payer" }, 400);
    if (Array.isArray(updates.beneficiaires) && updates.beneficiaires.some((id) => !household.members.includes(String(id)))) {
      return json({ error: "invalid_beneficiary" }, 400);
    }

    const { data, error } = await supabase.from("charges").update(updates)
      .eq("id", `${householdId}_${chargeId}`).eq("household_id", householdId).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "charge_not_found_or_forbidden" }, 404);
    return json({ success: true });
  } catch (error) {
    console.error("update_charge_failed", error);
    if (error instanceof Error && error.message === "unauthorized") return json({ error: "unauthorized" }, 401);
    return json({ error: "unable_to_update_charge" }, 500);
  }
});
