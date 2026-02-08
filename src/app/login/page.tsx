"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LoginState = {
    username: string;
    password: string;
};

type LoginErrors = {
    username?: string;
    password?: string;
};

type SubmitState = {
    error: string | null;
    isSubmitting: boolean;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.0.11:8000";

export default function LoginPage() {
    const [form, setForm] = useState<LoginState>({ username: "", password: "" });
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submit, setSubmit] = useState<SubmitState>({
        error: null,
        isSubmitting: false,
    });
    const router = useRouter();

    const fieldErrors = useMemo<LoginErrors>(() => {
        const errors: LoginErrors = {};
        if (!form.username.trim()) {
            errors.username = "Username is required.";
        }
        if (!form.password.trim()) {
            errors.password = "Password is required.";
        }
        return errors;
    }, [form]);

    const validationErrors = useMemo(
        () => Object.values(fieldErrors).filter(Boolean),
        [fieldErrors]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitAttempted(true);
        if (validationErrors.length > 0) {
            return;
        }

        setSubmit({ error: null, isSubmitting: true });
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username.trim(),
                    password: form.password.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error("Invalid credentials.");
            }

            const data = (await response.json()) as { token: string };
            localStorage.setItem("auth_token", data.token);
            router.push("/dashboard");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Login failed.";
            setSubmit({ error: message, isSubmitting: false });
        }
    };

    return (
        <main className="login-shell fade-in">
            <div className="login-stack">
                <div className="logo-box">
                    <img className="app-logo" src="/logo.svg" alt="Link Generator logo" />
                </div>

                <div className="login-card">
                    <div className="login-title">LOGIN</div>
                    <form className="form-grid" onSubmit={handleSubmit}>
                        <input
                            className="login-field"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Username"
                            aria-label="Username"
                            required
                        />
                        {submitAttempted && fieldErrors.username && (
                            <span className="error">{fieldErrors.username}</span>
                        )}
                        <input
                            className="login-field"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            aria-label="Password"
                            required
                        />
                        {submitAttempted && fieldErrors.password && (
                            <span className="error">{fieldErrors.password}</span>
                        )}
                        <div>ReCAPTCHA</div>
                        <button className="login-button" type="submit" disabled={submit.isSubmitting}>
                            {submit.isSubmitting ? "LOGGING IN" : "LOGIN"}
                        </button>
                        {submit.error && <span className="error">{submit.error}</span>}
                    </form>
                </div>

            </div>
        </main>
    );
}
