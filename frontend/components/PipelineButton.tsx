"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, runPipeline, type CurrentUser } from "@/lib/api";

export default function PipelineButton() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  async function handleRun() {
    setRunning(true);
    setMessage(null);
    try {
      const result = await runPipeline();
      setMessage(result.detail);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Pipeline trigger failed");
    } finally {
      setRunning(false);
    }
  }

  // Only admins can see or trigger this - matches the backend's
  // require_role(UserRole.ADMIN) on POST /api/pipeline/run. Hiding the
  // button is just UX; the real enforcement is server-side.
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="glass-panel m-4 flex items-center gap-4 px-6 py-4">
      <button
        onClick={handleRun}
        disabled={running}
        className="rounded-md bg-coastal-accent px-4 py-2 text-sm font-medium text-coastal-deep disabled:opacity-50"
      >
        {running ? "Running..." : "Run Pipeline"}
      </button>
      {message && <span className="text-sm text-slate-300">{message}</span>}
    </div>
  );
}