import { useAuth } from "../context/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import AdminNotificationBridge from "./AdminNotificationBridge";
import AdminOverview from "./AdminOverview";
import ScheduleAdminDashboard from "./ScheduleAdminDashboard";

export default function AdminPanel() {
  const { canManageServices } = useAuth();

  return <>
    <AdminNotificationBridge />
    <AdminOverview />
    {canManageServices ? <AdminDashboard /> : <ScheduleAdminDashboard />}
  </>;
}
