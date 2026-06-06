"use client";

export default function LoadingSkeleton() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="w-full space-y-4 animate-pulse">

                {/* Header Skeleton */}
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <div className="h-3 w-40 bg-[var(--surface-hover)] rounded-md"></div>
                    <div className="h-8 w-3/4 bg-[var(--surface-hover)] rounded-md"></div>

                    <div className="flex gap-2 mt-3 flex-wrap">
                        <div className="h-6 w-24 bg-[var(--surface-hover)] rounded-full"></div>
                        <div className="h-6 w-28 bg-[var(--surface-hover)] rounded-full"></div>
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="glass-panel rounded-2xl p-5 space-y-3"
                        >
                            <div className="h-3 w-20 bg-[var(--surface-hover)] rounded"></div>
                            <div className="h-6 w-32 bg-[var(--surface-hover)] rounded"></div>
                            <div className="h-4 w-24 bg-[var(--surface-hover)] rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="glass-panel rounded-2xl p-6 space-y-3">
                    <div className="h-4 w-32 bg-[var(--surface-hover)] rounded"></div>
                    <div className="h-3 w-full bg-[var(--surface-hover)] rounded"></div>
                    <div className="h-3 w-5/6 bg-[var(--surface-hover)] rounded"></div>
                    <div className="h-3 w-2/3 bg-[var(--surface-hover)] rounded"></div>
                </div>

            </div>
        </div>
    );
}