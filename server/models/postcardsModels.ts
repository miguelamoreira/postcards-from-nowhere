import { Schema, model, Document } from "mongoose"

export interface IPostcard extends Document {
    slugId?: string | null;
    to?: string;
    from?: string;
    postmarked?: string;
    message: string;
    date?: string;
    illustration?: string | null;
    fallBackIllustration?: string | null;
    transitionLabel?: string,
    choiceLabel?: string;
    source?: "seed" | "user";
    created_at: Date;
    scene?: String
}

const PostcardSchema = new Schema<IPostcard>({
    slugId: { type: String, index: true, unique: true, sparse: true },
    to: { type: String },
    from: { type: String },
    postmarked: { type: String },
    message: { type: String, required: true },
    date: { type: String },
    illustration: { type: String },
    fallBackIllustration: { type: String },
    transitionLabel: { type: String },
    choiceLabel: { type: String },
    source: { type: String, enum: ["seed", "user"], default: "user" },
    created_at: { type: Date, default: () => new Date() },
    scene: { type: String, index: true }
})

export const Postcard = model<IPostcard>("Postcard", PostcardSchema)