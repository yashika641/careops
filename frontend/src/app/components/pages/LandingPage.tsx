import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { AuthModal } from "./authmodal";

const API = "http://127.0.0.1:8000";

export function LandingPage() {
  const navigate = useNavigate();

  /* -----------------------------
     Form State
  ----------------------------- */
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceType: "",
    preferredDate: "",
    message: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /* -----------------------------
     Auth State (JWT Based)
  ----------------------------- */
  const [user, setUser] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("customer");
  const [authChecked, setAuthChecked] = useState(false);

  /* -----------------------------
     Load Current User
  ----------------------------- */
  const loadUser = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setAuthChecked(true);
      return;
    }

    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setAuthChecked(true);
        return;
      }

      const data = await res.json();
      setUser(data);
      setUserRole(data.role);
    } catch (err) {
      console.error("User load error:", err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    } finally {
      setAuthChecked(true);
    }
  };

  /* -----------------------------
     Logout (JWT)
  ----------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setUserRole("customer");
    window.location.href = "/";
  };

  /* -----------------------------
     Role Redirect
  ----------------------------- */
  const redirectByRole = (role: string) => {
    if (role === "admin") navigate("/dashboard");
    else if (role === "staff") navigate("/staff");
    else navigate("/customer");
  };

  /* -----------------------------
   Load User On Page Mount
  ----------------------------- */
  useEffect(() => {
    loadUser();
  }, []);

  /* -----------------------------
     Submit Handler
  ----------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
      setAuthOpen(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_type: formData.serviceType,
          preferred_date: formData.preferredDate,
          time_slot: "10:00 AM",
          location: "Customer Address",
          notes: formData.message,
        }),
      });

      if (!res.ok) {
        throw new Error("Submit failed");
      }

      setSuccessMsg("Thanks! Appointment request submitted.");

      setFormData({
        name: "",
        phone: "",
        serviceType: "",
        preferredDate: "",
        message: "",
      });

      setTimeout(() => {
        redirectByRole(userRole);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit form");
    }

    setLoading(false);
  };

  // Show loading spinner instead of null - FIXES FLICKERING
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-primary">
              CareOps Lite
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => redirectByRole(userRole)}
                  className="px-4 py-2 text-sm border rounded-xl hover:bg-muted"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-primary text-white rounded-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-4 py-2 text-sm border rounded-xl"
                >
                  Sign in
                </button>

                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-4 py-2 text-sm bg-primary text-white rounded-xl"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero + Form */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-semibold mb-6">
              Turn incoming calls into booked jobs — automatically.
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Capture leads, follow up instantly, and manage bookings from one
              calm workspace.
            </p>

            <div className="space-y-4">
              {[
                "Capture and qualify leads in seconds",
                "AI-powered follow-up suggestions",
                "Track inventory and bookings in real-time",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-2">
                Get started today
              </h2>

              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-4">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                  required
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                  required
                />

                <select
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                  required
                >
                  <option value="">Select Service</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="repair">Repair</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                </select>

                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                />

                <textarea
                  rows={3}
                  placeholder="Tell us what you need..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Try Demo
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
