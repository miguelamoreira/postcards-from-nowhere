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
    const canFlip = currentId.endsWith("-main")
    const [isFrontVisible, setIsFrontVisible] = useState<boolean>(() => (canFlip ? true : false));
    const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

    const reduceMotion = useReducedMotion();

    useEffect(() => {
        setIsFrontVisible(currentId.endsWith("-main") ? true : false);
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

    const soundMap: Record<string, string> = {
        house: "../assets/sounds/house.mp3",
        city: "../assets/sounds/city.mp3",
        shore: "../assets/sounds/shore.mp3"
    }

    const stageForId = useCallback((idVal: string) => {
        if (!idVal) return null

        if (idVal.startsWith("house")) return "house";
        if (idVal.startsWith("city")) return "city";
        if (idVal.startsWith("shore")) return "shore";
        return null;
    }, [])

    const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({
        house: null,
        city: null,
        shore: null
    })

    const currentStageRef = useRef<string | null>(stageForId(currentId))
    const fadingRef = useRef<number | null>(null)
    const FADE_MS = 600
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem("pc_sound_muted")
            return v === "1"
        } catch (error) {
            console.error(error)
            return false
        }
    })
    const [audioUnlocked, setAudioUnlocked] = useState<boolean>(true)

    const ensureAudio = useCallback((stage: string) => {
        if (!stage) return null
        if (!audioRefs.current[stage]) {
            const src = soundMap[stage]
            const a = new Audio(src)
            a.loop = true
            a.preload = "auto"
            a.volume = 0
            a.crossOrigin = "anonymous"
            audioRefs.current[stage] = a
        }

        return audioRefs.current[stage]
    }, [])

    const crossFadeToStage = useCallback((targetStage: string | null) => {
        if (fadingRef.current) {
            cancelAnimationFrame(fadingRef.current)
            fadingRef.current = null
        }

        const target = targetStage ? ensureAudio(targetStage) : null
        const others = Object.keys(audioRefs.current)
            .filter((k) => k !== targetStage)
            .map((k) => audioRefs.current[k]!)

        if (target) {
            target.loop = true

            const startPlay = () => target.play().catch(() => {
                setAudioUnlocked(false)
            })
            startPlay()
        }

        const start = performance.now()
        const fromVolumes: Map<HTMLAudioElement, number> = new Map()
        if (target) fromVolumes.set(target, target.volume ?? 0)
        others.forEach((o) => {
            if (o) fromVolumes.set(o, o.volume ?? 0)
        })

        const step = (now: number) => {
            const t = Math.min(1, (now - start) / FADE_MS)
            const ease = Math.min(1, Math.max(0, t))

            if (target) {
                const desired = (isMuted ? 0 : 0.55) * ease
                target.volume = Math.min(1, Math.max(0, desired))
            }

            others.forEach((o) => {
                if (!o) return
                const desired = (fromVolumes.get(o) ?? 1) * (1 - ease)
                o.volume = Math.min(1, Math.max(0, desired))
            })

            if (t < 1) {
                fadingRef.current = requestAnimationFrame(step)
            } else {
                others.forEach((o) => {
                    if (!o) return
                    o.pause()
                    o.currentTime = 0
                    o.volume = 0
                })

                if (target) {
                    target.volume = isMuted ? 0 : 0.55
                }
                fadingRef.current = null
            }
        }

        fadingRef.current = requestAnimationFrame(step)
    }, [ensureAudio, isMuted])

    useEffect(() => {
        const stage = stageForId(currentId)
        currentStageRef.current = stage

        if (stage) {
            ensureAudio(stage)
        }
        crossFadeToStage(stage ?? null)

        return () => {

        }
    }, [currentId, ensureAudio, crossFadeToStage, stageForId])

    const toggleMute = useCallback(() => {
        const next = !isMuted
        setIsMuted(next)
        
        try { localStorage.setItem("pc_sound_muted", next ? "1" : "0") } catch {}

        Object.values(audioRefs.current).forEach((a) => {
            if (!a) return
            a.volume = next ? 0 : 0.55
        })
    }, [isMuted])

    const enableAudio = useCallback(() => {
        const stage = stageForId(currentId)
        if (stage) {
            const a = ensureAudio(stage)
            if (!a) {
                setAudioUnlocked(false)
                return
            }
            
            a.play().then(() => {
                setAudioUnlocked(true)
                a.volume = isMuted ? 0 : 0.55
            }).catch(() => {
                setAudioUnlocked(false)
            })
        }
    }, [ensureAudio, currentId, isMuted, stageForId])

    useEffect(() => {
        return () => {
            if (fadingRef.current) cancelAnimationFrame(fadingRef.current)
                Object.values(audioRefs.current).forEach((a) => {
                    try {
                        if (a) {
                            a.pause()
                            a.src = ""
                        } 
                    } catch {}
                }
            )
            audioRefs.current = { house: null, city: null, shore: null }
        }
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

                <div className="absolute left-4 bottom-6 z-50">
                    <div className="flex items-center gap-3">
                        {!audioUnlocked ? (
                            <button
                                onClick={enableAudio}
                                className="px-3 py-2 rounded-md bg-[#EDE8DE]/10 text-[#EDE8DE] text-sm backdrop-blur-sm"
                            >
                                Enable sound
                            </button>
                        ) : (
                            <button
                                onClick={toggleMute}
                                className="px-3 py-2 rounded-md bg-[#EDE8DE]/8 text-[#EDE8DE] text-sm backdrop-blur-sm"
                                aria-pressed={isMuted}
                            >
                                {isMuted ? "Unmute" : "Mute"}
                            </button>
                        )}
                    </div>
                </div>
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
            crossFadeToStage(null)
            setTransitionTarget(next);
            return;
        }
        navigate(`/postcards/${next}`, { state: { userName } });
    }, [currentId, getNext, navigate, shouldShowTransitionFor, userName, crossFadeToStage]);

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
        const fh = frontSurfaceRef.current?.offsetHeight ?? 0;
        const bh = backSurfaceRef.current?.offsetHeight ?? 0;

        const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
        const reservedForUi = 160;
        const maxAvailable = Math.max(280, viewportH - reservedForUi);

        const reducedFront = fh * 0.82 - 48;
        const reducedBack = bh * 0.88 - 60;

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
        if (!canFlip) return;
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
                        showFlip={false}
                        portrait={true}
                        image={currentPostcard.image}
                    />
                </div>

                <div ref={backSurfaceRef}>
                    <PostcardBack
                        userName={userName}
                        location={currentPostcard.postmarked || ""}
                        text={currentPostcard.message}
                        showFlip={false}
                        portrait={false}
                        date={currentPostcard.date || ""}
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
                                showFlip={false}
                                portrait={true}
                                image={currentPostcard.image}
                            />
                        </div>

                        <div style={backFaceStyle} className="pc-face-back" aria-hidden={isFrontVisible}>
                            <PostcardBack
                                userName={userName}
                                location={currentPostcard.postmarked || ""}
                                text={currentPostcard.message}
                                showFlip={false}
                                portrait={false}
                                date={currentPostcard.date || ""}
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
                        : "mt-0 sm:mt-6 md:mt-6 lg:mt-8 xl:mt-8 2xl:mt-0" 
                        }
                    `}
                >
                    {canFlip && <Button onClick={onFlipClick} variant="secondary" text={isFrontVisible ? "Flip to back" : "Flip to front"} />}
                    <Button text="Continue" onClick={handleContinue} variant="primary" />
                </div>
            </div>

            <div className="absolute left-4 bottom-6 z-50">
                <div className="flex items-center gap-3">
                    {!audioUnlocked ? (
                    <button
                        onClick={enableAudio}
                        className="px-3 py-2 rounded-md bg-[#EDE8DE]/10 text-[#EDE8DE] text-sm backdrop-blur-sm"
                    >
                        Enable sound
                    </button>
                    ) : (
                    <button
                        onClick={toggleMute}
                        className="px-3 py-2 rounded-md bg-[#EDE8DE]/8 text-[#EDE8DE] text-sm backdrop-blur-sm"
                        aria-pressed={isMuted}
                    >
                        {isMuted ? "Unmute" : "Mute"}
                    </button>
                    )}
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
