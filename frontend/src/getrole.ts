import { supabase } from "./supabase";

export async function getUserRole() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("user_profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return data?.role;
}
