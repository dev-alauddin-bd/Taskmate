import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen   bg-[var(--background)]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 ">

          {children}

        </main>
      </div>
    </div>
  )
}
