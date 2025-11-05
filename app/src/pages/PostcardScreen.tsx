import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import PostcardFront from "../components/PostcardFront";
import PostcardBack from "../components/PostcardBack";
import TransitionDisplay from "../components/TransitionDisplay"
import ChoicesDisplay, { Choice } from "../components/ChoicesDisplay";
import { getPostcardById, postcardFlow, houseChoices, cityChoices, shoreChoices } from "../data/postcards";
import { motion, Variants, useReducedMotion } from "motion/react";
import Button from "../components/Button";

export default function PostcardScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id?: string }>();
    const stateUser = (location.state as { userName?: string } | null)?.userName;
    const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("pc_userName") : null;
    const userName = stateUser ?? storedUser ?? "";
    const currentId = id || "first";
    const [isFrontVisible, setIsFrontVisible] = useState<boolean>(() => (currentId === "first" ? false : true));
    const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

    const reduceMotion = useReducedMotion();

    useEffect(() => {
        setIsFrontVisible(currentId === "first" ? false : true);
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

    const pageVariants: Variants = {
        initial: { opacity: 0, y: 20, scale: 0.995 },
        in: { opacity: 1, y: 0, scale: 1 },
        out: { opacity: 0, y: -10, scale: 0.995 }
    }

    const cardFlipTransition = { duration: 0.7, easing: [0.2, 0.8, 0.2, 1] };
    const frontSurfaceRef = useRef<HTMLDivElement | null>(null);
    const backSurfaceRef = useRef<HTMLDivElement | null>(null);
    const [frontHeight, setFrontHeight] = useState<number | undefined>(undefined);
    const [backHeight, setBackHeight] = useState<number | undefined>(undefined);
    const [surfaceHeight, setSurfaceHeight] = useState<number | undefined>(undefined);

    useEffect(() => {
    const measure = () => {
        requestAnimationFrame(() => {
        const fh = frontSurfaceRef.current?.offsetHeight ?? 0; // portrait preview height
        const bh = backSurfaceRef.current?.offsetHeight ?? 0;  // landscape preview height

        const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
        // Reserve space for top padding, page chrome and the buttons area (adjust if you have larger controls)
        const reservedForUi = 160; // px (buttons + padding). Increase if you have headers/toolbars.
        const maxAvailable = Math.max(280, viewportH - reservedForUi); // never smaller than a sane minimum

        // reduction factors tuned for portrait vs landscape
        const reducedFront = fh * 0.82 - 48;
        const reducedBack = bh * 0.88 - 60;

        // clamp but also respect available viewport space
        const clampedFront = Math.min(Math.max(reducedFront, 260), Math.min(900, Math.round(maxAvailable * 0.95)));
        const clampedBack = Math.min(Math.max(reducedBack, 300), Math.min(1100, Math.round(maxAvailable * 0.98)));

        setFrontHeight(clampedFront);
        setBackHeight(clampedBack);

        if (currentId === "first") {
            setSurfaceHeight(clampedBack);
        } else {
            setSurfaceHeight(isFrontVisible ? clampedFront : clampedBack);
        }
        });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    }, [isFrontVisible, currentPostcard, currentId]);

    const portraitWidth = "min(60vw, 520px)";
    const landscapeWidth = "min(90vw, 1000px)";
    const targetWidth = currentId === "first" ? landscapeWidth : isFrontVisible ? portraitWidth : landscapeWidth;
    const rotateTarget = isFrontVisible ? 0 : 180;

    const flipperTransition = {
        rotateY: { duration: 0.7, easing: [0.2, 0.8, 0.2, 1] },
        height: { duration: 0.45, easing: [0.2, 0.8, 0.2, 1] },
        width: { duration: 0.45, easing: [0.2, 0.8, 0.2, 1] },
    };

    const flipperAnimate = reduceMotion
        ? { rotateY: rotateTarget }
        : { rotateY: rotateTarget, height: surfaceHeight ? `${surfaceHeight}px` : "auto", width: targetWidth };

    const faceCommon: React.CSSProperties = {
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        position: "absolute",
        inset: 0,
    };

    const frontFaceStyle: React.CSSProperties = {
        ...faceCommon,
        transform: "rotateY(0deg)",
    };

    const backFaceStyle: React.CSSProperties = {
        ...faceCommon,
        transform: "rotateY(180deg)",
    };

    const onFlipClick = () => {
        if (currentId === "first") return;
        setIsFrontVisible((p) => !p);
    };

    return (
        <motion.div
            className="sm:mt-6 lg:mt-6 2xl:mt-12 bg-[#404040] flex items-center justify-center px-4 sm:px-8 relative overflow-hidden"
            initial={reduceMotion ? { opacity: 0 } : "initial"}
            animate={reduceMotion ? { opacity: 1 } : "in"}
            exit={reduceMotion ? { opacity: 0 } : "out"}
            variants={pageVariants}
            transition={{ duration: 0.45 }}
        >
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 flex flex-col items-center gap-6">
                <div
                aria-hidden
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    visibility: "hidden",
                    pointerEvents: "none",
                    width: "100%",
                    overflow: "hidden",
                }}
                >
                <div ref={frontSurfaceRef}>
                    <PostcardFront
                        postcardBg={currentPostcard.image || undefined}
                        showFlip={false}
                        portrait={true}
                    />
                </div>

                <div ref={backSurfaceRef}>
                    <PostcardBack
                        userName={userName}
                        location={currentPostcard.postmarked || ""}
                        text={currentPostcard.message}
                        showFlip={false}
                        postcardBg={currentPostcard.image || undefined}
                        portrait={false}
                    />
                </div>
                </div>

                <div className="w-full flex justify-center">
                    <div
                        style={{
                            perspective: 1400,
                            width: "auto",
                            maxWidth: "100%",
                        }}
                    >
                        <motion.div
                        initial={false}
                        animate={flipperAnimate as any}
                        transition={flipperTransition}
                        style={{
                            transformStyle: "preserve-3d",
                            WebkitTransformStyle: "preserve-3d",
                            position: "relative",
                            height: surfaceHeight ? `${surfaceHeight}px` : "auto",
                            width: "min(90vw, 1000px)",
                            maxWidth: "100%",
                            willChange: "transform,height,width",
                            margin: "0 auto",
                            transformOrigin: "center center",
                        }}
                        >
                        <div style={frontFaceStyle} className="pc-face-front" aria-hidden={currentId === "first"}>
                            <PostcardFront
                                postcardBg={currentPostcard.image || undefined}
                                showFlip={false}
                                portrait={true}
                            />
                        </div>

                        <div style={backFaceStyle} className="pc-face-back" aria-hidden={isFrontVisible}>
                            <PostcardBack
                                userName={userName}
                                location={currentPostcard.postmarked || ""}
                                text={currentPostcard.message}
                                showFlip={false}
                                postcardBg={currentPostcard.image || undefined}
                                portrait={false}
                            />
                        </div>

                        {reduceMotion && (
                            <style>{`
                                /* SHOW front when isFrontVisible is true */
                                .pc-face-front { opacity: ${isFrontVisible ? 1 : 0}; transition: opacity 300ms ease; position: relative; }
                                .pc-face-back  { opacity: ${isFrontVisible ? 0 : 1}; transition: opacity 300ms ease; position: relative; }
                            `}</style>
                        )}
                        </motion.div>
                    </div>
                </div>

                <div 
                    className={`
                        relative z-20 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10
                        ${isFrontVisible
                        ? "mt-0 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16 2xl:mt-0"
                        : "mt-0 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-16 2xl:mt-0" 
                        }
                    `}
                >
                    {currentId !== "first" && <Button onClick={onFlipClick} variant="secondary" text={isFrontVisible ? "Flip to back" : "Flip to front"} />}
                    <Button text="Continue" onClick={handleContinue} variant="primary" />
                </div>
            </div>

            {transitionTarget && (
                <TransitionDisplay
                    title={getTitleFor(transitionTarget)}
                    subtitle={getSubtitleFor(transitionTarget)}
                    durationMs={2500}
                    onDone={handleTransitionDone}
                />
            )}
        </motion.div>
    )
}
