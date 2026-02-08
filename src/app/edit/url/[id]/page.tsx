"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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

type LinkDetail = {
    id: number;
    type: string;
    slug: string;
    url?: {
        url: string;
        title?: string | null;
    };
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.0.11:8000";

export default function EditUrlPage() {
    const params = useParams();
    const id = String(params.id ?? "");
    const [form, setForm] = useState<UrlFormState>({ url: "", title: "", urlName: "" });
    const [submit, setSubmit] = useState<SubmitState>({
        error: null,
        successUrl: null,
        isSubmitting: false,
    });
    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/links/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to load link.");
                }
                const data = (await response.json()) as LinkDetail;
                if (data.type !== "URL" || !data.url) {
                    throw new Error("URL link not found.");
                }
                setForm({
                    url: data.url.url,
                    title: data.url.title ?? "",
                    urlName: data.url.title ?? "",
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to load link.";
                setSubmit({ error: message, successUrl: null, isSubmitting: false });
            }
        };
        if (id) {
            load();
        }
    }, [id]);

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
            const response = await fetch(`${API_BASE_URL}/links/${id}/url`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: form.url.trim(),
                    title: form.title.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update link.");
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
                <div className="dash-logo">LOGO</div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <a className="dash-button" href="/dashboard">
                        BACK TO DASHBOARD
                    </a>
                </div>
            </header>

            <section className="add-grid">
                <div className="option-card">
                    <div className="option-title">Edit URL</div>
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
                        <div className="option-title">Link Successfully Updated</div>
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
