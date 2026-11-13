"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type MarqueItem = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export default function MarqueePage() {
  const supabase = createClient();
  const [items, setItems] = useState<MarqueItem[]>([]);
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await supabase
      .from("marque")
      .select("id, image_url, caption, sort_order, published, created_at")
      .order("sort_order", { ascending: true });
    setItems((data as MarqueItem[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select an image.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("marque-images")
        .upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage
        .from("marque-images")
        .getPublicUrl(path);

      const { error: insErr } = await supabase.from("marque").insert({
        image_url: urlData.publicUrl,
        caption: caption || null,
        sort_order: sortOrder,
        published,
      });
      if (insErr) throw insErr;

      setCaption("");
      setSortOrder(0);
      setPublished(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("marque").delete().eq("id", id);
    await load();
  }

  async function togglePublished(item: MarqueItem) {
    await supabase
      .from("marque")
      .update({ published: !item.published })
      .eq("id", item.id);
    await load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Marquee Images</h2>

      <form
        onSubmit={handleUpload}
        className="bg-white rounded-xl shadow p-6 space-y-4 mb-8 max-w-2xl"
      >
        <div>
          <label className="block text-sm font-medium text-[#010101] mb-1">
            Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[#464847] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#fbe0d5] file:text-[#9a3f2c] hover:file:bg-[#fbe0d5]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#010101] mb-1">
            Caption (optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border border-[#af9e73] rounded-lg px-3 py-2 text-[#010101] focus:outline-none focus:ring-2 focus:ring-[#9a3f2c]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#010101] mb-1">
            Sort order
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full border border-[#af9e73] rounded-lg px-3 py-2 text-[#010101] focus:outline-none focus:ring-2 focus:ring-[#9a3f2c]"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="published"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="published" className="text-sm text-[#010101]">
            Published
          </label>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#9a3f2c] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#874232] disabled:opacity-60 transition"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-[#464847]">No marquee images yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.caption ?? ""}
                className="w-full h-32 object-cover"
              />
              <div className="p-3 space-y-2">
                {item.caption && (
                  <p className="text-sm text-[#010101] truncate">{item.caption}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => togglePublished(item)}
                    className="text-[#9a3f2c] hover:underline"
                  >
                    {item.published ? "Published" : "Draft"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
