import { useState, useEffect } from "react";

interface ButtonProps {
    text: string;
    onClick?: () => void;
    variant?: "primary" | "secondary";
    state?: "default" | "disabled";
    className?: string;
}

export default function Button({ text, onClick, variant="primary", state="default", className}: ButtonProps) {
    const [buttonState, setButtonState] = useState<"default" | "hover" | "active" | "disabled">(state)
    const isDisabled = buttonState === "disabled"
    let backgroundImage = "";

    useEffect(() => {
        setButtonState(state === "disabled" ? "disabled" : "default");
    }, [state]);

    if (variant === "primary") {
        if (buttonState === "default") backgroundImage += "url(/assets/buttons/primary-default.svg)"
        else if (buttonState === "hover") backgroundImage += "url(/assets/buttons/primary-hover.svg)"
        else if (buttonState === "active") backgroundImage += "url(/assets/buttons/primary-active.svg)"
        else if (buttonState === "disabled") backgroundImage += "url(/assets/buttons/primary-disabled.svg)"
    } else if (variant === "secondary") {
        if (buttonState === "default") backgroundImage += "url(/assets/buttons/secondary-default.svg)"
        else if (buttonState === "hover") backgroundImage += "url(/assets/buttons/secondary-hover.svg)"
        else if (buttonState === "active") backgroundImage += "url(/assets/buttons/secondary-active.svg)"
        else if (buttonState === "disabled") backgroundImage += "url(/assets/buttons/secondary-disabled.svg)"
    }

    const handlePointerDown = () => {
        if (!isDisabled) setButtonState("active");
    };
    const handlePointerUp = () => {
        if (!isDisabled) setButtonState("hover");
    };
    const handleEnter = () => {
        if (!isDisabled) setButtonState("hover");
    };
    const handleLeave = () => {
        if (!isDisabled) setButtonState("default");
    };

    return (
        <button 
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            className={`px-8 py-3 text-lg font-monospace transition-all point-cursor ${className}`}
            style={{
                backgroundImage,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: isDisabled ? "not-allowed" : "pointer",
                color: isDisabled ? "#BEBEBE" : "#ffffff",
                padding: "0.5rem 1rem",
                fontSize: 16,
                minWidth: 140,
            }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            onFocus={handleEnter}
            onBlur={handleLeave}
        >
            <span
                style={{
                display: "inline-block",
                paddingLeft: 6,
                paddingRight: 6,
                whiteSpace: "normal",
                textAlign: "center",
                lineHeight: 1,
                }}
                className="text-sm sm:text-base md:text-lg"
            >
                {text}
            </span>
        </button>
    )
}