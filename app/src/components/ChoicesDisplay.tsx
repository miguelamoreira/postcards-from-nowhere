import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import { motion, Variants, useReducedMotion } from "motion/react";
export interface Choice {
    id: string;
    postcardId: string;
    title: string;
    subtitle?: string;
    image?: string;
}

interface ChoicesDisplayProps {
    title: string;
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
                        "mt-6 text-lg text-[#EDE8DE]/70" +
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (subtitleVisible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4")
                    }
                    aria-hidden={!subtitleVisible}
                >{subtitle}
                </p>}
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12 mt-6">
                {choices.map((c) => {
                    const isSelected = selectedId === c.id
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
                                    "focus:outline-none" +
                                    "transform transition-opacity transition-transform duration-700 ease-out " +
                                    (tilesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                                }
                                aria-pressed={isSelected}
                                aria-hidden={!tilesVisible}
                                style={{ width: "100%", maxWidth: 520 }}
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
                                    {isSelected && (
                                        <div className="w-full h-full bg-black/6 flex items-end justify-center" />
                                    )}
                                    <div className="absolute inset-4 rounded-md bg-[#EDE8DE]/80 shadow-inner flex items-center justify-center">
                                        {c.image ? (
                                        <img
                                            src={c.image}
                                            alt={c.title}
                                            className="max-h-[78%] max-w-[92%] object-contain pointer-events-none select-none"
                                            draggable={false}
                                        />
                                        ) : (
                                        <div className="text-2xl text-[#404040]/40">Illustration</div>
                                        )}
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
            
            <div className="w-full max-w-6xl flex items-center justify-center my-16">
                <div 
                    className={
                        "flex items-center gap-8" + 
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (buttonsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
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