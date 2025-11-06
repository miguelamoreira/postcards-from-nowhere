import { useState, useRef, useEffect, useMemo } from "react";

interface PostcardBackProps {
    userName?: string;
    location?: string;
    text?: string;
    postcardBg?: string;
    stampSrc?: string;
    showFlip?: boolean;
    portrait?: boolean
    date?: string;
}

export default function PostcardBack({ userName, location = "-", text = "", postcardBg = "../assets/bg/postcard.svg", stampSrc = "/assets/stamp.svg", showFlip = false, portrait, date }: PostcardBackProps) {
    const textLines = (text || "").split("\n")

    const effects = ["effect-ink", "effect-heat"];

    const postcardEffect = useMemo(() => {
        const seed = (location?.length ?? 0) + (postcardBg?.length ?? 0);
        return effects[seed % effects.length];
    }, [location, postcardBg]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [isTouchReveal, setIsTouchReveal] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        containerRef.current?.style.setProperty("--reveal-x", `${x}%`);
        containerRef.current?.style.setProperty("--reveal-y", `${y}%`);
    };

    const handleTouchStart = () => {
        setIsTouchReveal(true);
    };

    const formatted = date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "numeric", day: "numeric" }) : null;

    return (
        <>
            <div
                className="postcard-surface relative w-full rounded-lg shadow-2xl overflow-hidden bg-cover bg-center"
                style={{
                    aspectRatio: "1166 / 656",
                    backgroundImage: `url(${postcardBg})`,
                }}
            >
                {/* stamp */}
                <div
                    className="postcard-stamp absolute"
                    style={{
                        right: 36,
                        top: 28,
                        width: "clamp(60px, 6vw, 90px)",
                        height: "clamp(60px, 6vw, 90px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: "rotate(-2deg)",
                    }}
                >
                    <img
                        src={stampSrc}
                        alt="stamp"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.style.display = "none";
                        const parent = el.parentElement;
                        if (parent) {
                            parent.style.background = "linear-gradient(#b23f23,#992e18)";
                            parent.style.borderRadius = "999px";
                            parent.innerHTML = "";
                        }
                        }}
                    />
                </div>
            
                {/* divider */}
                <div
                    className="hidden lg:block absolute"
                    style={{
                        right: "33%",
                        top: "6%",
                        bottom: "6%",
                        width: 2,
                        backgroundColor: "rgba(57,57,57,0.22)",
                    }}
                />
            
                {/* content */}
                <div className="absolute inset-8 flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-6 overflow-hidden">
                    {/* LEFT (message area) */}
                    <div className="relative rounded-sm p-2 flex flex-col">
                        <div className="mb-4">
                            <p
                                className="text-lg text-[#404040]/90"
                                style={{
                                    fontFamily: "Neucha, cursive",
                                    fontSize: "clamp(16px, 2vw, 20px)",
                                }}
                            >
                                To: <span className="font-normal">{userName || "User Name"}</span>
                            </p>
                        </div>
                            
                    <div
                            className="flex-1 pr-4 overflow-y-auto"
                            style={{
                                backgroundImage:
                                "linear-gradient(to bottom, rgba(0,0,0,0.16) 1px, rgba(0,0,0,0) 1px)",
                                backgroundSize: "100% 44px",
                                paddingTop: 6,
                                paddingBottom: 6,
                            }}
                            >
                            <div
                                ref={containerRef}
                                onMouseMove={handleMouseMove}
                                onTouchStart={handleTouchStart}
                                className={`mt-1 space-y-3 sm:space-y-4 reveal-container ${postcardEffect} ${
                                isTouchReveal ? "is-revealed" : ""
                                }`}
                            >
                                {textLines.map((line, i) => (
                                <p
                                    key={i}
                                    className="text-justify text-[#404040]/95 wrap-break-word"
                                    style={{
                                    fontFamily: "Neucha, cursive",
                                    fontSize: "clamp(15px, 1.6vw, 20px)",
                                    lineHeight: "2.3",
                                    }}
                                >
                                    {line}
                                </p>
                                ))}
                            </div>
                            </div>
                        </div>
            
                    {/* RIGHT (address info) */}
                        <div className="postcard-right flex flex-col justify-center pl-12 md:pl-28 text-center lg:text-left">
                            <div className="space-y-8">
                                <div>
                                    <p
                                        className="text-[#404040]/70"
                                        style={{
                                            fontFamily: "Neucha",
                                            fontSize: "clamp(15px, 1.8vw, 20px)",
                                        }}
                                    >
                                        <span className="text-[#404040]/50">From: {userName || "Myself"}</span>
                                    </p>
                                </div>
            
                                <div>
                                    <p
                                        className="text-[#404040]/70"
                                        style={{
                                            fontFamily: "Neucha",
                                            fontSize: "clamp(15px, 1.8vw, 20px)",
                                        }}
                                    >
                                        <span className="text-[#404040]/50">Postmarked:</span>
                                    </p>
                                    <p
                                        className="mt-1 text-[#404040]/85"
                                        style={{
                                            fontFamily: "Neucha",
                                            fontSize: "clamp(15px, 1.6vw, 18px)",
                                        }}
                                    >
                                        {location || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p
                                        className="text-[#404040]/70"
                                        style={{
                                            fontFamily: "Neucha",
                                            fontSize: "clamp(15px, 1.8vw, 20px)",
                                        }}
                                    >
                                        <span className="text-[#404040]/50">Date:</span>
                                    </p>
                                    <p
                                        className="mt-1 text-[#404040]/85"
                                        style={{
                                            fontFamily: "Neucha",
                                            fontSize: "clamp(15px, 1.6vw, 18px)",
                                        }}
                                    >
                                        {formatted || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        
        </>
    )
}