import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "../../../supabase";

export function ProtectedRoute({
  children,
  role,
}: any) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return setLoading(false);

      const { data } = await supabase
        .from("user_profile")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (data?.role === role) setAllowed(true);

      setLoading(false);
    }

    check();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!allowed) return <Navigate to="/" />;

  return children;
}
