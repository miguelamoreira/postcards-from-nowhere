import { Router } from "express"
import { Request, Response } from "express";
import { Postcard, IPostcard } from "../models/postcardsModels"
import path from "path"

const router = Router()

/**
 * Helper: simple validation for required fields
 * Returns { ok: boolean, errors?: string }
 */
function validatePayload(payload: any) {
    const errors: string[] = [];
    if (!payload || typeof payload !== "object") {
        errors.push("payload must be a JSON object");
        return { ok: false, errors };
    }
    if (typeof payload.message !== "string" || payload.message.trim().length === 0) {
        errors.push("message is required and must be a non-empty string");
    }
    if (payload.to && typeof payload.to !== "string") errors.push("to must be a string");
    if (payload.from && typeof payload.from !== "string") errors.push("from must be a string");
    if (payload.postmarked && typeof payload.postmarked !== "string") errors.push("postmarked must be a string");
    if (payload.date && typeof payload.date !== "string") errors.push("date must be a string (YYYY-MM-DD)");
    return { ok: errors.length === 0, errors };
}

router.get("/", async (req: Request, res: Response) => {
    try {
        const { scene, grouped } = req.query;   
        const query: { scene?: string } = {};
        if (scene) query.scene = scene as string;

        const postcards = await Postcard.find(query)
        .sort({ created_at: 1 })
        .lean<IPostcard[]>();

        if (grouped === "true") {
        const groupedData: Record<string, IPostcard[]> = {};

        for (const card of postcards) {
            const key = String(card.scene || "unknown");
            if (!groupedData[key]) groupedData[key] = [];
            groupedData[key].push(card);
        }

        return res.json(groupedData);
        }

        res.json(postcards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "server_error" });
    }
});


router.get("/:slugId", async (req, res) => {
    try {
        const { slugId } = req.params;

        let doc = await Postcard.findOne({ slugId }).lean();

        if (!doc) {
            doc = await Postcard.findById(slugId).lean();
        }

        if (!doc) return res.status(404).json({ error: "not_found" });

        res.json(doc);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "bad_request" });
    }
});

router.post("/", async (req, res) => {
    try {
        const body: any = { ...(req.body || {}) };

        const { ok, errors } = validatePayload(body);
        if (!ok) return res.status(400).json({ error: "validation_failed", details: errors });

        const doc = await Postcard.create({
            slugId: body.slugId || undefined,
            to: body.to || "",
            from: body.from || "",
            postmarked: body.postmarked || "",
            message: String(body.message || ""),
            date: body.date || undefined,
            illustration: body.illustration || null,
            source: "user",
            created_at: new Date(),
            scene: body.scene || null
        });

        res.status(201).json(doc);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "server_error", message: error.message });
    }
})

export default router;