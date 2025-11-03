import { useParams } from "react-router-dom";
import PostcardScreen from "./PostcardScreen";

export default function PostcardScreenWrapper() {
    const { id } = useParams<{ id?: string }>();
    const key = id || "first";
    return <PostcardScreen key={key} />;
}
