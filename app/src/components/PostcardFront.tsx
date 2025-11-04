import Button from "./Button";

interface PostcardFrontProps {
    postcardBg?: string;
    showFlip?: boolean;
    onFlip?: () => void;
    onContinue: () => void;
    isFlipped?: boolean
}

export default function PostcardFront({ postcardBg = "../assets/bg/postcard.svg", showFlip = false, onFlip, onContinue}: PostcardFrontProps) {
    return (
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
    )
}