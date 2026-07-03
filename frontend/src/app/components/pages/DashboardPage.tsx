import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Users,
  Calendar,
  Package,
  Clock,
  Sparkles,
  CheckCircle2,
  Loader2,
  Edit,
  Trash2,
  UserPlus,
  DollarSign,
  AlertTriangle,
  PhoneCall,
  ArrowRight,
  X,
  Plus,
  LayoutDashboard,
  Briefcase,
  ShoppingCart,
  UserCircle,
  Wallet,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const API = "http://127.0.0.1:8000";

export function DashboardPage() {
  const navigate = useNavigate();

  // Data States
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showModal, setShowModal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // -----------------------------
  // Auth Guard + Role Check
  // -----------------------------
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.log("❌ No token found, redirecting to login");
      navigate("/");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.log("❌ Auth failed, redirecting to login");
        navigate("/");
        return;
      }

      const user = await res.json();
      console.log("✅ User authenticated:", user);

      if (user.role !== "admin") {
        console.log("❌ User is not admin, redirecting");
        navigate("/");
        return;
      }

      setCurrentUser(user);
      await fetchAllData();
    } catch (error) {
      console.error("❌ Auth error:", error);
      navigate("/");
    }
  };

  // -----------------------------
  // Fetch All Data
  // -----------------------------
  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      console.log("📡 Fetching all data...");

      const [
        appointmentsRes,
        staffRes,
        leadsRes,
        inventoryRes,
        salariesRes,
        alertsRes,
      ] = await Promise.all([
        fetch(`${API}/appointments`, { headers }),
        fetch(`${API}/staff`, { headers }),
        fetch(`${API}/leads`, { headers }),
        fetch(`${API}/inventory`, { headers }),
        fetch(`${API}/staff/salaries`, { headers }),
        fetch(`${API}/inventory/alerts`, { headers }),
      ]);

      console.log("📡 Response statuses:", {
        appointments: appointmentsRes.status,
        staff: staffRes.status,
        leads: leadsRes.status,
        inventory: inventoryRes.status,
        salaries: salariesRes.status,
        alerts: alertsRes.status,
      });

      const [
        appointmentsData,
        staffData,
        leadsData,
        inventoryData,
        salariesData,
        alertsData,
      ] = await Promise.all([
        appointmentsRes.json(),
        staffRes.json(),
        leadsRes.json(),
        inventoryRes.json(),
        salariesRes.json(),
        alertsRes.json(),
      ]);

      console.log("📊 Data received:", {
        appointments: appointmentsData?.length || 0,
        staff: staffData?.length || 0,
        leads: leadsData?.length || 0,
        inventory: inventoryData?.length || 0,
        salaries: salariesData?.length || 0,
        alerts: alertsData,
      });

      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      setSalaries(Array.isArray(salariesData) ? salariesData : []);
      setLowStockAlerts(alertsData);

      console.log("✅ All data loaded successfully");
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Update Appointment
  // -----------------------------
  const updateAppointment = async (appointmentId: string, updateData: any) => {
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${API}/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        await fetchAllData();
        setShowModal("");
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  // -----------------------------
  // Delete Appointment
  // -----------------------------
  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${API}/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  // -----------------------------
  // Update Lead
  // -----------------------------
  const updateLead = async (leadId: string, updateData: any) => {
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${API}/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        await fetchAllData();
        setShowModal("");
        setSelectedLead(null);
      }
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  // -----------------------------
  // Convert Lead to Appointment
  // -----------------------------
  const convertLead = async (leadId: string, appointmentData: any) => {
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${API}/leads/${leadId}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (res.ok) {
        await fetchAllData();
        setShowModal("");
        setSelectedLead(null);
        alert("Lead converted to appointment successfully!");
      }
    } catch (error) {
      console.error("Error converting lead:", error);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // -----------------------------
  // KPIs
  // -----------------------------
  const today = new Date().toISOString().split("T")[0];
  const todayBookings = appointments.filter((a) => a.preferred_date === today);
  const pendingBookings = appointments.filter((a) => a.status === "pending");
  const revenue = appointments.length * 120;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Navigation Items
  // -----------------------------
  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "appointments", label: "Appointments", icon: <Calendar className="w-5 h-5" /> },
    { id: "leads", label: "Leads", icon: <PhoneCall className="w-5 h-5" /> },
    { id: "inventory", label: "Inventory", icon: <Package className="w-5 h-5" /> },
    { id: "staff", label: "Staff", icon: <Users className="w-5 h-5" /> },
    { id: "salaries", label: "Salaries", icon: <Wallet className="w-5 h-5" /> },
  ];

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="flex h-screen bg-slate-900">
      {/* SINGLE Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-white">CareOps</h1>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-medium text-sm text-white">
                  {currentUser?.username || "Admin"}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {navItems.find((n) => n.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-slate-400">
                  {activeTab === "overview" && "Monitor your business at a glance"}
                  {activeTab === "appointments" && `${appointments.length} total appointments`}
                  {activeTab === "leads" && `${leads.length} total leads`}
                  {activeTab === "inventory" && `${inventory.length} items in stock`}
                  {activeTab === "staff" && `${staff.length} team members`}
                  {activeTab === "salaries" && `${salaries.length} salary records`}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Debug Info */}
                <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 font-mono">
                    Debug: Appointments: {appointments.length} | Staff: {staff.length} | 
                    Leads: {leads.length} | Inventory: {inventory.length} | Salaries: {salaries.length}
                  </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Today's Bookings"
                    value={todayBookings.length}
                    icon={<Calendar className="w-6 h-6" />}
                    color="blue"
                    trend="+12%"
                  />
                  <StatCard
                    title="Pending Requests"
                    value={pendingBookings.length}
                    icon={<Clock className="w-6 h-6" />}
                    color="yellow"
                    trend="-5%"
                  />
                  <StatCard
                    title="Total Staff"
                    value={staff.length}
                    icon={<Users className="w-6 h-6" />}
                    color="green"
                  />
                  <StatCard
                    title="Revenue"
                    value={`$${revenue.toLocaleString()}`}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="purple"
                    trend="+23%"
                  />
                </div>

                {/* Alerts */}
                {lowStockAlerts && lowStockAlerts.count > 0 && (
                  <div className="bg-orange-900/20 border border-orange-700 rounded-2xl p-6 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-orange-200">Low Stock Alert</p>
                      <p className="text-sm text-orange-300">
                        {lowStockAlerts.count} items are running low on stock
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("inventory")}
                      className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
                    >
                      View Items
                    </button>
                  </div>
                )}

                {/* Grid Layout */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {/* Recent Appointments */}
                  <div className="col-span-2 bg-slate-800 rounded-2xl border border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">Recent Appointments</h2>
                      <button
                        onClick={() => setActiveTab("appointments")}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-auto">
                      {appointments.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No appointments yet</p>
                      ) : (
                        appointments.slice(0, 8).map((appt) => (
                          <div
                            key={appt.id}
                            className="p-4 bg-slate-700/50 rounded-xl flex justify-between items-center hover:bg-slate-700 transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-white">
                                {appt.service_type}
                              </p>
                              <p className="text-sm text-slate-400">
                                {appt.preferred_date} • {appt.time_slot}
                              </p>
                            </div>
                            <StatusBadge status={appt.status} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                    <h2 className="text-xl font-bold mb-6 text-white">Quick Stats</h2>
                    <div className="space-y-4">
                      <QuickStat
                        label="Active Staff"
                        value={staff.filter((s) => s.is_active !== false).length}
                        total={staff.length}
                      />
                      <QuickStat
                        label="Completed Today"
                        value={
                          appointments.filter(
                            (a) =>
                              a.status === "completed" && a.preferred_date === today
                          ).length
                        }
                        total={todayBookings.length || 1}
                      />
                      <QuickStat
                        label="New Leads"
                        value={leads.filter((l) => l.status === "new").length}
                        total={leads.length || 1}
                      />
                      <QuickStat
                        label="Low Stock Items"
                        value={lowStockAlerts?.count || 0}
                        total={inventory.length || 1}
                        alert={lowStockAlerts?.count > 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Leads Pipeline */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Lead Pipeline</h2>
                    <button
                      onClick={() => setActiveTab("leads")}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Manage Leads →
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <PipelineCard
                      label="New"
                      value={leads.filter((l) => l.status === "new").length}
                      color="blue"
                    />
                    <PipelineCard
                      label="Contacted"
                      value={leads.filter((l) => l.status === "contacted").length}
                      color="yellow"
                    />
                    <PipelineCard
                      label="Qualified"
                      value={leads.filter((l) => l.status === "qualified").length}
                      color="purple"
                    />
                    <PipelineCard
                      label="Converted"
                      value={leads.filter((l) => l.status === "converted").length}
                      color="green"
                    />
                    <PipelineCard
                      label="Lost"
                      value={leads.filter((l) => l.status === "lost").length}
                      color="red"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">All Appointments</h2>
                    <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>Confirmed</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {appointments.length === 0 ? (
                      <p className="text-slate-400 text-center py-12">No appointments found</p>
                    ) : (
                      appointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="p-5 bg-slate-700/50 rounded-xl flex justify-between items-center hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-white">{appt.service_type}</h3>
                              <StatusBadge status={appt.status} />
                            </div>
                            <p className="text-sm text-slate-400">
                              Customer: {appt.customer_username} • {appt.preferred_date} •{" "}
                              {appt.time_slot}
                            </p>
                            {appt.assigned_staff_name && (
                              <p className="text-sm text-blue-400 mt-1">
                                Staff: {appt.assigned_staff_name}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedAppointment(appt);
                                setShowModal("editAppointment");
                              }}
                              className="p-2 hover:bg-blue-900/50 rounded-lg text-blue-400"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteAppointment(appt.id)}
                              className="p-2 hover:bg-red-900/50 rounded-lg text-red-400"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leads Tab */}
            {activeTab === "leads" && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Lead Management</h2>
                    <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      <option>All Leads</option>
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Qualified</option>
                      <option>Converted</option>
                      <option>Lost</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {leads.length === 0 ? (
                      <p className="text-slate-400 text-center py-12">No leads found</p>
                    ) : (
                      leads.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-5 bg-slate-700/50 rounded-xl flex justify-between items-center hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-white">{lead.name}</h3>
                              <StatusBadge status={lead.status} isLead />
                            </div>
                            <p className="text-sm text-slate-400">
                              {lead.email} • {lead.phone_number}
                            </p>
                            <p className="text-sm text-slate-300 mt-1">
                              Service: {lead.service_interest}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                                Priority: {lead.ai_priority}
                              </span>
                              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                                Confidence: {(lead.ai_confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowModal("editLead");
                              }}
                              className="p-2 hover:bg-blue-900/50 rounded-lg text-blue-400"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {lead.status !== "converted" && (
                              <button
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowModal("convertLead");
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                              >
                                <ArrowRight className="w-4 h-4" />
                                Convert
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-5 h-5 inline mr-2" />
                      Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {inventory.length === 0 ? (
                      <p className="text-slate-400 text-center py-12">No inventory items found</p>
                    ) : (
                      inventory.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 bg-slate-700/50 rounded-xl flex justify-between items-center hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-white">{item.item_name}</h3>
                              {item.is_low_stock && (
                                <span className="px-3 py-1 bg-orange-900/50 text-orange-300 text-sm rounded-full">
                                  Low Stock
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Category</p>
                                <p className="font-medium text-slate-300">{item.category}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Supplier</p>
                                <p className="font-medium text-slate-300">{item.supplier}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Quantity</p>
                                <p className="font-medium text-slate-300">{item.quantity} units</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Price</p>
                                <p className="font-medium text-slate-300">${item.price}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Staff Tab */}
            {activeTab === "staff" && (
              <motion.div
                key="staff"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Staff Members</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <UserPlus className="w-5 h-5 inline mr-2" />
                      Add Staff
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {staff.length === 0 ? (
                      <p className="text-slate-400 text-center py-12 col-span-2">No staff members found</p>
                    ) : (
                      staff.map((s) => (
                        <div
                          key={s.id}
                          className="p-6 bg-gradient-to-br from-slate-700/50 to-slate-700/30 rounded-xl border border-slate-600"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                              <UserCircle className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1 text-white">{s.username}</h3>
                              <p className="text-sm text-slate-400 mb-3">{s.email}</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-slate-500">Phone</p>
                                  <p className="font-medium text-slate-300">{s.phone_number}</p>
                                </div>
                                {s.department && (
                                  <div>
                                    <p className="text-slate-500">Department</p>
                                    <p className="font-medium text-slate-300">{s.department}</p>
                                  </div>
                                )}
                                {s.hourly_rate && (
                                  <div>
                                    <p className="text-slate-500">Hourly Rate</p>
                                    <p className="font-medium text-slate-300">${s.hourly_rate}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Salaries Tab */}
            {activeTab === "salaries" && (
              <motion.div
                key="salaries"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Salary Records</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-5 h-5 inline mr-2" />
                      Add Salary Record
                    </button>
                  </div>

                  <div className="space-y-3">
                    {salaries.length === 0 ? (
                      <p className="text-slate-400 text-center py-12">No salary records found</p>
                    ) : (
                      salaries.map((salary) => (
                        <div
                          key={salary.id}
                          className="p-5 bg-slate-700/50 rounded-xl flex justify-between items-center hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 text-white">
                              {salary.staff_name}
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Period</p>
                                <p className="font-medium text-slate-300">
                                  {salary.period_start} to {salary.period_end}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">Payment Date</p>
                                <p className="font-medium text-slate-300">{salary.payment_date}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Amount</p>
                                <p className="font-bold text-green-400 text-xl">
                                  ${salary.amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      {showModal === "editAppointment" && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          staff={staff}
          onUpdate={(data) => updateAppointment(selectedAppointment.id, data)}
          onClose={() => {
            setShowModal("");
            setSelectedAppointment(null);
          }}
        />
      )}

      {showModal === "editLead" && selectedLead && (
        <EditLeadModal
          lead={selectedLead}
          onUpdate={(data) => updateLead(selectedLead.id, data)}
          onClose={() => {
            setShowModal("");
            setSelectedLead(null);
          }}
        />
      )}

      {showModal === "convertLead" && selectedLead && (
        <ConvertLeadModal
          lead={selectedLead}
          onConvert={(data) => convertLead(selectedLead.id, data)}
          onClose={() => {
            setShowModal("");
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
}

/* -----------------------------
   Components
------------------------------ */

function StatCard({ title, value, icon, color, trend }: any) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    yellow: "from-yellow-500 to-orange-500",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center text-white`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              trend.startsWith("+")
                ? "bg-green-900/50 text-green-300"
                : "bg-red-900/50 text-red-300"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold mb-1 text-white">{value}</p>
      <p className="text-sm text-slate-400">{title}</p>
    </motion.div>
  );
}

function StatusBadge({ status, isLead = false }: any) {
  const getColors = () => {
    if (isLead) {
      switch (status) {
        case "new":
          return "bg-blue-900/50 text-blue-300";
        case "contacted":
          return "bg-yellow-900/50 text-yellow-300";
        case "qualified":
          return "bg-purple-900/50 text-purple-300";
        case "converted":
          return "bg-green-900/50 text-green-300";
        case "lost":
          return "bg-red-900/50 text-red-300";
        default:
          return "bg-slate-700 text-slate-300";
      }
    } else {
      switch (status) {
        case "pending":
          return "bg-yellow-900/50 text-yellow-300";
        case "confirmed":
          return "bg-green-900/50 text-green-300";
        case "completed":
          return "bg-blue-900/50 text-blue-300";
        case "cancelled":
          return "bg-red-900/50 text-red-300";
        default:
          return "bg-slate-700 text-slate-300";
      }
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColors()}`}>
      {status}
    </span>
  );
}

function QuickStat({ label, value, total, alert = false }: any) {
  const percentage = (value / total) * 100 || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`font-bold ${alert ? "text-orange-400" : "text-white"}`}>
          {value}/{total}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            alert ? "bg-orange-500" : "bg-blue-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PipelineCard({ label, value, color }: any) {
  const colors = {
    blue: "from-blue-400 to-blue-600",
    yellow: "from-yellow-400 to-orange-500",
    purple: "from-purple-400 to-purple-600",
    green: "from-green-400 to-emerald-600",
    red: "from-red-400 to-red-600",
  };

  return (
    <div className="text-center p-6 bg-slate-700/50 rounded-xl border border-slate-600">
      <div
        className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${colors[color]} rounded-full flex items-center justify-center text-white text-2xl font-bold`}
      >
        {value}
      </div>
      <p className="text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
}

// Modal components remain the same but with dark theme...
function EditAppointmentModal({ appointment, staff, onUpdate, onClose }: any) {
  const [status, setStatus] = useState(appointment.status);
  const [assignedStaff, setAssignedStaff] = useState(
    appointment.assigned_staff_id || ""
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Edit Appointment</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Assign Staff</label>
            <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
            >
              <option value="">Unassigned</option>
              {staff.map((s: any) => (
                <option key={s.user_id} value={s.user_id}>
                  {s.username}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              onUpdate({
                status,
                assigned_staff_id: assignedStaff || null,
              })
            }
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium"
          >
            Update Appointment
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function EditLeadModal({ lead, onUpdate, onClose }: any) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Edit Lead</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              rows={4}
            />
          </div>

          <button
            onClick={() => onUpdate({ status, notes })}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium"
          >
            Update Lead
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ConvertLeadModal({ lead, onConvert, onClose }: any) {
  const [preferredDate, setPreferredDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState(lead.notes || "");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Convert to Appointment</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Preferred Date</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Time Slot</label>
            <input
              type="time"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              placeholder="Service location"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              rows={3}
            />
          </div>

          <button
            onClick={() =>
              onConvert({
                preferred_date: preferredDate,
                time_slot: timeSlot,
                location,
                notes,
              })
            }
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium disabled:opacity-50"
            disabled={!preferredDate || !location}
          >
            Convert to Appointment
          </button>
        </div>
      </motion.div>
    </div>
  );
}