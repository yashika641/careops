import { useState } from "react";
import {
  signIn,
  signUp,
  signInWithGoogle,
} from "../../../auth";
import { useNavigate } from "react-router-dom";

export function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  if (!open) return null;

  /* -----------------------------
     Role Redirect Helper
  ----------------------------- */
  const redirectByRole = (role: string) => {
    if (role === "admin") navigate("/dashboard");
    else if (role === "staff") navigate("/staff");
    else navigate("/customer");
  };

  /* -----------------------------
     Handle Submit
  ----------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    /* =============================
       SIGNUP
    ============================= */
    if (isSignup) {
      const { data, error } = await signUp(
        email,
        password,
        username,
        phone,
        role
      );

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // 🔥 Use backend role directly
      const backendRole = data.user.role;

      redirectByRole(backendRole);

      setLoading(false);
      onClose();
    }

    /* =============================
       SIGNIN
    ============================= */
    else {
      const { data, error } = await signIn(
        email,
        password
      );

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // 🔥 Use backend role (NO mismatch blocking)
      const backendRole = data.user.role;

      redirectByRole(backendRole);

      setLoading(false);
      onClose();
    }
  };

  /* -----------------------------
     Google OAuth
  ----------------------------- */
  const handleGoogle = async () => {
    await signInWithGoogle();
  };

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card p-8 rounded-2xl w-full max-w-md shadow-xl relative">

        <h2 className="text-2xl font-semibold mb-2">
          {isSignup
            ? "Create account"
            : "Welcome back"}
        </h2>

        <p className="text-muted-foreground mb-6">
          {isSignup
            ? "Start managing your operations today."
            : "Sign in to continue."}
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl hover:bg-muted"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Role Picker */}
        <div className="mb-4">
          <label className="block text-sm mb-2">
            Continue as
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex-1 border rounded-xl py-2 ${
                role === "customer"
                  ? "bg-primary text-white"
                  : ""
              }`}
            >
              Customer
            </button>

            <button
              type="button"
              onClick={() => setRole("staff")}
              className={`flex-1 border rounded-xl py-2 ${
                role === "staff"
                  ? "bg-primary text-white"
                  : ""
              }`}
            >
              Staff / Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {isSignup && (
            <>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 border rounded-xl"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 border rounded-xl"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-xl"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-xl"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Sign up"
              : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="mt-4 text-sm text-muted-foreground"
        >
          {isSignup
            ? "Already have an account? Sign in"
            : "New here? Create account"}
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
