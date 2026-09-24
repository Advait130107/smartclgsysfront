
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

export default function StudentFeedbackPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      setSuccess("Feedback submitted");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <AppShell role="student">
      <h1>Give feedback</h1>
      <form className="panel stack" onSubmit={onSubmit}>
        <label>
          Message
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button className="btn" type="submit">Submit feedback</button>
      </form>
    </AppShell>
  );
}
