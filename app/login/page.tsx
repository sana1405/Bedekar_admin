"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const user = await loginAdmin(String(form.get("mobile") ?? ""), String(form.get("password") ?? ""));
      if (user.role !== "admin") throw new Error("Administrator access is required");
      window.localStorage.setItem("aurelia_admin_token", user.token);
      window.localStorage.setItem("aurelia_admin_role", user.role);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login-card">
        <section>
          <div className="login-brand">
            <i>B</i>
            <span>
              BEDEKAR<small>FINE JEWELS</small>
            </span>
          </div>

          <p className="eyebrow">ADMIN CONSOLE</p>
          <h1>Welcome back.</h1>
          <p className="muted">Sign in to curate your jewellery collection.</p>

          <form onSubmit={handleSubmit}>
            <label>
              Mobile number
              <input name="mobile" inputMode="numeric" placeholder="Enter registered mobile number" required />
            </label>
            <label>
              Password
              <div className="password">
                <input name="password" type={showPassword ? "text" : "password"} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && <p className="login-error">{error}</p>}
            <button className="gold full" disabled={loading}>
              {loading ? "Signing in…" : <>Sign in to dashboard <span>→</span></>}
            </button>
          </form>
        </section>

        <aside>
          <p>EST. 1994</p>
          <div className="login-jewel">✦</div>
          <h2>Crafted to be<br />cherished forever.</h2>
          <span>Private access for Bedekar administrators</span>
        </aside>
      </div>
    </main>
  );
}
