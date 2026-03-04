"use client"
import { useState } from "react"

const GRADIENTS: Record<string, [string, string, string]> = {
    engineering: ["#1a3a6e", "#2d6abf", "⚙️"],
    medical: ["#0d5c3c", "#1a8f5e", "🏥"],
    jee: ["#6b1a1a", "#c0392b", "⚡"],
    neet: ["#4a0d6b", "#8e44ad", "🔬"],
    upsc: ["#2c1a6e", "#6c3fb5", "🏛️"],
    bank: ["#1a4a6e", "#2980b9", "🏦"],
    science: ["#0d4a5c", "#16a085", "🧪"],
    secondary: ["#4a3000", "#e67e22", "📖"],
    school: ["#2d5c3e", "#4A7C59", "🎒"],
    mba: ["#2c3e50", "#34495e", "💼"],
    ca: ["#1a3a2c", "#2e7d5e", "📊"],
    law: ["#3a1a0d", "#8B4513", "⚖️"],
    selfhelp: ["#7d2d00", "#C94A2D", "💡"],
    fiction: ["#1a1208", "#8B7355", "📝"],
    regional: ["#4a1a6e", "#9b59b6", "🌸"],
    default: ["#8B7355", "#C94A2D", "📚"],
}

const AI_COVERS: Record<string, string> = {
    engineering: "/category-covers/engineering.png",
    medical: "/category-covers/medical.png",
    jee: "/category-covers/jee.png",
    neet: "/category-covers/neet.png",
    upsc: "/category-covers/upsc.png",
    bank: "/category-covers/bank.png",
    science: "/category-covers/science.png",
    secondary: "/category-covers/secondary.png",
    school: "/category-covers/school.png",
    mba: "/category-covers/mba.png",
    ca: "/category-covers/ca.png",
    law: "/category-covers/law.png",
    selfhelp: "/category-covers/selfhelp.png",
    fiction: "/category-covers/fiction.png",
    regional: "/category-covers/regional.png",
    default: "/category-covers/default.png",
}

interface Props {
    isbn?: string
    title: string
    category?: string
    coverUrl?: string
    className?: string
}

export default function BookCoverImage({
    isbn,
    title,
    category = "default",
    coverUrl,
    className,
}: Props) {
    const aiCover = AI_COVERS[category] ?? AI_COVERS.default

    const buildUrls = () => {
        const list: string[] = []
        if (coverUrl?.startsWith("http") || coverUrl?.startsWith("blob:")) {
            list.push(coverUrl)
        }
        if (isbn) {
            list.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`)
            list.push(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`)
        }
        // Add the AI Category Image as a highly reliable fallback
        list.push(aiCover)
        return list
    }

    const urls = buildUrls()
    const [idx, setIdx] = useState(0)
    const [failed, setFailed] = useState(false)

    const advance = () => {
        if (idx + 1 < urls.length) setIdx(idx + 1)
        else setFailed(true)
    }

    // Handle standard network/404 errors
    const onError = () => advance()

    // Open Library returns 1x1 grey pixels instead of 404 sometimes
    const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget
        if (img.naturalWidth < 10 || img.naturalHeight < 10) {
            advance()
        }
    }

    const [c1, c2, emoji] = GRADIENTS[category] ?? GRADIENTS.default

    if (failed) {
        return (
            <div
                className={className}
                style={{
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(135deg,${c1},${c2})`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 8,
                    boxSizing: "border-box",
                }}
            >
                <span style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</span>
                <p
                    style={{
                        color: "rgba(255,255,255,0.95)",
                        fontSize: 10,
                        fontWeight: 700,
                        textAlign: "center",
                        lineHeight: 1.3,
                        margin: 0,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {title}
                </p>
            </div>
        )
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={urls[idx]}
            alt={title}
            className={className}
            onError={onError}
            onLoad={onLoad}
            style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
            }}
        />
    )
}
