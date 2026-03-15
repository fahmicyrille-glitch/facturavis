import AutoLogout from '@/components/AutoLogout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 🐕‍🦺 Le vigile invisible est activé pour tout le Dashboard */}
      <AutoLogout />

      {/* Le contenu normal de la page (ton tableau, tes paramètres...) */}
      {children}
    </>
  );
}
