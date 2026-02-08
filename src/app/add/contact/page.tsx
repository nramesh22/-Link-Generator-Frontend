"use client";

import React, { useMemo, useState } from "react";

type ContactFormState = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    company: string;
    title: string;
    website: string;
    notes: string;
};

type SubmitState = {
    error: string | null;
    successUrl: string | null;
    isSubmitting: boolean;
};

type ContactErrors = {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    website?: string;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.0.11:8000";
const CONTACT_ENDPOINT = "/links/contact";

export default function AddContactPage() {
    const [form, setForm] = useState<ContactFormState>({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        company: "",
        title: "",
        website: "",
        notes: "",
    });
    const [submit, setSubmit] = useState<SubmitState>({
        error: null,
        successUrl: null,
        isSubmitting: false,
    });
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const fieldErrors = useMemo<ContactErrors>(() => {
        const errors: ContactErrors = {};
        if (!form.firstName.trim()) {
            errors.firstName = "First name is required.";
        }
        if (!form.lastName.trim()) {
            errors.lastName = "Last name is required.";
        }
        if (!form.phone.trim()) {
            errors.phone = "Phone is required.";
        }
        if (!form.email.trim()) {
            errors.email = "Email is required.";
        }
        if (form.website.trim() && !/^https?:\/\//i.test(form.website.trim())) {
            errors.website = "Website must start with http:// or https://.";
        }
        return errors;
    }, [form]);

    const validationErrors = useMemo(
        () => Object.values(fieldErrors).filter(Boolean),
        [fieldErrors]
    );

    const onChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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
            const response = await fetch(`${API_BASE_URL}${CONTACT_ENDPOINT}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: form.firstName.trim(),
                    last_name: form.lastName.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    company: form.company.trim() || null,
                    title: form.title.trim() || null,
                    website: form.website.trim() || null,
                    notes: form.notes.trim() || null,
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
                    <img className="app-logo" src="/mylogo.png" alt="Link Generator logo" />
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
                    <div className="option-title">Option 1: Contact</div>
                    <select className="blue-select" aria-label="Select Type">
                        <option>Contact</option>
                    </select>
                    <input
                        className="blue-input"
                        name="firstName"
                        value={form.firstName}
                        onChange={onChange}
                        placeholder="First Name"
                        required
                    />
                    {submitAttempted && fieldErrors.firstName && (
                        <span className="error">{fieldErrors.firstName}</span>
                    )}
                    <input
                        className="blue-input"
                        name="lastName"
                        value={form.lastName}
                        onChange={onChange}
                        placeholder="Last Name"
                        required
                    />
                    {submitAttempted && fieldErrors.lastName && (
                        <span className="error">{fieldErrors.lastName}</span>
                    )}
                    <input
                        className="blue-input"
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="Phone/Mobile (Personal)"
                        required
                    />
                    {submitAttempted && fieldErrors.phone && (
                        <span className="error">{fieldErrors.phone}</span>
                    )}
                    <input
                        className="blue-input"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="Email"
                        required
                    />
                    {submitAttempted && fieldErrors.email && (
                        <span className="error">{fieldErrors.email}</span>
                    )}
                    <input
                        className="blue-input"
                        name="company"
                        value={form.company}
                        onChange={onChange}
                        placeholder="Company Name"
                    />
                    <input
                        className="blue-input"
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        placeholder="Job Title"
                    />
                    <input
                        className="blue-input"
                        name="website"
                        value={form.website}
                        onChange={onChange}
                        placeholder="Website"
                    />
                    {submitAttempted && fieldErrors.website && (
                        <span className="error">{fieldErrors.website}</span>
                    )}
                    <textarea
                        className="blue-input"
                        name="notes"
                        value={form.notes}
                        onChange={onChange}
                        placeholder="Notes"
                    />

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
