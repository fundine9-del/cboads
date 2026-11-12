import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, title, body, image_urls, published")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Post</h2>
      <PostForm initial={post} />
    </div>
  );
}
