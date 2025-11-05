interface PostcardFrontProps {
    postcardBg?: string;
    showFlip?: boolean;
    portrait?: boolean
    image?: string;
}

export default function PostcardFront({ postcardBg = "../assets/bg/postcard.svg", showFlip = false, portrait = false, image}: PostcardFrontProps) {
    const aspect = portrait ? "656 / 806" : "1166 / 656"; 

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
                    {image ? (
                            <img src={image} alt="illustration" className="max-h-full max-w-full object-cover" />
                        ) : (
                            "Illustration area"
                    )}
                </div>
            </div>
        </>
    )
}