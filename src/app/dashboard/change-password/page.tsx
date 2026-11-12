"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully.");
      setPassword("");
      setConfirm("");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block text-sm font-medium text-[#010101] mb-1">
            New password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#af9e73] rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#9a3f2c]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#010101] mb-1">
            Confirm new password
          </label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-[#af9e73] rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#9a3f2c]"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
            {success}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#9a3f2c] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#9a3f2c] disabled:opacity-60 transition"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
