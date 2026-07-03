import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { LandingPage } from "./components/pages/LandingPage";
import { LeadsPage } from "./components/pages/LeadsPage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { InventoryPage } from "./components/pages/InventoryPage";
import { NotFoundPage } from "./components/pages/NotFoundPage";
import { CustomerDashboard } from "./components/pages/customer_dashboard";
import { StaffDashboard } from "./components/pages/staff_dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "leads", Component: LeadsPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "inventory", Component: InventoryPage },
      { path: "customer", Component: CustomerDashboard },
      { path: "*", Component: NotFoundPage },
      { path: "staff", Component: StaffDashboard },
    ],
  },
]);