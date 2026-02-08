"use client";

import { useMemo, useState } from "react";

type SubmitState = {
    error: string | null;
    successUrl: string | null;
    isSubmitting: boolean;
};

type PdfErrors = {
    file?: string;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.0.11:8000";
const PDF_ENDPOINT = "/links/pdf";

export default function AddPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [submit, setSubmit] = useState<SubmitState>({
        error: null,
        successUrl: null,
        isSubmitting: false,
    });
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const fieldErrors = useMemo<PdfErrors>(() => {
        const errors: PdfErrors = {};
        if (!file) {
            errors.file = "PDF file is required.";
        } else if (file.type !== "application/pdf") {
            errors.file = "File must be a PDF.";
        }
        return errors;
    }, [file]);

    const validationErrors = useMemo(
        () => Object.values(fieldErrors).filter(Boolean),
        [fieldErrors]
    );

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitAttempted(true);
        if (validationErrors.length > 0) {
            setSubmit({ error: validationErrors[0], successUrl: null, isSubmitting: false });
            return;
        }

        if (!file) {
            return;
        }

        setSubmit({ error: null, successUrl: null, isSubmitting: true });
        try {
            const body = new FormData();
            body.append("file", file);

            const response = await fetch(`${API_BASE_URL}${PDF_ENDPOINT}`, {
                method: "POST",
                body,
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
                    <div className="option-title">Option 2: PDF</div>
                    <select className="blue-select" aria-label="Select Type">
                        <option>PDF</option>
                    </select>
                    <input
                        className="blue-input"
                        value={fileName}
                        onChange={(event) => setFileName(event.target.value)}
                        placeholder="File Name"
                    />
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                            className="blue-input"
                            type="text"
                            value={file?.name ?? ""}
                            readOnly
                            placeholder="Upload File"
                        />
                        <label className="blue-button" style={{ cursor: "pointer" }}>
                            Browse
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                                style={{ display: "none" }}
                            />
                        </label>
                    </div>
                    {submitAttempted && fieldErrors.file && (
                        <span className="error">{fieldErrors.file}</span>
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
