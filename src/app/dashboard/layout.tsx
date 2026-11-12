import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#fffce6]">
      <header className="bg-white border-b border-[#af9e73]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#010101]">
            Compassion Ministry CBO — Admin
          </h1>
          <nav className="flex items-center gap-4 text-sm text-[#010101]">
            <Link href="/dashboard" className="text-[#010101] hover:text-[#9a3f2c]">
              Posts
            </Link>
            <Link href="/dashboard/new" className="text-[#010101] hover:text-[#9a3f2c]">
              New Post
            </Link>
            <Link href="/dashboard/users" className="text-[#010101] hover:text-[#9a3f2c]">
              Users
            </Link>
            <Link href="/dashboard/change-password" className="text-[#010101] hover:text-[#9a3f2c]">
              Change Password
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-[#010101] hover:text-red-600"
              >
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
