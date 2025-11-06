import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF, { jsPDFAPI } from "jspdf";
import Button from "./Button";
import { motion, Variants, useReducedMotion } from "motion/react";

interface Props {
    initialIllustration?: string | undefined;
    onCancel?: () => void;
    onSent?: () => void;
}

export default function PersonalPostcard({ initialIllustration, onCancel, onSent }: Props) {
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const hiddenFrontRef = useRef<HTMLDivElement | null>(null)
    const hiddenBackRef = useRef<HTMLDivElement | null>(null)

    const [titleVisible, setTitleVisible] = useState(false)
    const [subtitleVisible, setSubtitleVisible] = useState(false)
    const [cardVisible, setCardVisible] = useState(false)
    const [buttonsVisible, setButtonsVisible] = useState(false)
    const reduceMotion = useReducedMotion();
    const timeoutsRef = useRef<number[]>([]);

    const [sentTitleVisible, setSentTitleVisible] = useState(false)
    const [sentCopyVisible, setSentCopyVisible] = useState(false)
    const [sentButtonsVisible, setSentButtonsVisible] = useState(false)

    const postcardBg = "/assets/bg/postcard.svg";

    const canSend = message.trim().length > 0

    useEffect(() => {
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        timeoutsRef.current = [];

        if (reduceMotion) {
            setTitleVisible(true);
            setSubtitleVisible(true);
            setCardVisible(true)
            setButtonsVisible(true);
        } else {
            setTitleVisible(false);
            setSubtitleVisible(false);
            setCardVisible(false)
            setButtonsVisible(false);

            timeoutsRef.current.push(
                window.setTimeout(() => setTitleVisible(true), 350)
            );
            timeoutsRef.current.push(
                window.setTimeout(() => setSubtitleVisible(true), 800)
            );
            timeoutsRef.current.push(
                window.setTimeout(() => setCardVisible(true), 1200)
            );
            timeoutsRef.current.push(
                window.setTimeout(() => setButtonsVisible(true), 1600)
            );
        }

        return () => {
            timeoutsRef.current.forEach((t) => clearTimeout(t));
            timeoutsRef.current = [];
        };
    }, [reduceMotion]);

    useEffect(() => {
        if (!sent) {
            setSentTitleVisible(false)
            setSentCopyVisible(false)
            setSentButtonsVisible(false)
            return
        }

        timeoutsRef.current.forEach((t) => clearTimeout(t))
        timeoutsRef.current = []

        if (reduceMotion) {
            setSentTitleVisible(true)
            setSentCopyVisible(true)
            setSentButtonsVisible(true)
        } else {
            setSentTitleVisible(false)
            setSentCopyVisible(false)
            setSentButtonsVisible(false)

            timeoutsRef.current.push(
                window.setTimeout(() => setSentTitleVisible(true), 350)
            )
            timeoutsRef.current.push(
                window.setTimeout(() => setSentCopyVisible(true), 800)
            )
            timeoutsRef.current.push(
                window.setTimeout(() => setSentButtonsVisible(true), 1600)
            )
        }

        return () => {
            timeoutsRef.current.forEach((t) => clearTimeout(t))
            timeoutsRef.current = []
        }
    }, [sent, reduceMotion])

    const handleSend = async () => {
        if (!canSend) return
        setSending(true)

        try {
            await new Promise((r) => setTimeout(r, 900))
            setSent(true)
        } catch (error) {
            console.error(error)
        } finally {
            setSending(false)
        }
    }

    if (sent) {
        return (
            <div className="fixed inset-0 z-70 bg-[#404040] text-[#EDE8DE] flex items-center justify-center overflow-auto px-6">
                <div className="max-w-3xl text-center py-12">
                    <h1 
                        className={
                            "font-neuton text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#EDE8DE] tracking-widest " +
                            "transform transition-opacity transition-transform duration-700 ease-out " +
                            (sentTitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                        }
                        style={{ fontFamily: 'Neuton' }}
                        aria-hidden={!sentTitleVisible}
                    >
                        Your postcard has drifted away…
                    </h1>

                    <div 
                        className={
                            "font-mono text-center text-sm md:text-base lg:text-lg text-[#EDE8DE]/80 " + 
                            "transform transition-opacity transition-transform duration-700 ease-out " +
                            (sentCopyVisible ? "opacity-100 translate-y-12" : "opacity-0 translate-y-20")
                        } 
                        style={{ lineHeight: 1.9 }}
                        aria-hidden={!sentCopyVisible}
                    >
                        <p>Your postcard drifts beyond the desk</p>
                        <p className="mt-3">joining the echoes of other stories.</p>
                        <p className="mt-6 font-semibold text-[#EDE8DE]">Every memory is a place.</p>
                        <p className="mt-1 font-semibold text-[#EDE8DE]">Every place waits to be remembered.</p>
                        <p className="mt-6">You can stay here a moment</p>
                        <p className="mt-1">or begin again, and see what's changed.</p>
                    </div>

                    <div 
                        className={
                            "flex items-center justify-center gap-6" +
                            "transform transition-opacity transition-transform duration-700 ease-out " +
                            (sentButtonsVisible ? "opacity-100 translate-y-28" : "opacity-0 translate-y-32")
                        }
                        aria-hidden={!sentButtonsVisible}
                    >
                        <Button 
                            text={"Begin again"}
                            variant="primary"
                            onClick={() => {
                                if (onSent) onSent()
                                else setSent(false)
                            }} 
                        >
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const downloadPDF = async () => {
        if (!canSend) {
            alert("Please write a message before downloading")
            return
        }
        setDownloading(true)

        try {
            const nodes = [
                { node: hiddenFrontRef.current, name: "front" },
                { node: hiddenBackRef.current, name: "back" }
            ]

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "a4"
            })

            const canvasScale = 3;

            for (let i = 0; i < nodes.length; i++) {
                const entry = nodes[i]
                if (!entry.node) throw new Error(`${entry.name} node not found`)

                const canvas = await html2canvas(entry.node as HTMLElement, { scale: canvasScale, useCORS: true })
                const imgData = canvas.toDataURL("image/png")

                const pageW = pdf.internal.pageSize.getWidth()
                const pageH = pdf.internal.pageSize.getHeight()

                const margin = 40
                let drawW = pageW - margin * 2
                let drawH = (canvas.height / canvas.width) * drawW
                if (drawH > pageH - margin * 2) {
                    drawH = pageH - margin * 2
                    drawH = (canvas.width / canvas.height) * drawH
                }

                const x = (pageW - drawW) / 2
                const y = (pageH - drawH) / 2

                if (i > 0) pdf.addPage()
                pdf.addImage(imgData, "PNG", x, y, drawW, drawH)
            }

            pdf.save("postcard.pdf")
        } catch (error) {
            console.error(error)
            alert("Failed to generate PDF")
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-60 bg-[#404040] text-[#EDE8DE] overflow-auto">
            <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <div className="text-center mb-6 sm:mb-10">
                    <h2 
                        className={
                            "font-serif text-5xl sm:text-6xl tracking-wider leading-tight" + 
                            "transform transition-opacity transition-transform duration-700 ease-out " +
                            (titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                        }
                        style={{ fontFamily: 'Neuton' }}
                        aria-hidden={!titleVisible}
                    >
                        Write back
                    </h2>
                    <p 
                        className={
                            "mt-6 text-lg text-[#EDE8DE]/70" +
                            "transform transition-opacity transition-transform duration-700 ease-out " +
                            (subtitleVisible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4")
                        }
                        aria-hidden={!subtitleVisible}
                    >
                        What was all this about for you?
                    </p>
                </div>

                <div
                    className={
                        "relative rounded-lg shadow-2xl overflow-hidden mb-8 w-full" +
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
                    }
                    style={{
                        width: "clamp(420px, 92vw, 900px)",
                        aspectRatio: "1166 / 656",
                        backgroundImage: `url(${postcardBg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                    aria-hidden={!cardVisible}
                >
                    <div
                        className="absolute inset-6 rounded-sm flex items-stretch"
                        style={{ background: "transparent" }}
                    >
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message"
                            className="w-full h-full resize-none font-neucha text-[#404040] bg-[#EDE8DE]/95 rounded-sm outline-none p-6"
                            style={{
                                fontSize: 18,
                                lineHeight: "1.6",
                                boxSizing: "border-box",
                                textAlign: "left",
                                whiteSpace: "pre-wrap"
                            }}
                        >
                        </textarea>
                    </div>
                </div>

                <div 
                    className={
                        "flex items-center gap-8" +
                        "transform transition-opacity transition-transform duration-700 ease-out " +
                        (buttonsVisible ? "opacity-100 translate-y-0 gap-6" : "opacity-0 translate-y-4")
                    }
                    aria-hidden={!buttonsVisible}
                >
                    <Button 
                        text={"Download postcard"} 
                        variant="secondary" 
                        state={canSend && !downloading ? "default" : "disabled"}
                        onClick={downloadPDF}
                    >
                    </Button>
                    <Button 
                        text={"Send postcard"}
                        variant="primary"
                        state={canSend && !sending ? "default" : "disabled"}
                        onClick={handleSend}
                    >
                    </Button>
                    {onCancel && <Button text={"Close"} variant="secondary" onClick={onCancel}></Button>}
                </div>

                {/* OFFSCREEN DOM for full-size accurate PDF pages (front and back) */}
                <div style={{ position: "absolute", left: -99999, top: -99999 }} aria-hidden>
                    {/* FRONT: illustration side */}
                    <div
                        ref={hiddenFrontRef}
                        style={{
                            width: 1166,
                            height: 656,
                            boxSizing: "border-box",
                            backgroundImage: `url(${postcardBg})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: 8,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "stretch",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ margin: 32, background: "#F7F3EC", flex: 1, borderRadius: 4, padding: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {initialIllustration ? (
                                <img src={initialIllustration} style={{ maxWidth: "100%", maxHeight: "100%" }} alt="illustration" />
                            ) : (
                                <div style={{ color: "#404040" }}>Illustration</div>
                            )}
                        </div>
                    </div>

                    {/* BACK: writing side (message) */}
                    <div
                    ref={hiddenBackRef}
                    style={{
                        width: 1166,
                        height: 656,
                        boxSizing: "border-box",
                        backgroundImage: `url(${postcardBg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: 8,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "stretch",
                        justifyContent: "center",
                    }}
                    >
                        <div style={{ margin: 32, background: "#F7F3EC", flex: 1, borderRadius: 4, padding: 28 }}>
                            <div 
                                style={{ 
                                    color: "#3b3b3b", 
                                    whiteSpace: "pre-wrap", 
                                    fontFamily: "Neucha, monospace", 
                                    fontSize: 18,
                                    lineHeight: 1.6,
                                    textAlign: "left" 
                                }}>
                                    {message || ""}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}