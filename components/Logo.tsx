import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type LogoVariant = 'nav' | 'hero' | 'footer' | 'loader' | 'icon';

interface LogoProps {
    variant: LogoVariant;
    darkBg?: boolean;
    onClick?: () => void;
    className?: string;
}

export default function RebookIndiaLogo({ variant, darkBg = false, onClick, className }: LogoProps) {
    const isNav = variant === 'nav';
    const isHero = variant === 'hero';
    const isFooter = variant === 'footer';
    const isLoader = variant === 'loader';
    const isIcon = variant === 'icon';

    const sphereSize = isLoader ? 72 : isIcon ? 64 : isHero ? 58 : isFooter ? 44 : 40;
    const textSize = isLoader ? 36 : isHero ? 30 : isFooter ? 24 : 22;
    const showTagline = isHero || isFooter || isLoader;
    const gap = isLoader ? 16 : isHero ? 14 : isFooter ? 12 : 10;

    const bookH = sphereSize * 0.34;
    const pageW = sphereSize * 0.22;
    const spineW = sphereSize * 0.04;

    const sparkSize = sphereSize * 0.13;
    const badgeSize = sphereSize * 0.24;

    return (
        <div
            className={twMerge(
                'relative flex items-center select-none',
                onClick && 'cursor-pointer hover:opacity-95 transition-opacity',
                className
            )}
            onClick={onClick}
            style={{ gap: `${gap}px` }}
        >
            {/* SPHERE */}
            <div
                className="relative rounded-full flex-shrink-0"
                style={{
                    width: sphereSize,
                    height: sphereSize,
                    background: 'radial-gradient(circle at 38% 32%, #F5C842 0%, #E8A020 42%, #C94A2D 100%)',
                    boxShadow: '0 4px 16px rgba(201,74,45,0.4), 0 0 0 1.5px rgba(232,160,32,0.25)',
                }}
            >
                {/* Sphere Container for clipping */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                    {/* GLOBE LINES */}
                    <div
                        className="absolute rounded-full border border-[rgba(26,18,8,0.18)]"
                        style={{ width: '100%', height: '28%', top: '36%', borderWidth: '1.5px' }}
                    />
                    <div className="absolute w-full h-[1px] bg-[rgba(26,18,8,0.13)] top-1/2" />
                    <div className="absolute h-full w-[1px] bg-[rgba(26,18,8,0.13)] left-1/2" />

                    {/* OPEN BOOK */}
                    <div className="absolute inset-0 flex items-center justify-center z-10" style={{ perspective: '100px' }}>
                        {/* Left Page */}
                        <div
                            style={{
                                width: pageW,
                                height: bookH,
                                background: 'rgba(250,246,236,0.93)',
                                borderRadius: '2px 0 0 2px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-evenly',
                                padding: '1px',
                                transform: 'rotateY(10deg)'
                            }}
                        >
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-[#8B7355]/50 h-[1.5px] rounded-full" style={{ width: i === 4 ? '60%' : '90%', marginLeft: 'auto' }} />
                            ))}
                        </div>
                        {/* Spine */}
                        <div
                            style={{
                                width: spineW,
                                height: bookH,
                                background: '#C94A2D',
                                opacity: 0.9,
                                borderRadius: '1px'
                            }}
                        />
                        {/* Right Page */}
                        <div
                            style={{
                                width: pageW,
                                height: bookH,
                                background: 'rgba(250,246,236,0.82)',
                                borderRadius: '0 2px 2px 0',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-evenly',
                                padding: '1px',
                                transform: 'rotateY(-10deg)'
                            }}
                        >
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-[#8B7355]/50 h-[1.5px] rounded-full" style={{ width: i === 4 ? '65%' : '90%' }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* GOLD SPARK */}
                <div
                    className="absolute z-20 rounded-full"
                    style={{
                        width: sparkSize,
                        height: sparkSize,
                        top: sphereSize * 0.10,
                        right: sphereSize * 0.10,
                        background: 'radial-gradient(circle at 35% 35%, #fff 20%, #F5C842 100%)',
                        boxShadow: '0 0 8px rgba(245,200,66,0.9)'
                    }}
                />

                {/* RUPEE BADGE */}
                <div
                    className="absolute z-20 flex items-center justify-center bg-[#C94A2D] text-[#FAF6EC] font-display font-bold rounded-full border border-white/20 shadow-sm"
                    style={{
                        width: badgeSize,
                        height: badgeSize,
                        bottom: sphereSize * 0.10,
                        left: sphereSize * -0.05,
                        fontSize: badgeSize * 0.65,
                        lineHeight: 1
                    }}
                >
                    ₹
                </div>
            </div>

            {/* TEXT PART */}
            {!isIcon && (
                <div className="flex flex-col justify-center">
                    <div className="tracking-tight leading-none" style={{ fontSize: textSize }}>
                        <span className={clsx("font-display font-bold", darkBg ? "text-[var(--color-cream)]" : "text-[var(--color-ink)]")}>
                            Rebook{" "}
                        </span>
                        <span className="font-display font-normal text-[var(--color-rust)]">
                            India
                        </span>
                    </div>

                    {showTagline && (
                        <div className="mt-1 flex flex-col w-full">
                            <div
                                className="font-body uppercase font-bold text-[#8B7355] whitespace-nowrap"
                                style={{ fontSize: Math.max(8, textSize * 0.3), letterSpacing: '2px' }}
                            >
                                Hyderabad's Book Marketplace
                            </div>
                            <div className="flex items-center w-full mt-1 opacity-70">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E8A020] to-[#E8A020]" />
                                <div className="w-1.5 h-1.5 bg-[#C94A2D] rotate-45 transform mx-1 border border-[#F5C842]" />
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E8A020] to-[#E8A020]" />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
