import { useState } from "react";
interface PostcardFrontProps {
    postcardBg?: string;
    showFlip?: boolean;
    portrait?: boolean
    image?: string;
    fallBackImage?: string;
}

export default function PostcardFront({ postcardBg = "../assets/bg/postcard.svg", showFlip = false, portrait = false, image, fallBackImage}: PostcardFrontProps) {
    const aspect = portrait ? "656 / 806" : "1166 / 656"; 
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);

    return (
        <>
            <div
                className="postcard-surface relative w-full rounded-lg shadow-2xl overflow-hidden"
                style={{
                    aspectRatio: aspect,
                    backgroundImage: `url(${postcardBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-[5%] rounded-mdshadow-inner flex items-center justify-center">
                    {image && !videoError ? (
                        <>
                            {!videoLoaded && (
                                <img
                                    src={fallBackImage}
                                    alt="Fallback"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                            <video
                                src={image}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                                onLoadedData={() => setVideoLoaded(true)}
                                onError={() => setVideoError(true)}
                            />
                        </>
                    ) : fallBackImage ? (
                        <img
                            src={fallBackImage}
                            alt="Fallback"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-[#404040]">Illustration area</div>
                    )}
                </div>
            </div>
        </>
    )
}