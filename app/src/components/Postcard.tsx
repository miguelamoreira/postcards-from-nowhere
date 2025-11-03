import Button from "./Button";

interface PostcardProps {
    userName?: string;
    location: string;
    text: string;
    showFlip?: boolean;
    isFlipped?: boolean;
    onFlip?: () => void;
    onContinue?: () => void;
}

export default function Postcard({ userName, location, text, showFlip = false, isFlipped = false, onFlip, onContinue }: PostcardProps) {
    const postcardBg = "../assets/bg/postcard.svg";
    const stampSrc = "/assets/stamp.svg";
    const textLines = (text || "").split("\n");

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 space-y-10 sm:space-y-14">
            {/* FRONT SIDE */}
            {isFlipped ? (
                <>
                    <div
                        className="postcard-surface relative w-full rounded-lg shadow-2xl overflow-hidden"
                        style={{
                        aspectRatio: "1166 / 656",
                        backgroundImage: `url(${postcardBg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        }}
                    >
                        <div className="absolute inset-8 rounded-md bg-[#EDE8DE]/80 shadow-inner flex items-center justify-center">
                            <div className="text-xl sm:text-2xl text-[#404040]/40">
                                Illustration area
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
                        {showFlip && (
                            <Button onClick={onFlip} variant="secondary" text="Flip postcard" />
                        )}
                        {onContinue && (
                            <Button text="Continue" onClick={onContinue} variant="primary" />
                        )}
                    </div>
                    </>
            ) : (
                <>
                    {/* BACK SIDE */}
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
                                    <div className="mt-1 space-y-3 sm:space-y-4">
                                        {textLines.map((line, i) => (
                                        <div key={i}>
                                            {line ? (
                                            <p
                                                className="text-justify text-[#404040]/95 wrap-break-word"
                                                style={{
                                                fontFamily: "Neucha, cursive",
                                                fontSize: "clamp(15px, 1.6vw, 20px)",
                                                lineHeight: "2.3",
                                                }}
                                            >
                                                {line}
                                            </p>
                                            ) : (
                                            <div className="h-3" />
                                        )}
                                        </div>
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
                                        <span className="text-[#404040]/50">From:</span>
                                        <span className="text-[#404040]/80"> -</span>
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
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                        {showFlip && (
                            <Button onClick={onFlip} variant="secondary" text="Flip postcard" />
                        )}
                        {onContinue && (
                            <Button onClick={onContinue} variant="primary" text="Continue" />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}