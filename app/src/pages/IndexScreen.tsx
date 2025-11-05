import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { motion, AnimatePresence, useReducedMotion, Variants } from "motion/react";

export default function Index() {
    const navigate = useNavigate()
    const [showNameModal, setShowNameModal] = useState(false)
    const [userName, setUserName] = useState("")

    const [titleVisible, setTitleVisible] = useState(false)
    const [subtitleVisible, setSubtitleVisible] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(false)

    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const reduceMotion = useReducedMotion()
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const isNavigatingRef = useRef(false);
    const pendingNavigateRef = useRef<{ path: string; state?: any } | null>(null);

    useEffect(() => {
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        timeoutsRef.current = [];


        if (!showNameModal) {
            if (reduceMotion) {
                setTitleVisible(true);
                setSubtitleVisible(true);
                setButtonVisible(true);
            } else {
                setTitleVisible(false);
                setSubtitleVisible(false);
                setButtonVisible(false);

                timeoutsRef.current.push(
                    window.setTimeout(() => setTitleVisible(true), 350)
                );
                timeoutsRef.current.push(
                    window.setTimeout(() => setSubtitleVisible(true), 650)
                );
                timeoutsRef.current.push(
                    window.setTimeout(() => setButtonVisible(true), 950)
                );
            }
        } else {
            setTitleVisible(false);
            setSubtitleVisible(false);
            setButtonVisible(false);

            const focusDelay = reduceMotion ? 0 : 220;
            timeoutsRef.current.push(
                setTimeout(() => {
                nameInputRef.current?.focus?.();
                }, focusDelay)
            );
        }

        return () => {
            timeoutsRef.current.forEach((t) => clearTimeout(t));
            timeoutsRef.current = [];
        };
    }, [showNameModal, reduceMotion]);

    useEffect(() => {
        if (!showNameModal) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowNameModal(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showNameModal]);

    const handleStart = () => {
        setTitleVisible(false);
        setSubtitleVisible(false);
        setButtonVisible(false);

        if (!userName.trim()) return;
        if (isNavigatingRef.current) return;

        sessionStorage.setItem("pc_userName", userName);

        if (reduceMotion) {
            isNavigatingRef.current = true;
            navigate("/postcards/first", { state: { userName } });
            return;
        }

        pendingNavigateRef.current = { path: "/postcards/first", state: { userName } };
        isNavigatingRef.current = true;

        setShowNameModal(false);
    };

    const onExitComplete = () => {
        if (!pendingNavigateRef.current) return;

        const { path, state } = pendingNavigateRef.current;
        pendingNavigateRef.current = null;

        setTimeout(() => {
        navigate(path, { state });
        }, 8);
    };

    const backdropVariant: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariant: Variants = {
        hidden: {
            opacity: 0,
            y: -18,
            scale: 0.96,
            filter: "blur(4px)",
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                type: "spring" as const,
                stiffness: 320,
                damping: 28,
                mass: 0.6,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.98,
            transition: { duration: 0.18 },
        },
    };
    
    return (
        <div className="min-h-screen bg-[#404040] flex flex-col items-center justify-center px-4 sm:px-8 relative overflow-hidden">
            {!showNameModal ? (
                <div className="flex flex-col items-center gap-16 sm:gap-24 max-w-4xl w-full text-center">
                    <div className="space-y-6 sm:space-y-8">
                        <h1 
                            className={
                                "font-neuton text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#EDE8DE] tracking-widest " +
                                "transform transition-opacity transition-transform duration-700 ease-out " +
                                (titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                            }
                            aria-hidden={!titleVisible}
                            style={{ fontFamily: "Neuton" }}
                        >
                            Postcards from Nowhere
                        </h1>
                        <p 
                            className={
                                "font-mono text-lg sm:text-xl md:text-2xl text-[#EDE8DE]/60 " +
                                "transform transition-opacity transition-transform duration-700 ease-out " +
                                (subtitleVisible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4")
                            }
                            aria-hidden={!subtitleVisible}
                        >
                            A journey through letters and memories
                        </p>
                    </div>

                    <div
                        className={
                            "transform transition-opacity transition-transform duration-700 ease-out " +
                            (buttonVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                        }
                    >
                        <Button text={"Begin your journey"} onClick={() => setShowNameModal(true)} variant="primary" state="default"></Button>
                    </div>
                </div>
            ) : null }

            <AnimatePresence initial={false} mode="wait" onExitComplete={onExitComplete}>
                {showNameModal && (
                <motion.div
                    className="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-6"
                    variants={backdropVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        onClick={() => setShowNameModal(false)}
                    />

                    <motion.div
                        className="username-modal relative w-full max-w-2xl text-[#404040] shadow-2xl p-6 sm:p-10 z-50"
                        variants={modalVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="space-y-6 mb-8 text-center">
                            <h2 className="font-mono text-l sm:text-xl font-bold text-[#EDE8DE]">Who are the postcards addressed to?</h2>
                            <p className="font-mono text-sm sm:text-base text-[#EDE8DE]/80">The postcards will remember this name</p>
                        </div>

                        <input
                            ref={nameInputRef}
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Write your name"
                            className="username-input w-full px-4 py-4 sm:py-5 bg-[#EDE8DE] text-[#404040]/40 font-mono text-md sm:text-l rounded placeholder:text-[#404040]/40 focus:text-[#404040] focus:outline-none focus:ring-2 focus:ring-gold"
                            onKeyDown={(e) => {
                            if (e.key === "Enter") handleStart();
                            }}
                            aria-label="Your name"
                        />

                        <div className="flex justify-center mt-8">
                            <Button text={"Start"} onClick={handleStart} variant="primary" state={userName.trim() ? "default" : "disabled"} />
                        </div>
                    </motion.div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

