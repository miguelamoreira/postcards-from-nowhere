import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import { motion, Variants, useReducedMotion } from "motion/react";
import PostcardBack from "./PostcardBack";
import { getPostcardById } from "../data/postcards";
export interface Choice {
    id: string;
    postcardId: string;
    title: string;
    subtitle?: string;
    image?: string;
}

interface ChoicesDisplayProps {
    title?: string;
    subtitle?: string;
    choices: Choice[];
    initialSelectedId?: string | null;
    onSelect: (choice: Choice) => void;
    onCancel?: () => void;
}

export default function ChoicesDisplay({ title, subtitle, choices, initialSelectedId = null, onSelect, onCancel }: ChoicesDisplayProps) {
    const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)

    const [titleVisible, setTitleVisible] = useState(false)
    const [subtitleVisible, setSubtitleVisible] = useState(false)
    const [tilesVisible, setTilesVisible] = useState(false)
    const [buttonsVisible, setButtonsVisible] = useState(false)
    const reduceMotion = useReducedMotion();
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        timeoutsRef.current = [];

        if (reduceMotion) {
            setTitleVisible(true);
            setSubtitleVisible(true);
            setTilesVisible(true)
            setButtonsVisible(true);
        } else {
            setTitleVisible(false);
            setSubtitleVisible(false);
            setTilesVisible(false)
            setButtonsVisible(false);

            timeoutsRef.current.push(
                window.setTimeout(() => setTitleVisible(true), 350)
            );
            timeoutsRef.current.push(
                window.setTimeout(() => setSubtitleVisible(true), 800)
            );
            timeoutsRef.current.push(
                window.setTimeout(() => setTilesVisible(true), 1200)
            );
            timeoutsRef.current.push(
                window.setTimeout(() => setButtonsVisible(true), 1600)
            );
        }

        return () => {
            timeoutsRef.current.forEach((t) => clearTimeout(t));
            timeoutsRef.current = [];
        };
    }, [reduceMotion]);

    const handleCardClick = (id: string) => {
        setSelectedId((prev) => (prev === id ? null : id))
    }

    const handleCancel = () => {
        setSelectedId(null)
        if (onCancel) onCancel()
    }

    const selectedChoice = choices.find((c) => c.id === selectedId) ?? null;
    const postcardBg = "/assets/bg/postcard.svg";

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-20 px-6 sm:px-12 bg-[#404040] text-[#EDE8DE] overflow-auto">
            <div className="max-w-4xl w-full text-center mb-10">
                <h1 
                    className={
                        "font-serif text-5xl sm:text-6xl tracking-wider leading-tight" + 
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                    }
                    style={{ fontFamily: 'Neuton' }}
                    aria-hidden={!titleVisible}
                >
                    {title}
                </h1>
                {subtitle && <p 
                    className={
                        "mt-6 2xl:mt-10 text-lg text-[#EDE8DE]/70" +
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (subtitleVisible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4")
                    }
                    aria-hidden={!subtitleVisible}
                >{subtitle}
                </p>}
            </div>

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-x-24 2xl:gap-x-40 gap-y-12 2xl:gap-y-20 mt-6 2xl:mt-20">
                {choices.map((c) => {
                    const isSelected = selectedId === c.id
                    const pc = getPostcardById(c.postcardId);

                    return (
                        <div key={c.id} className="flex justify-center">
                            <button
                                type="button"
                                onClick={() => handleCardClick(c.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleCardClick(c.id);
                                    }
                                }}
                                className={
                                    "focus:outline-none w-full max-w-[520px] xl:max-w-[680px] 2xl:max-w-[900px]" +
                                    "transition-all transform duration-700 ease-out" +
                                    (tilesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                                }
                                aria-pressed={isSelected}
                                aria-hidden={!tilesVisible}
                            >
                                <div
                                    className={`relative w-full rounded-lg overflow-hidden shadow-2xl transition-transform duration-150 ${
                                        isSelected ? "scale-[1.01] ring-4 ring-[#E9B361]/40" : "hover:scale-[1.01]"
                                    }`}
                                    style={{
                                        aspectRatio: "1166 / 656",
                                        backgroundImage: `url(${postcardBg})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        border: isSelected ? "4px solid rgba(250,180,40,0.9)" : undefined,
                                    }}
                                >

                                    <div
                                        className="absolute inset-0 rounded-md shadow-inner overflow-hidden bg-transparent"
                                        style={{
                                        display: "block",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                overflow: "hidden",
                                                position: "relative",
                                            }}
                                        >
                                            {pc ? (
                                                <div
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    transform: "scale(1.06)",
                                                    transformOrigin: "center center",
                                                    filter: "blur(6px) saturate(0.95) brightness(0.95)",
                                                    pointerEvents: "none",
                                                }}
                                                >
                                                <PostcardBack
                                                    userName={undefined}
                                                    location={pc.postmarked || ""}
                                                    text={pc.message}
                                                    postcardBg={pc.image || "/assets/bg/postcard.svg"}
                                                    showFlip={false}
                                                    portrait={false}
                                                />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-[#EDE8DE]/60">
                                                    <span className="text-[#404040]/40">No preview</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-left pl-1">
                                    <div className={`text-lg font-neucha ${isSelected ? "text-[#EDE8DE]" : "text-[#EDE8DE]"}`}>
                                        {c.title}
                                    </div>
                                    {c.subtitle && <div className="mt-1 text-sm text-[#EDE8DE]/60">{c.subtitle}</div>}
                                </div>
                            </button>
                        </div>
                    )
                })}
            </div>
            
            <div className="w-full max-w-6xl flex items-center justify-center my-12 2xl:my-24">
                <div 
                    className={
                        "flex items-center gap-8" + 
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (buttonsVisible ? "opacity-100 translate-y-0 gap-6" : "opacity-0 translate-y-4")
                    }
                    aria-hidden={!buttonsVisible}
                >
                    {onCancel && (
                        <Button
                            text={"Cancel"}
                            variant="secondary"
                            onClick={handleCancel}
                        >
                        </Button>
                    )}
                    <Button 
                        text={"Continue with this memory"}     
                        variant="primary"
                        state={selectedChoice ? "default" : "disabled"}
                        onClick={() => {
                            if (!selectedChoice) return
                            onSelect(selectedChoice)
                        }}           
                    >
                    </Button>
                </div>
            </div>
        </div>
    )
}