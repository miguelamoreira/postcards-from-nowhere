import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import PostcardFront from "../components/PostcardFront";
import PostcardBack from "../components/PostcardBack";
import TransitionDisplay from "../components/TransitionDisplay"
import ChoicesDisplay, { Choice } from "../components/ChoicesDisplay";
import type { Postcard } from "../types";
import { fetchPostcards } from "../api/api";
import { postcardFlow, houseChoices, cityChoices, shoreChoices } from "../data/postcards";
import { motion, Variants, useReducedMotion } from "motion/react";
import Button from "../components/Button";

export default function PostcardScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { slugId } = useParams<{ slugId?: string }>();

    const [dynamicPostcardFlow, setDynamicPostcardFlow] = useState(postcardFlow)
    const stateUser = (location.state as { userName?: string } | null)?.userName;
    const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("pc_userName") : null;
    const userName = stateUser ?? storedUser ?? "";
    const currentSlugId = slugId || "first";
    const canFlip = currentSlugId.endsWith("-main");
    const reduceMotion = useReducedMotion();

    const [isFrontVisible, setIsFrontVisible] = useState<boolean>(() => (canFlip ? true : false));
    const [transitionTarget, setTransitionTarget] = useState<string | null>(null);
    const [postcards, setPostcards] = useState<Postcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isChoicesScreen = currentSlugId.endsWith("-choices");

    useEffect(() => {
        setLoading(true);

        Promise.all([
            fetchPostcards({ source: "seed" }),
            fetchPostcards({ source: "user" }),
        ])
            .then(([seedCards, userCards]: [Postcard[], Postcard[]]) => {
            const seedSlugs = new Set(seedCards.map((s) => s.slugId));
            const combined: Postcard[] = [
                ...seedCards,
                ...userCards.filter((u) => !seedSlugs.has(u.slugId)),
            ];

            const isStaticChoice = (slug: string) => {
                if (["first", "writeBack"].includes(slug)) return true;
                return /^(house|city|shore)-(main|choices|choice-\d+)$/.test(slug);
            };
            const filteredUserCards = userCards.filter(
            (u) => !isStaticChoice(u.slugId)
            );

            const sortedUserCards = [...filteredUserCards].sort(
                (a, b) =>
                new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
            );

            const extendedFlow: Record<string, string> = JSON.parse(
                JSON.stringify(postcardFlow)
            );

            extendedFlow["house-main"] = "house-choices";
            extendedFlow["city-main"] = "city-choices";
            extendedFlow["shore-main"] = "shore-choices";

            extendedFlow["house-choices"] = extendedFlow["house-choices"] || "house-choice-1";
            extendedFlow["city-choices"] = extendedFlow["city-choices"] || "city-choice-1";
            extendedFlow["shore-choices"] = extendedFlow["shore-choices"] || "shore-choice-1";

            extendedFlow["house-choice-1"] = "city-main";
            extendedFlow["house-choice-2"] = "city-main";
            extendedFlow["city-choice-1"] = "shore-main";
            extendedFlow["city-choice-2"] = "shore-main";

            if (sortedUserCards.length > 0) {
                extendedFlow["shore-choice-1"] = sortedUserCards[0].slugId;
                extendedFlow["shore-choice-2"] = sortedUserCards[0].slugId;
            } else {
                extendedFlow["shore-choice-1"] = "writeBack";
                extendedFlow["shore-choice-2"] = "writeBack";
            }

            for (let i = 0; i < sortedUserCards.length - 1; i++) {
                const from = sortedUserCards[i].slugId;
                const to = sortedUserCards[i + 1].slugId;
                extendedFlow[from] = to;
            }

            if (sortedUserCards.length > 0) {
                const last = sortedUserCards[sortedUserCards.length - 1].slugId;
                extendedFlow[last] = "writeBack";
            }

            extendedFlow["house-choice-1"] = "city-main";
            extendedFlow["house-choice-2"] = "city-main";
            extendedFlow["city-choice-1"] = "shore-main";
            extendedFlow["city-choice-2"] = "shore-main";

            if (sortedUserCards.length > 0) {
                extendedFlow["shore-choice-1"] = sortedUserCards[0].slugId;
                extendedFlow["shore-choice-2"] = sortedUserCards[0].slugId;
            } else {
                extendedFlow["shore-choice-1"] = "writeBack";
                extendedFlow["shore-choice-2"] = "writeBack";
            }

            const suspicious = Object.entries(extendedFlow).filter(
                ([k, v]) => /choice-\d+$/.test(k) && /choice-\d+$/.test(v)
            );
            if (suspicious.length > 0) {
                console.warn("Suspicious choice->choice links found:", suspicious);
            }

            setPostcards(combined);
            setDynamicPostcardFlow(extendedFlow);
            })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
    }, []);

    const getPostcardById = useCallback(
        (slug: string): Postcard | undefined => postcards.find((p) => p.slugId === slug),
        [postcards]
    );

    const currentPostcard = useMemo(() => getPostcardById(currentSlugId), [currentSlugId, getPostcardById]);

    const frontSurfaceRef = useRef<HTMLDivElement | null>(null);
    const backSurfaceRef = useRef<HTMLDivElement | null>(null);
    const [frontHeight, setFrontHeight] = useState<number | undefined>();
    const [backHeight, setBackHeight] = useState<number | undefined>();
    const [surfaceHeight, setSurfaceHeight] = useState<number | undefined>();

    useEffect(() => {
        setIsFrontVisible(currentSlugId.endsWith("-main"));
        setTransitionTarget(null);
    }, [currentSlugId]);

    const getNext = useCallback(
        (slugId: string) => dynamicPostcardFlow[slugId],
        [dynamicPostcardFlow]
    );
    const shouldShowTransitionFor = useCallback((fromId: string, toId: string | undefined) => {
        if (!toId) return false;

        if (fromId === "first" && toId.endsWith("-main")) return true;
        if (/choice-\d+$/.test(fromId) && toId.endsWith("-main")) return true;

        const isUserCard = !/^(first|writeBack|house|city|shore)-/.test(toId);
        if (/^shore-choice-\d+$/.test(fromId) && isUserCard) return true;

        return false;
    }, []);


    const getTitleFor = useCallback((id?: string) => {
        if (!id) return "";
        if (!/^(house|city|shore|first|writeBack)-/.test(id)) return "From the Shore to You";
        return getPostcardById(id)?.postmarked || "";
    }, [getPostcardById]);

    const getSubtitleFor = useCallback((id?: string) => {
        if (!id) return "";

        const p = getPostcardById(id);
        if (!p) return "";

        if (p.transitionLabel) return p.transitionLabel;

        const isUserCard = !/^(house|city|shore|first|writeBack)-/.test(id);
        if (isUserCard) return "Messages that found their way back to you";

        return "";
    }, [getPostcardById]);

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

    const currentStageRef = useRef<string | null>(stageForId(currentSlugId))
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
        const stage = stageForId(currentSlugId)
        currentStageRef.current = stage

        if (stage) {
            ensureAudio(stage)
        }
        crossFadeToStage(stage ?? null)

        return () => {

        }
    }, [currentSlugId, ensureAudio, crossFadeToStage, stageForId])

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
        const stage = stageForId(currentSlugId)
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
    }, [ensureAudio, currentSlugId, isMuted, stageForId])

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

    const handleContinue = useCallback(() => {
        const next = getNext(currentSlugId);
        console.log("Continue pressed:", { currentSlugId, next });

        if (!next) return navigate("/");
        if (shouldShowTransitionFor(currentSlugId, next)) {
            console.log("Transition triggered to:", next);
            crossFadeToStage(null);
            setTransitionTarget(next);
            return;
        }

        navigate(`/postcards/${next}`, { state: { userName } });
        }, [currentSlugId, getNext, navigate, shouldShowTransitionFor, userName, crossFadeToStage]);


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

        if (currentSlugId === "first") {
            setSurfaceHeight(clampedBack);
        } else {
            setSurfaceHeight(isFrontVisible ? clampedFront : clampedBack);
        }
        });
    };

        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [isFrontVisible, currentPostcard, currentSlugId]);

    const portraitWidth = "min(60vw, 520px)";
    const landscapeWidth = "min(90vw, 1000px)";
    const targetWidth = currentSlugId === "first" ? landscapeWidth : isFrontVisible ? portraitWidth : landscapeWidth;
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

    const renderMode = useMemo(() => {
        // Always prioritize choices screens
        if (currentSlugId.endsWith("-choices")) {
            return "choices";
        }

        // Then handle missing postcards
        if (!currentPostcard) {
            return "notFound";
        }

        return "postcard";
    }, [currentSlugId, currentPostcard]);

    if (renderMode === "choices") {
        const choices = getChoicesForId(currentSlugId)
        const title = getPostcardById(currentSlugId.replace("-choices", "-main"))?.postmarked
        const subtitle = getPostcardById(currentSlugId.replace("-choices", "-main"))?.choiceLabel

        return (
            <div className="min-h-screen bg-[#404040] flex items-center justify-center px-6">
                <ChoicesDisplay 
                    title={title} 
                    subtitle={subtitle}
                    choices={choices} 
                    postcards={postcards}
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

    if (renderMode === "notFound") {
        return <div className="text-white p-6">Postcard not found</div>;
    }

    const postcard = currentPostcard!;

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
                        image={postcard.illustration}
                    />
                </div>

                <div ref={backSurfaceRef}>
                    <PostcardBack
                        userName={userName}
                        location={postcard.postmarked || ""}
                        text={postcard.message}
                        showFlip={false}
                        portrait={false}
                        date={postcard.date || ""}
                        slugId={postcard.slugId}
                        from={postcard.from}
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
                        <div style={frontFaceStyle} className="pc-face-front" aria-hidden={currentSlugId === "first"}>
                            <PostcardFront
                                showFlip={false}
                                portrait={true}
                                image={postcard.illustration}
                            />
                        </div>

                        <div style={backFaceStyle} className="pc-face-back" aria-hidden={isFrontVisible}>
                            <PostcardBack
                                userName={userName}
                                location={postcard.postmarked || ""}
                                text={postcard.message}
                                showFlip={false}
                                portrait={false}
                                date={postcard.date || ""}
                                slugId={postcard.slugId}
                                from={postcard.from}
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
