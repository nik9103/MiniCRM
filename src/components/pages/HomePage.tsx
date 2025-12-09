import { Role } from '../../App';
import { AthleteDashboard } from '../dashboards/AthleteDashboard';
import { JudgeDashboard } from '../dashboards/JudgeDashboard';
import { ManagerDashboard } from '../dashboards/ManagerDashboard';

interface HomePageProps {
  role?: Role;
}

export function HomePage({ role = 'athlete' }: HomePageProps) {
  switch (role) {
    case 'athlete':
      return <AthleteDashboard />;
    case 'judge':
      return <JudgeDashboard />;
    case 'manager':
    case 'admin':
      return <ManagerDashboard />;
    default:
      return <AthleteDashboard />;
  }
}
