"use client";

import { useMemo, useState } from "react";

type UrlFormState = {
    url: string;
    title: string;
    urlName: string;
};

type SubmitState = {
    error: string | null;
    successUrl: string | null;
    isSubmitting: boolean;
};

type UrlErrors = {
    url?: string;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.0.11:8000";
const URL_ENDPOINT = "/links/url";

export default function AddUrlPage() {
    const [form, setForm] = useState<UrlFormState>({ url: "", title: "", urlName: "" });
    const [submit, setSubmit] = useState<SubmitState>({
        error: null,
        successUrl: null,
        isSubmitting: false,
    });
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const fieldErrors = useMemo<UrlErrors>(() => {
        const errors: UrlErrors = {};
        if (!form.url.trim()) {
            errors.url = "URL is required.";
        } else if (!/^https?:\/\//i.test(form.url.trim())) {
            errors.url = "URL must start with http:// or https://.";
        }
        return errors;
    }, [form]);

    const validationErrors = useMemo(
        () => Object.values(fieldErrors).filter(Boolean),
        [fieldErrors]
    );

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitAttempted(true);
        if (validationErrors.length > 0) {
            setSubmit({ error: validationErrors[0], successUrl: null, isSubmitting: false });
            return;
        }

        setSubmit({ error: null, successUrl: null, isSubmitting: true });
        try {
            const response = await fetch(`${API_BASE_URL}${URL_ENDPOINT}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: form.url.trim(),
                    title: form.title.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create link.");
            }

            const data = (await response.json()) as { short_url: string };
            await navigator.clipboard.writeText(data.short_url);
            setSubmit({ error: null, successUrl: data.short_url, isSubmitting: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unexpected error.";
            setSubmit({ error: message, successUrl: null, isSubmitting: false });
        }
    };

    return (
        <main className="add-shell fade-in">
            <header className="add-header">
                <div className="dash-logo">
                    <img className="app-logo" src="/logo.svg" alt="Link Generator logo" />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <a className="dash-button" href="/dashboard">
                        BACK TO DASHBOARD
                    </a>
                    <button className="dash-button" type="button">
                        ADD NEW
                    </button>
                </div>
            </header>

            <section className="add-grid">
                <div className="option-card">
                    <div className="option-title">Option 3: URL</div>
                    <select className="blue-select" aria-label="Select Type">
                        <option>URL</option>
                    </select>
                    <input
                        className="blue-input"
                        name="urlName"
                        value={form.urlName}
                        onChange={onChange}
                        placeholder="URL Name"
                    />
                    <input
                        className="blue-input"
                        name="url"
                        value={form.url}
                        onChange={onChange}
                        placeholder="Enter URL"
                        required
                    />
                    {submitAttempted && fieldErrors.url && (
                        <span className="error">{fieldErrors.url}</span>
                    )}
                    <form onSubmit={handleSubmit}>
                        <button className="blue-button" type="submit" disabled={submit.isSubmitting}>
                            {submit.isSubmitting ? "Saving..." : "SAVE"}
                        </button>
                    </form>
                    {submit.error && <span className="error">{submit.error}</span>}
                </div>

                {submit.successUrl && (
                    <div className="success-card">
                        <div className="option-title">Link Successfully Created</div>
                        <div className="success-icon">✓</div>
                        <div>{submit.successUrl}</div>
                        <button
                            className="copy-button"
                            type="button"
                            onClick={() => navigator.clipboard.writeText(submit.successUrl ?? "")}
                        >
                            COPY
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
