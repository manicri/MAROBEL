import { useAuth } from "../context/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import AdminOverview from "./AdminOverview";
import ScheduleAdminDashboard from "./ScheduleAdminDashboard";
import PushSetupCard from "./PushSetupCard";

export default function AdminPanel() {
  const { canManageServices } = useAuth();

  return <>
    <PushSetupCard />
    <AdminOverview />
    {canManageServices ? <AdminDashboard /> : <ScheduleAdminDashboard />}
  </>;
}
