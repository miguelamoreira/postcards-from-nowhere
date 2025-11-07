import type { Postcard } from "../types"

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

import { v4 as uuidv4 } from "uuid";

/**
 * Fetch postcards from the API.
 * @param source Optional: "seed" | "user" to filter by source.
 * @returns Array of postcards
 */
export async function fetchPostcards(options?: { source?: "seed" | "user"; scene?: string; grouped?: boolean }): Promise<Postcard[]> {
    const url = new URL(`${API_BASE}/postcards`);

    if (options?.source) url.searchParams.append("source", options.source);
    if (options?.scene) url.searchParams.append("scene", options.scene);
    if (options?.grouped) url.searchParams.append("grouped", "true");

    const res = await fetch(url.toString());
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch postcards");
    }

    const data = await res.json();

    if (Array.isArray(data)) {
        return data as Postcard[];
    }

    if (data && typeof data === "object") {
        const flattened = Object.values(data).flat() as unknown[];
        return flattened as Postcard[];
    }

    return [];
}


/**
 * Fetch a single postcard by its slugId.
 * @param slugId The slug identifier of the postcard
 * @returns A postcard object
 */
export async function fetchPostcardBySlug(slugId: string): Promise<Postcard> {
    const res = await fetch(`${API_BASE}/postcards/${slugId}`);
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch postcard with slugId: ${slugId}`);
    }
    return res.json();
}

/**
 * Create a new postcard.
 * @param postcard Object containing message and optional fields
 * @returns The created postcard
 */
export async function createPostcard(postcard: { message: string; to?: string; from?: string; postmarked?: string; date?: string; slugId?: string; source?: "user" | "seed"; scene?: string }): Promise<Postcard> {
    const payload = {
        slugId: postcard.slugId || `user-${uuidv4()}`,
        message: postcard.message,
        to: postcard.to || "",
        from: postcard.from || "",
        postmarked: postcard.postmarked || "Personal Message",
        date: postcard.date || new Date().toISOString(),
        scene: postcard.scene || "personal",
        source: postcard.source || "user",
    };

    const res = await fetch(`${API_BASE}/postcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create postcard");
    }

    return res.json();
}