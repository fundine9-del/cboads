import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function updateRole(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const role = String(formData.get("role"));
  const supabase = await createClient();
  await supabase.from("users").update({ role }).eq("id", id);
  revalidatePath("/dashboard/users");
}

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users</h2>
      <p className="text-sm text-[#464847] mb-4">
        Manage user roles. Only admins can access this panel.
      </p>

      {!users || users.length === 0 ? (
        <p className="text-[#464847]">No users found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#fffce6] text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.email ?? u.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === "admin"
                          ? "text-[#9a3f2c] font-semibold"
                          : "text-[#464847]"
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#464847]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateRole} className="flex gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="border border-[#af9e73] rounded px-2 py-1 text-sm text-black"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1 border border-[#af9e73] rounded text-sm hover:bg-[#fffce6]"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
