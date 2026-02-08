"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LinkRow = {
    id: number;
    type: string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    company?: string | null;
    title?: string | null;
    website?: string | null;
    pdf_name?: string | null;
    url_name?: string | null;
    slug: string;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.0.11:8000";

export default function DashboardPage() {
    const router = useRouter();
    const [rows, setRows] = useState<LinkRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const load = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/links`);
            if (!response.ok) {
                throw new Error("Failed to load links.");
            }
            const data = (await response.json()) as LinkRow[];
            setRows(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load links.";
            setError(message);
        }
    };

    useEffect(() => {
        let active = true;
        const run = async () => {
            if (active) {
                await load();
            }
        };
        run();
        return () => {
            active = false;
        };
    }, []);

    const getEditHref = (row: LinkRow) => {
        if (row.type === "Contact") {
            return `/edit/contact/${row.id}`;
        }
        if (row.type === "PDF") {
            return `/edit/pdf/${row.id}`;
        }
        return `/edit/url/${row.id}`;
    };

    const handleDelete = async (row: LinkRow) => {
        if (!window.confirm("Delete this link?")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/links/${row.id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete link.");
            }
            await load();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete link.";
            setError(message);
        }
    };

    return (
        <main className="dashboard-shell fade-in">
            <header className="dash-top">
                <div className="dash-logo">
                    <img className="app-logo" src="/mylogo.png" alt="Link Generator logo" />
                </div>
                <div className="dash-actions">
                    <div className="dash-menu-wrap">
                        <button
                            className="dash-button"
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                        >
                        ADD NEW
                        </button>
                        {menuOpen && (
                            <div className="dash-menu" role="menu">
                                <a className="dash-menu-item" href="/add/contact" role="menuitem">
                                    Add Contact
                                </a>
                                <a className="dash-menu-item" href="/add/pdf" role="menuitem">
                                    Add PDF
                                </a>
                                <a className="dash-menu-item" href="/add/url" role="menuitem">
                                    Add URL
                                </a>
                            </div>
                        )}
                    </div>
                    <button
                        className="dash-button"
                        type="button"
                        onClick={() => {
                            localStorage.removeItem("auth_token");
                            router.replace("/login");
                        }}
                    >
                        LOGOUT
                    </button>
                </div>
            </header>

            <section>
                <table className="dash-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>F. Name</th>
                            <th>L. Name</th>
                            <th>Phone</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Title</th>
                            <th>Website</th>
                            <th>PDF</th>
                            <th>URL</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id}>
                                <td>{row.id}</td>
                                <td>{row.type}</td>
                                <td>{row.first_name ?? "-"}</td>
                                <td>{row.last_name ?? "-"}</td>
                                <td>{row.phone ?? "-"}</td>
                                <td>{row.mobile ?? "-"}</td>
                                <td>{row.email ?? "-"}</td>
                                <td>{row.company ?? "-"}</td>
                                <td>{row.title ?? "-"}</td>
                                <td>
                                    {row.website ? (
                                        <a className="dash-link" href={row.website}>
                                            {row.website}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td>{row.pdf_name ?? "-"}</td>
                                <td>{row.url_name ?? "-"}</td>
                                <td className="dash-actions-col">
                                    <a className="dash-link" href={getEditHref(row)}>
                                        Edit
                                    </a>
                                    <button
                                        className="dash-link"
                                        type="button"
                                        onClick={() => handleDelete(row)}
                                    >
                                        Delete
                                    </button>
                                    <a className="dash-link" href={`${API_BASE_URL}/${row.slug}`}>
                                        Link
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && !error && (
                            <tr>
                                <td colSpan={13}>No links yet.</td>
                            </tr>
                        )}
                        {error && (
                            <tr>
                                <td colSpan={13}>{error}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

        </main>
    );
}
