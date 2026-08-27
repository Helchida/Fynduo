import { createClient } from "npm:@supabase/supabase-js@2.95.3";
import webpush from "npm:web-push@3.6.7";
import { requireFirebaseUser } from "../_shared/firebase-auth.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.3/cors";

const headers = { ...corsHeaders, "content-type": "application/json" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

const isInvalidSubscription = (error: unknown) => {
  const statusCode = (error as { statusCode?: number }).statusCode;
  return statusCode === 404 || statusCode === 410;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const authorId = await requireFirebaseUser(request);
    const body = await request.json();
    const required = ["id", "householdId", "type", "description", "montantTotal", "payeur", "beneficiaires", "dateStatistiques", "moisAnnee", "scope", "nature"];
    if (required.some((key) => body[key] === undefined) || !Array.isArray(body.beneficiaires) ||
        !Number.isFinite(Number(body.montantTotal)) || Number(body.montantTotal) <= 0) {
      return json({ error: "invalid_charge" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const { data, error } = await supabase.rpc("create_charge_with_notifications", {
      p_charge_id: `${body.householdId}_${body.id}`,
      p_household_id: body.householdId,
      p_author_id: authorId,
      p_type: body.type,
      p_categorie: body.categorie ?? "",
      p_description: String(body.description).trim(),
      p_montant_total: Number(body.montantTotal),
      p_payeur: body.payeur,
      p_beneficiaires: [...new Set(body.beneficiaires)],
      p_date_statistiques: body.dateStatistiques,
      p_mois_annee: body.moisAnnee,
      p_scope: body.scope,
      p_nature: body.nature,
      p_repartition: body.repartition ?? null,
    });
    if (error) throw error;

    const chargeId = data?.[0]?.charge_id;
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, user_id, title, message, metadata")
      .eq("charge_id", chargeId);

    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const subject = Deno.env.get("VAPID_SUBJECT") || "mailto:notifications@fynduo.app";
    if (publicKey && privateKey && data?.[0]?.notification_count > 0 && notifications?.length) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      const recipientIds = notifications.map((notification) => notification.user_id);
      const { data: subscriptions } = await supabase.from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth").in("user_id", recipientIds).eq("active", true);
      await Promise.allSettled((subscriptions ?? []).map(async (subscription) => {
        const notification = notifications.find((item) => item.user_id === subscription.user_id);
        if (!notification) return;
        try {
          const { count: badgeCount } = await supabase.from("notifications")
            .select("id", { count: "exact", head: true }).eq("user_id", subscription.user_id).is("read_at", null);
          await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify({
            title: notification.title, body: notification.message, data: notification.metadata, badgeCount: badgeCount ?? 0,
          }));
          await supabase.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", subscription.id);
        } catch (pushError) {
          console.error("push_send_failed", { subscriptionId: subscription.id, pushError: String(pushError) });
          if (isInvalidSubscription(pushError)) {
            await supabase.from("push_subscriptions").update({ active: false, invalidated_at: new Date().toISOString() }).eq("id", subscription.id);
          }
        }
      }));
    }
    return json({ id: body.id, notificationsCreated: data?.[0]?.notification_count ?? 0 });
  } catch (error) {
    console.error("create_charge_failed", error);
    return json({ error: "unable_to_create_charge" }, String(error).includes("forbidden") ? 403 : 500);
  }
});

