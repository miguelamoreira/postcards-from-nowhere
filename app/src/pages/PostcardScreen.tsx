import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Postcard from "../components/Postcard";
import TransitionDisplay from "../components/TransitionDisplay"
import ChoicesDisplay, { Choice } from "../components/ChoicesDisplay";
import { getPostcardById, postcardFlow, houseChoices, cityChoices, shoreChoices } from "../data/postcards";

export default function PostcardScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id?: string }>();
    const stateUser = (location.state as { userName?: string } | null)?.userName;
    const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("pc_userName") : null;
    const userName = stateUser ?? storedUser ?? "";
    const [isFlipped, setIsFlipped] = useState(false);
    const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

    const currentId = id || "first";

    useEffect(() => {
        setIsFlipped(false);
        setTransitionTarget(null);
    }, [currentId]);


    const getNext = useCallback((id:string) => postcardFlow[id], [])
    const shouldShowTransitionFor = useCallback((fromId: string, toId: string | undefined) => {
        if (!toId) return false
        if (fromId === "first" && toId.endsWith("-main")) return true
        if (fromId.includes("choice") && toId.endsWith("-main")) return true
        return false
    }, [])

    const getTitleFor = useCallback((id?: string) => {
        if (!id) return ""

        const p = getPostcardById(id)
        if (!p) return id

        if (p.postmarked && p.postmarked.trim().length > 0) return p.postmarked

        return id.replace(/-/g, " ").replace(/b\w/g, (c) => c.toUpperCase())
    }, [])

    const getSubtitleFor = useCallback((id?: string) => {
        if (!id) return ""

        const p = getPostcardById(id)
        if (!p) return id

        if (p.transitionLabel && p.transitionLabel.trim().length > 0) return p.transitionLabel

        return id.replace(/-/g, " ").replace(/b\w/g, (c) => c.toUpperCase())
    }, [])

    const getChoicesForId = (choicesId: string): Choice[] => {
        if (choicesId === "house-choices") return houseChoices
        if (choicesId === "city-choices") return cityChoices
        if (choicesId === "shore-choices") return shoreChoices
        return []
    }

    if (currentId.endsWith("-choices")) {
        const choices = getChoicesForId(currentId)
        const title = getPostcardById(currentId.replace("-choices", "-main"))?.postmarked
        const subtitle = getPostcardById(currentId.replace("-choices", "-main"))?.choiceLabel

        return (
            <div className="min-h-screen bg-[#404040] flex items-center justify-center px-6">
                <ChoicesDisplay 
                    title={title} 
                    subtitle={subtitle}
                    choices={choices} 
                    onSelect={(choice) => {
                        if (userName) sessionStorage.setItem("pc_userName", userName);
                        navigate(`/postcards/${choice.postcardId}`, { state: { userName } });
                    }}
                    onCancel={() => {}}
                >
                </ChoicesDisplay>
            </div>
        )
    }

    const currentPostcard = useMemo(() => getPostcardById(currentId), [currentId])
    if (!currentPostcard) {
        return <div className="text-white p-6">Postcard not found</div>
    }

    const handleContinue = useCallback(() => {
        const next = getNext(currentId);
        if (!next) return navigate("/");
        if (shouldShowTransitionFor(currentId, next)) {
            setTransitionTarget(next);
            return;
        }
        navigate(`/postcards/${next}`, { state: { userName } });
    }, [currentId, getNext, navigate, shouldShowTransitionFor, userName]);

    const handleTransitionDone = () => {
        if (!transitionTarget) return

        navigate(`/postcards/${transitionTarget}`, { state: { userName } })
        setTransitionTarget(null)
    }

    return (
        <div className="min-h-screen bg-[#404040] flex flex-col items-center justify-center px-4 sm:px-8 relative overflow-hidden">
            <Postcard
                userName={userName}
                location={currentPostcard.postmarked || ""}
                text={currentPostcard.message}
                showFlip={currentId !== "first"}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((prev) => !prev)}
                onContinue={handleContinue}
            />

            {transitionTarget && (
                <TransitionDisplay 
                    title={getTitleFor(transitionTarget)} 
                    subtitle={getSubtitleFor(transitionTarget)}
                    durationMs={2500}
                    onDone={handleTransitionDone}
                >
                </TransitionDisplay>
            )}
        </div>
    )
}