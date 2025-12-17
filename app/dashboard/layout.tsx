// app/dashboard/layout.tsx
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative bg-zinc-50 dark:bg-zinc-900">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72 pb-10 min-h-screen">
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}