"use client";

import React, {
    useEffect,
    useMemo,
    useState,
    useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    addStockToWatchlist,
    removeStockFromWatchlist,
} from "@/lib/actions/watchlist.actions";

interface WatchlistButtonProps {
    symbol: string;
    company: string;
    isInWatchlist: boolean;
    showTrashIcon?: boolean;
    type?: "button" | "icon";
    onWatchlistChange?: (
        symbol: string,
        isInWatchlist: boolean
    ) => void;
}

const WatchlistButton = ({
                             symbol,
                             company,
                             isInWatchlist,
                             showTrashIcon = false,
                             type = "button",
                             onWatchlistChange,
                         }: WatchlistButtonProps) => {
    const router = useRouter();

    const [added, setAdded] = useState(Boolean(isInWatchlist));
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setAdded(Boolean(isInWatchlist));
    }, [isInWatchlist]);

    const label = useMemo(() => {
        return added
            ? "Remove from Watchlist"
            : "Add to Watchlist";
    }, [added]);

    const handleClick = () => {
        if (isPending) return;

        const previousValue = added;
        const nextValue = !previousValue;

        setAdded(nextValue);

        startTransition(async () => {
            try {
                if (nextValue) {
                    await addStockToWatchlist({
                        symbol,
                        company,
                    });

                    toast.success(`${symbol} added to watchlist`);
                } else {
                    await removeStockFromWatchlist({
                        symbol,
                    });

                    toast.success(
                        `${symbol} removed from watchlist`
                    );
                }

                onWatchlistChange?.(symbol, nextValue);

                router.refresh();
            } catch (error) {
                setAdded(previousValue);

                console.error("WATCHLIST_BUTTON_ERROR:", error);

                toast.error("Watchlist update failed", {
                    description:
                        error instanceof Error
                            ? error.message
                            : "Please try again.",
                });
            }
        });
    };

    if (type === "icon") {
        return (
            <button
                type="button"
                disabled={isPending}
                title={
                    added
                        ? `Remove ${symbol} from watchlist`
                        : `Add ${symbol} to watchlist`
                }
                aria-label={
                    added
                        ? `Remove ${symbol} from watchlist`
                        : `Add ${symbol} to watchlist`
                }
                aria-pressed={added}
                className={`watchlist-icon-btn ${
                    added ? "watchlist-icon-added" : ""
                }`}
                onClick={handleClick}
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Star
                        className="watchlist-star"
                        fill={added ? "currentColor" : "none"}
                    />
                )}
            </button>
        );
    }

    return (
        <button
            type="button"
            disabled={isPending}
            aria-pressed={added}
            className={`watchlist-btn ${
                added ? "watchlist-remove" : ""
            }`}
            onClick={handleClick}
        >
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : showTrashIcon && added ? (
                <Trash2 className="mr-2 h-4 w-4" />
            ) : (
                <Star
                    className="mr-2 h-4 w-4"
                    fill={added ? "currentColor" : "none"}
                />
            )}

            <span>
                {isPending ? "Updating..." : label}
            </span>
        </button>
    );
};

export default WatchlistButton;