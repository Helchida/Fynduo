import { createClient } from "npm:@supabase/supabase-js@2.95.3";
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.3/cors";
import { requireFirebaseUser } from "../_shared/firebase-auth.ts";

const headers = { ...corsHeaders, "content-type": "application/json" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const authorId = await requireFirebaseUser(request);
    const body = await request.json();
    const householdId = String(body.householdId ?? "");
    if (!householdId) return json({ error: "invalid_household" }, 400);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: household } = await supabase.from("households").select("members").eq("id", householdId).maybeSingle();
    if (!household?.members?.includes(authorId)) return json({ error: "forbidden" }, 403);

    if (body.action === "list") {
      const { data, error } = await supabase.from("budgets").select("id, household_id, name, initial_amount_cents, created_at, updated_at, budget_categories(category_id)").eq("household_id", householdId).order("created_at");
      if (error) throw error;
      return json({ budgets: data ?? [] });
    }
    if (body.action === "save") {
      const { error } = await supabase.rpc("save_budget", {
        p_author_id: authorId, p_budget_id: String(body.budgetId ?? ""), p_household_id: householdId,
        p_name: String(body.name ?? ""), p_initial_amount_cents: Number(body.initialAmountCents),
        p_category_ids: body.categoryIds, p_period_key: String(body.periodKey ?? ""),
      });
      if (error) return json({ error: error.message }, error.code === "23505" ? 409 : 400);
      return json({ success: true });
    }
    if (body.action === "delete") {
      const { error } = await supabase.rpc("delete_budget", { p_author_id: authorId, p_household_id: householdId, p_budget_id: String(body.budgetId ?? "") });
      if (error) throw error;
      return json({ success: true });
    }
    return json({ error: "invalid_action" }, 400);
  } catch (error) {
    console.error("budget_request_failed", error);
    return json({ error: "unable_to_manage_budgets" }, 500);
  }
});
