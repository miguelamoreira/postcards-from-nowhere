import { useEffect, useState, useRef } from "react";
import Button from "./Button";
import { motion, Variants, useReducedMotion } from "motion/react";

interface TransitionDisplayProps {
    title: string;
    subtitle?: string;
    onDone: () => void
}

export default function TransitionDisplay({ title, subtitle, onDone }: TransitionDisplayProps) {
    const [titleVisible, setTitleVisible] = useState(false)
    const [subtitleVisible, setSubtitleVisible] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(false)
    const reduceMotion = useReducedMotion();
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        timeoutsRef.current = [];

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

        return () => {
            timeoutsRef.current.forEach((t) => clearTimeout(t));
            timeoutsRef.current = [];
        };
    }, [reduceMotion]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") onDone();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A3A3A] text-[#EDE8DE]"
            tabIndex={0}
        >
            <div className="text-center px-6 flex flex-col items-center gap-8 sm:gap-10">
                <h1 
                    className={
                        "font-neuton text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#EDE8DE] tracking-widest " +
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                    }
                    aria-hidden={!titleVisible}
                    style={{ fontFamily: "Neuton" }}
                >
                    {title}
                </h1>
                { subtitle && (
                    <p
                        className={
                            "font-mono text-lg sm:text-xl md:text-2xl text-[#EDE8DE]/60" +
                            "transform transition-opacity transition-transform duration-700 ease-out " +
                            (subtitleVisible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4")
                        }
                        aria-hidden={!subtitleVisible}
                    >
                        {subtitle}
                    </p>
                )}
                
                <div
                    className={
                        "mt-10 flex justify-center" +
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (buttonVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                    }
                >
                    <Button text={"Continue"} onClick={onDone} variant="primary"></Button>
                </div>
            </div>
        </div>
    )
}