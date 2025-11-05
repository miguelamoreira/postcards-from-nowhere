interface PostcardFrontProps {
    postcardBg?: string;
    showFlip?: boolean;
    portrait?: boolean
    image?: string;
}

export default function PostcardFront({ postcardBg = "../assets/bg/postcard.svg", showFlip = false, portrait = false, image}: PostcardFrontProps) {
    const bg = postcardBg || image || "";
    const aspect = portrait ? "656 / 806" : "1166 / 656"; 

    return (
        <>
            <div
                className="postcard-surface relative w-full rounded-lg shadow-2xl overflow-hidden"
                style={{
                    aspectRatio: aspect,
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-6 rounded-md bg-[#EDE8DE]/80 shadow-inner flex items-center justify-center">
                    <div className="text-xl sm:text-2xl text-[#404040]/40">
                        {image ? (
                            <img src={image} alt="illustration" className="max-h-full max-w-full object-contain" />
                        ) : (
                            "Illustration area"
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}