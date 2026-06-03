import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import AdminDashboard from './Dashboard';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  if (!isAdminAuthenticated()) {
    redirect('/admin/login');
  }
  return <AdminDashboard supabaseConfigured={isSupabaseConfigured()} />;
}
