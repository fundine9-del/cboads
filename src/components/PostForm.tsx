"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  id?: string;
  title?: string | null;
  body?: string;
  image_urls?: string[] | null;
  published?: boolean;
};

export default function PostForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [existingImages, setExistingImages] = useState<string[]>(
    initial?.image_urls ?? []
  );
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Upload new files
      const newUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("content-images")
          .upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage
          .from("content-images")
          .getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }

      const image_urls = [...existingImages, ...newUrls];

      if (initial?.id) {
        const { error } = await supabase
          .from("posts")
          .update({ title, body, image_urls, published })
          .eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("posts")
          .insert({ title, body, image_urls, published });
        if (error) throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <label className="block text-sm font-medium text-[#010101] mb-1">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[#af9e73] rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#9a3f2c]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#010101] mb-1">
          Body text
        </label>
        <textarea
          required
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border border-[#af9e73] rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#9a3f2c]"
        />
      </div>

      {/* Multi-image uploader: square boxes with dashed borders */}
      <div>
        <label className="block text-sm font-medium text-[#010101] mb-2">
          Images
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Existing images */}
          {existingImages.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-[#af9e73] bg-[#fffce6]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
              >
                ×
              </button>
            </div>
          ))}

          {/* New file previews */}
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-[#af9e73] bg-[#fbe0d5]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
              >
                ×
              </button>
            </div>
          ))}

          {/* Add more box */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-400 bg-white hover:bg-[#fffce6] flex flex-col items-center justify-center text-[#010101] hover:text-[#9a3f2c] transition"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-xs mt-1">Add image</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            setFiles((prev) => [...prev, ...picked]);
            e.target.value = "";
          }}
          className="hidden"
        />
        <p className="text-xs text-[#010101] mt-2">
          You can select multiple images at once. Click "Add image" to add more.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 text-[#9a3f2c]"
        />
        <label htmlFor="published" className="text-sm text-[#010101]">
          Published (visible on website)
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#9a3f2c] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#9a3f2c] disabled:opacity-60 transition"
        >
          {loading ? "Saving..." : initial?.id ? "Update Post" : "Create Post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2 border border-[#af9e73] rounded-lg hover:bg-[#fffce6]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
