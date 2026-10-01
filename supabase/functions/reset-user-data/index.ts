import { createClient } from "npm:@supabase/supabase-js@2.95.3";
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.3/cors";
import { requireFirebaseUser } from "../_shared/firebase-auth.ts";

const headers = {
  ...corsHeaders,
  "content-type": "application/json",
};

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers,
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (request.method !== "POST") {
    return respond(
      {
        error: "method_not_allowed",
      },
      405,
    );
  }

  let userId: string;

  try {
    userId = await requireFirebaseUser(request);
  } catch (error) {
    console.error("reset_user_data_unauthorized", error);

    return respond(
      {
        error: "unauthorized",
      },
      401,
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.rpc("reset_user_data", {
      p_user_id: userId,
    });

    if (error) {
      console.error("reset_user_data_failed", error);

      return respond(
        {
          error: "reset_failed",
        },
        500,
      );
    }

    return respond({
      success: true,
    });
  } catch (error) {
    console.error("reset_user_data_unexpected_error", error);

    return respond(
      {
        error: "reset_failed",
      },
      500,
    );
  }
});