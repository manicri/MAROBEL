import { useAuth } from "../context/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import AdminOverview from "./AdminOverview";
import ScheduleAdminDashboard from "./ScheduleAdminDashboard";

export default function AdminPanel() {
  const { canManageServices } = useAuth();

  return <>
    <AdminOverview />
    {canManageServices ? <AdminDashboard /> : <ScheduleAdminDashboard />}
  </>;
}
