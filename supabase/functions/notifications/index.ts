import { createClient } from "npm:@supabase/supabase-js@2.95.3";
import { requireFirebaseUser } from "../_shared/firebase-auth.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.3/cors";

const headers = { ...corsHeaders, "content-type": "application/json" };
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return respond({ error: "method_not_allowed" }, 405);
  try {
    const userId = await requireFirebaseUser(request);
    const body = await request.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (body.action === "list") {
      const { data, error } = await supabase.from("notifications").select("id, type, title, message, metadata, created_at, read_at")
        .eq("user_id", userId).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return respond({ notifications: data ?? [], unreadNotificationCount: (data ?? []).filter((item) => !item.read_at).length });
    }
    if (body.action === "mark_read") {
      const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() })
        .eq("id", body.notificationId).eq("user_id", userId).is("read_at", null);
      if (error) throw error;
      return respond({ ok: true });
    }
    if (body.action === "mark_all_read") {
      const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() })
        .eq("user_id", userId).is("read_at", null);
      if (error) throw error;
      return respond({ ok: true });
    }
    if (body.action === "subscription_status") {
      if (!body.fingerprint) return respond({ error: "invalid_subscription" }, 400);
      const { data, error } = await supabase.from("push_subscriptions").select("active")
        .eq("user_id", userId).eq("fingerprint", body.fingerprint).maybeSingle();
      if (error) throw error;
      return respond({ active: Boolean(data?.active) });
    }
    if (body.action === "subscribe") {
      const subscription = body.subscription;
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth || !body.fingerprint) return respond({ error: "invalid_subscription" }, 400);
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: userId, endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth, platform: body.platform || "web", fingerprint: body.fingerprint,
        active: true, invalidated_at: null, last_used_at: new Date().toISOString(),
      }, { onConflict: "fingerprint" });
      if (error) throw error;
      return respond({ ok: true });
    }
    if (body.action === "unsubscribe") {
      if (!body.fingerprint) return respond({ error: "invalid_subscription" }, 400);
      const { error } = await supabase.from("push_subscriptions").update({
        active: false, invalidated_at: new Date().toISOString(),
      }).eq("user_id", userId).eq("fingerprint", body.fingerprint);
      if (error) throw error;
      return respond({ ok: true });
    }
    return respond({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error("notifications_failed", error);
    return respond({ error: "unauthorized_or_failed" }, 401);
  }
});

