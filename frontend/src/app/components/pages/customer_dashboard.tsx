import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";

const API = "http://127.0.0.1:8000";

export function CustomerDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* -----------------------------
     Get Supabase Access Token
  ----------------------------- */
  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || null;
  };

  /* -----------------------------
     Fetch All Appointments
     GET /appointments
  ----------------------------- */
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);

    try {
      const token = await getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await res.json();
      setAppointments(data);

    } catch (err) {
      console.error("Fetch error:", err);
    }

    setLoading(false);
  };

  /* -----------------------------
     Fetch Single Appointment
     GET /appointments/{id}
  ----------------------------- */
  const openAppointment = async (id: string) => {
    try {
      const token = await getToken();

      if (!token) return;

      const res = await fetch(
        `${API}/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch appointment");
      }

      const data = await res.json();
      setSelected(data);

    } catch (err) {
      console.error("Open appointment error:", err);
    }
  };

  /* -----------------------------
     Split Data
  ----------------------------- */
  const today = new Date().toISOString().split("T")[0];

  const upcoming = appointments.filter(
    (a) =>
      a.preferred_date >= today &&
      a.status !== "completed" &&
      a.status !== "cancelled"
  );

  const history = appointments.filter(
    (a) =>
      a.status === "completed" ||
      a.status === "cancelled" ||
      a.preferred_date < today
  );

  /* -----------------------------
     Status Badge Colors
  ----------------------------- */
  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <div className="min-h-screen bg-background p-8">

      <h1 className="text-3xl font-semibold mb-8">
        My Appointments
      </h1>

      {loading && <p>Loading appointments...</p>}

      {/* =============================
          UPCOMING
      ============================= */}
      <Section
        title="Upcoming Appointments"
        data={upcoming}
      />

      {/* =============================
          HISTORY
      ============================= */}
      <Section
        title="Appointment History"
        data={history}
      />

      {/* =============================
          DETAILS MODAL
      ============================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-8 w-[500px] shadow-lg">

            <h2 className="text-xl font-semibold mb-4">
              Appointment Details
            </h2>

            <div className="space-y-2 text-sm">

              <p>
                <strong>Service:</strong>{" "}
                {selected.service_type}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {selected.preferred_date}
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {selected.time_slot}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded ${statusColor(
                    selected.status
                  )}`}
                >
                  {selected.status}
                </span>
              </p>

              <p>
                <strong>Staff:</strong>{" "}
                {selected.assigned_staff_name ||
                  "Not assigned"}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {selected.location || "—"}
              </p>

              {selected.notes && (
                <p>
                  <strong>Notes:</strong>{" "}
                  {selected.notes}
                </p>
              )}

            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 px-4 py-2 bg-primary text-white rounded-xl"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );

  /* -----------------------------
     Section Component
  ----------------------------- */
  function Section({
    title,
    data,
  }: {
    title: string;
    data: any[];
  }) {
    return (
      <div className="mb-10">

        <h2 className="text-xl font-semibold mb-4">
          {title}
        </h2>

        {data.length === 0 ? (
          <div className="border rounded-xl p-6 text-muted-foreground">
            No appointments found.
          </div>
        ) : (
          <div className="grid gap-4">

            {data.map((appt) => (
              <div
                key={appt.id}
                onClick={() =>
                  openAppointment(appt.id)
                }
                className="border rounded-xl p-6 bg-card shadow-sm cursor-pointer hover:shadow-md transition"
              >
                <div className="flex justify-between">

                  <div>
                    <p className="font-semibold">
                      {appt.service_type}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {appt.preferred_date} •{" "}
                      {appt.time_slot}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-sm rounded-full ${statusColor(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    );
  }
}
