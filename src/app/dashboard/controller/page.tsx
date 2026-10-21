import { redirect } from 'next/navigation';

export default function ControllerDashboardPage() {
  redirect('/admin/requests');
}
