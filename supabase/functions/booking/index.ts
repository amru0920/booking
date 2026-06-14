// ============================================================
//  EDGE FUNCTION: booking
//  Sistem Tempahan Court — TVET MARA Lumut
//  Ganti Apps Script lama. Frontend panggil SATU URL,
//  pass { action, ...data }.
//
//  Deploy:  supabase functions deploy booking --no-verify-jwt
//  Secrets: ADMIN_USER, ADMIN_PASS  (set di dashboard)
//           SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY auto-ada.
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- Config ----
const ALLOWED_DOMAIN = "@lumut.ikm.edu.my"; // guard email institut
const DEFAULT_MIN_PASS = 6;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ---- CORS ----
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// ---- Password hashing (PBKDF2, no external lib) ----
const toHex = (buf: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" }, key, 256,
  );
  return toHex(bits);
}
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${toHex(salt)}:${await derive(password, salt)}`;
}
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  return (await derive(password, salt)) === hashHex;
}

const last4 = (s: string) => (s || "").replace(/\D/g, "").slice(-4);
const cleanEmail = (s: string) => (s || "").trim().toLowerCase();

// ============================================================
//  MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = await req.json();
    const action = body.action;

    switch (action) {
      // --------------------------------------------------
      // checkEmail — frontend tanya: minta IC atau password?
      // --------------------------------------------------
      case "checkEmail": {
        const email = cleanEmail(body.email);
        if (!email.endsWith(ALLOWED_DOMAIN))
          return json({ success: false, error: "Guna email pelajar rasmi." });

        const { data } = await supabase
          .from("students").select("nama, password_hash").eq("email", email).maybeSingle();

        if (!data)
          return json({ success: false, error: "Email tidak berdaftar. Hubungi admin." });

        return json({
          success: true,
          nama: data.nama,
          passwordSet: data.password_hash !== null, // true → minta password, false → minta IC
        });
      }

      // --------------------------------------------------
      // firstLogin — email + IC → set password sendiri
      // --------------------------------------------------
      case "firstLogin": {
        const email = cleanEmail(body.email);
        const { data: s } = await supabase
          .from("students").select("*").eq("email", email).maybeSingle();

        if (!s) return json({ success: false, error: "Email tidak berdaftar." });
        if (s.password_hash !== null)
          return json({ success: false, error: "Akaun sudah ada kata laluan. Sila log masuk." });
        if (last4(body.ic) !== last4(s.ic) || last4(body.ic).length < 4)
          return json({ success: false, error: "4 digit IC tidak sepadan." });
        if (!body.newPassword || body.newPassword.length < DEFAULT_MIN_PASS)
          return json({ success: false, error: `Kata laluan minimum ${DEFAULT_MIN_PASS} aksara.` });

        const hash = await hashPassword(body.newPassword);
        await supabase.from("students").update({ password_hash: hash }).eq("id", s.id);

        return json({ success: true, student: { id: s.id, email: s.email, nama: s.nama } });
      }

      // --------------------------------------------------
      // login — email + password
      // --------------------------------------------------
      case "login": {
        const email = cleanEmail(body.email);
        const { data: s } = await supabase
          .from("students").select("*").eq("email", email).maybeSingle();

        if (!s) return json({ success: false, error: "Email tidak berdaftar." });
        if (s.password_hash === null)
          return json({ success: false, needsFirstLogin: true });

        const ok = await verifyPassword(body.password || "", s.password_hash);
        if (!ok) return json({ success: false, error: "Kata laluan salah." });

        return json({ success: true, student: { id: s.id, email: s.email, nama: s.nama } });
      }

      // --------------------------------------------------
      // getAvailability — slot yang dah dibook untuk satu tarikh
      // --------------------------------------------------
      case "getAvailability": {
        const { data } = await supabase
          .from("bookings")
          .select("court_id, slot_id, sport")
          .eq("booking_date", body.date)
          .eq("status", "active");
        return json({ success: true, booked: data || [] });
      }

      // --------------------------------------------------
      // createBooking — tempah (DB tolak kalau clash)
      // --------------------------------------------------
      case "createBooking": {
        const email = cleanEmail(body.email);
        const { data: s } = await supabase
          .from("students").select("id").eq("email", email).maybeSingle();
        if (!s) return json({ success: false, error: "Sila log masuk semula." });

        // validate sukan disokong oleh court
        const { data: court } = await supabase
          .from("courts").select("supported_sports").eq("id", body.court_id).maybeSingle();
        if (!court) return json({ success: false, error: "Court tidak wujud." });
        if (!court.supported_sports.includes(body.sport))
          return json({ success: false, error: "Sukan ini tidak boleh dimain di court ini." });

        const { data, error } = await supabase.from("bookings").insert({
          student_id: s.id,
          court_id: body.court_id,
          slot_id: body.slot_id,
          sport: body.sport,
          booking_date: body.date,
        }).select().single();

        if (error) {
          if (error.code === "23505") // unique violation = slot penuh
            return json({ success: false, error: "Slot ini sudah dipenuhi. Sila pilih lain." });
          return json({ success: false, error: "Gagal tempah. Cuba lagi." });
        }
        return json({ success: true, booking: data });
      }

      // --------------------------------------------------
      // cancelBooking — batal (verify pemilik)
      // --------------------------------------------------
      case "cancelBooking": {
        const email = cleanEmail(body.email);
        const { data: s } = await supabase
          .from("students").select("id").eq("email", email).maybeSingle();
        if (!s) return json({ success: false, error: "Sila log masuk semula." });

        const { data } = await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", body.booking_id)
          .eq("student_id", s.id)
          .eq("status", "active")
          .select();

        if (!data || data.length === 0)
          return json({ success: false, error: "Tempahan tidak dijumpai." });
        return json({ success: true });
      }

      // --------------------------------------------------
      // myBookings — sejarah pelajar
      // --------------------------------------------------
      case "myBookings": {
        const email = cleanEmail(body.email);
        const { data: s } = await supabase
          .from("students").select("id").eq("email", email).maybeSingle();
        if (!s) return json({ success: false, error: "Sila log masuk semula." });

        const { data } = await supabase
          .from("bookings")
          .select("id, sport, booking_date, status, courts(name), slots(label_ms)")
          .eq("student_id", s.id)
          .order("booking_date", { ascending: false });

        return json({ success: true, bookings: data || [] });
      }

      // --------------------------------------------------
      // adminBookings — semua tempahan (untuk dashboard admin)
      // --------------------------------------------------
      case "adminBookings": {
        if (body.adminUser !== Deno.env.get("ADMIN_USER") ||
            body.adminPass !== Deno.env.get("ADMIN_PASS"))
          return json({ success: false, error: "Akses admin ditolak." }, 403);

        const { data } = await supabase
          .from("bookings")
          .select("id, sport, booking_date, status, students(email), courts(name), slots(label_ms)")
          .order("created_at", { ascending: false });

        return json({ success: true, bookings: data || [] });
      }

      // --------------------------------------------------
      // adminCancel — admin batalkan tempahan pelajar
      // --------------------------------------------------
      case "adminCancel": {
        if (body.adminUser !== Deno.env.get("ADMIN_USER") ||
            body.adminPass !== Deno.env.get("ADMIN_PASS"))
          return json({ success: false, error: "Akses admin ditolak." }, 403);

        const { data } = await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", body.booking_id)
          .eq("status", "active")
          .select();

        if (!data || data.length === 0)
          return json({ success: false, error: "Tempahan tidak dijumpai." });
        return json({ success: true });
      }

      // --------------------------------------------------
      // adminReset — reset password student → NULL (first-login balik)
      // --------------------------------------------------
      case "adminReset": {
        if (body.adminUser !== Deno.env.get("ADMIN_USER") ||
            body.adminPass !== Deno.env.get("ADMIN_PASS"))
          return json({ success: false, error: "Akses admin ditolak." }, 403);

        const email = cleanEmail(body.email);
        const { data } = await supabase
          .from("students").update({ password_hash: null }).eq("email", email).select();

        if (!data || data.length === 0)
          return json({ success: false, error: "Email tidak dijumpai." });
        return json({ success: true });
      }

      // --------------------------------------------------
      default:
        return json({ success: false, error: "Action tidak dikenali." }, 400);
    }
  } catch (_e) {
    return json({ success: false, error: "Ralat pelayan." }, 500);
  }
});