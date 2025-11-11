import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonalPostcard from "../components/PersonalPostcard";
import Button from "../components/Button";
import { motion, Variants, useReducedMotion } from "motion/react";

export default function WriteBackScreen() {
    const navigate = useNavigate()
    const [showComposer, setShowComposer] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [titleVisible, setTitleVisible] = useState(false)
    const [subtitleVisible, setSubtitleVisible] = useState(false)
    const [tilesVisible, setTilesVisible] = useState(false)
    const [buttonsVisible, setButtonsVisible] = useState(false)
    const reduceMotion = useReducedMotion();
    const timeoutsRef = useRef<number[]>([]);

    const tiles = [
        { id: "t1", image: "../assets/postcards/house.PNG" },
        { id: "t2", image: "../assets/postcards/city.PNG" },
        { id: "t3", image: "../assets/postcards/shore.PNG" },
    ];

    const postcardBg = "/assets/bg/postcard.svg";

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
        setSelectedId((prev) => (prev === id ? null : id));
    };

    const selectedTile = tiles.find((t) => t.id === selectedId) ?? null;

    if (showComposer) {
        return (
            <div className="fixed inset-0 z-50 bg-[#404040] text-[#EDE8DE]">
                <PersonalPostcard
                    initialIllustration={selectedTile?.image}
                    onCancel={() => setShowComposer(false)}
                    onSent={() => {
                        setShowComposer(false)
                        navigate("/postcards/first")
                    }}
                >
                </PersonalPostcard>
            </div>
        )
    }

    return(
        <div className="min-h-screen bg-[#404040] flex flex-col items-center justify-start pt-20 px-6 sm:px-12 text-[#EDE8DE]">
            <div className="max-w-4xl w-full text-center mb-16">
                <h1 
                    className={
                        "font-serif text-5xl sm:text-6xl tracking-wider leading-tight" + 
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                    }
                    style={{ fontFamily: 'Neuton' }}
                    aria-hidden={!titleVisible}
                >
                    If you ever find yourself here again, write back
                </h1>
                <p 
                    className={
                        "mt-6 text-lg text-[#EDE8DE]/70" +
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (subtitleVisible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4")
                    }
                    aria-hidden={!subtitleVisible}
                >
                    The postcards have finished speaking — now it's your turn.
                </p>
            </div>

            <div className="w-full max-w-[1800px] grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-x-20 gap-y-20 mt-6 mb-24">
                {tiles.map((t) => {
                    const isSelected = selectedId === t.id
                    return (
                        <div key={t.id} className="flex justify-center">
                            <button
                                type="button"
                                onClick={() => handleCardClick(t.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                         e.preventDefault()
                                        handleCardClick(t.id)
                                    }
                                }}  
                                className={
                                    "focus:outline-none w-full max-w-[580px] sm:max-w-[740px] lg:max-w-[880px] xl:max-w-[1000px] 2xl:max-w-[1200px]" + 
                                    "transform transition-opacity transition-transform duration-700 ease-out " +
                                    (tilesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                                }
                                aria-pressed={isSelected}
                                aria-hidden={!tilesVisible}
                            >
                                <div
                                    className={`relative w-full rounded-lg overflow-hidden shadow-2xl transition-transform duration-150 ${
                                        isSelected
                                        ? "scale-[1.01] ring-4 ring-[#E9B361]/40"
                                        : "hover:scale-[1.01]"
                                    }`}
                                    style={{
                                        aspectRatio: "1166 / 656",
                                        backgroundImage: `url(${postcardBg})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        border: isSelected
                                        ? "4px solid rgba(250,180,40,0.9)"
                                        : undefined,
                                    }}
                                >
                                    {isSelected && (
                                        <div className="w-full h-full bg-black/6 flex items-end justify-center" />
                                    )}
                                    <div className="absolute inset-4 rounded-md bg-[#EDE8DE]/80 shadow-inner flex items-center justify-center overflow-hidden">
                                        {t.image ? (
                                        <img
                                            src={t.image}
                                            alt="illustration"
                                            className="w-full h-full object-contain pointer-events-none select-none -rotate-90 origin-center scale-[1.9]"
                                            draggable={false}
                                        />
                                        ) : (
                                            <div className="text-2xl text-[#404040]/40">Illustration</div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                    )
                })}
            </div>

            <div className="w-full max-x-4xl flex items-center justify-center">
                <div 
                    className={
                        "flex items-center gap-8" + 
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (buttonsVisible ? "opacity-100 translate-y-0 gap-6" : "opacity-0 translate-y-4")
                    }
                    aria-hidden={!buttonsVisible}
                >
                    <Button 
                        text={"Begin again"}
                        variant="secondary"
                        onClick={() => navigate("/postcards/first")}                        
                    >
                    </Button>
                    <Button 
                        text={"Write back"}
                        variant="primary"
                        state={selectedTile ? "default" : "disabled"}
                        onClick={() => {
                            if (!selectedTile) return
                            setShowComposer(true)
                        }}                        
                    >
                    </Button>
                </div>
            </div>
        </div>
    )
}