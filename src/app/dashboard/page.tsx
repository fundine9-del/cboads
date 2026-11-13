import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function deletePost(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, body, image_urls, published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Content Posts</h2>
        <Link
          href="/dashboard/new"
          className="bg-[#9a3f2c] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#9a3f2c] transition"
        >
          + New Post
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="text-[#010101]">No posts yet. Create your first one.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {post.title || "Untitled"}
                </h3>
                <p className="text-sm text-[#010101] line-clamp-2 mt-1">
                  {post.body}
                </p>
                <p className="text-xs text-[#010101] mt-2">
                  {post.published ? "Published" : "Draft"} &middot;{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                  {post.image_urls?.length
                    ? ` · ${post.image_urls.length} image(s)`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/dashboard/edit/${post.id}`}
                  className="px-3 py-1.5 border border-[#af9e73] rounded-lg text-sm hover:bg-[#fffce6]"
                >
                  Edit
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    className="px-3 py-1.5 border border-[#9a3f2c] text-red-600 rounded-lg text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
