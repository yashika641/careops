import { Outlet, Link, useLocation } from "react-router";
import { Home, Users, Package, LayoutDashboard } from "lucide-react";

export function RootLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold text-primary">CareOps Lite</h1>
          <p className="text-sm text-muted-foreground mt-1">Operations dashboard</p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <NavLink to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink to="/leads" icon={<Users className="w-5 h-5" />}>
              Leads
            </NavLink>
            <NavLink to="/inventory" icon={<Package className="w-5 h-5" />}>
              Inventory
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
