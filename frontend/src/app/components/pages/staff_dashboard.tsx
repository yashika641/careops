import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";

export function StaffDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>("");

  // -----------------------------
  // Init
  // -----------------------------
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    fetchPending();
    fetchAssigned(user.id);
  };

  // -----------------------------
  // Fetch Pending Requests
  // -----------------------------
  const fetchPending = async () => {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .is("staff_id", null)
      .order("appointment_date", {
        ascending: true,
      });

    setPending(data || []);
  };

  // -----------------------------
  // Fetch Assigned Jobs
  // -----------------------------
  const fetchAssigned = async (id: string) => {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("staff_id", id)
      .order("appointment_date", {
        ascending: true,
      });

    setAssigned(data || []);
  };

  // -----------------------------
  // Assign to Self
  // -----------------------------
  const assignToMe = async (apptId: string) => {
    await supabase
      .from("appointments")
      .update({
        staff_id: userId,
        status: "confirmed",
      })
      .eq("id", apptId);

    fetchPending();
    fetchAssigned(userId);
  };

  // -----------------------------
  // Update Status
  // -----------------------------
  const updateStatus = async (
    id: string,
    status: string
  ) => {
    await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    fetchAssigned(userId);
  };

  // -----------------------------
  // Status badge
  // -----------------------------
  const statusColor = (status: string) => {
    if (status === "confirmed")
      return "bg-blue-100 text-blue-700";
    if (status === "completed")
      return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-background p-8">

      <h1 className="text-3xl font-semibold mb-8">
        Staff Dashboard
      </h1>

      {/* -------------------------
          New Requests
      -------------------------- */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          New Booking Requests
        </h2>

        {pending.length === 0 ? (
          <p className="text-muted-foreground">
            No pending requests 🎉
          </p>
        ) : (
          <div className="grid gap-4">
            {pending.map((appt) => (
              <div
                key={appt.id}
                className="border rounded-xl p-6 bg-card shadow-sm"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-semibold">
                    {appt.service_type}
                  </h3>

                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <p>
                    📅 {appt.appointment_date}
                  </p>
                  <p>
                    ⏰ {appt.appointment_time}
                  </p>
                  <p>
                    📍 {appt.location}
                  </p>
                </div>

                <button
                  onClick={() =>
                    assignToMe(appt.id)
                  }
                  className="mt-4 bg-primary text-white px-4 py-2 rounded-xl"
                >
                  Assign to Me
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------
          My Appointments
      -------------------------- */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          My Schedule
        </h2>

        {assigned.length === 0 ? (
          <p className="text-muted-foreground">
            No assigned appointments.
          </p>
        ) : (
          <div className="grid gap-4">
            {assigned.map((appt) => (
              <div
                key={appt.id}
                className="border rounded-xl p-6 bg-card"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-semibold">
                    {appt.service_type}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${statusColor(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <p>
                    📅 {appt.appointment_date}
                  </p>
                  <p>
                    ⏰ {appt.appointment_time}
                  </p>
                  <p>
                    📍 {appt.location}
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      updateStatus(
                        appt.id,
                        "completed"
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-xl"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
