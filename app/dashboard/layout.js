import DashboardShell from '@/components/DashboardShell';

export const metadata = {
  title: 'Dashboard – Vaulta',
  description: 'Manage your Vaulta savings and investments',
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
