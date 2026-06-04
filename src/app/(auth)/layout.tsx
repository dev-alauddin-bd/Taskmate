export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout min-h-screen bg-[var(--surface-hover)] flex items-center justify-center">
      {children}
    </div>
  )
}
