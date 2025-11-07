import { useParams } from "react-router-dom";
import PostcardScreen from "./PostcardScreen";

export default function PostcardScreenWrapper() {
    const { slugId } = useParams<{ slugId?: string }>();
    const key = slugId || "first";
    return <PostcardScreen key={key} />;
}
