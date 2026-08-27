export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-white/20 selection:text-white">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
