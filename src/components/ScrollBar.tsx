import React from "react";
import {Box, Text} from "ink";

interface ScrollBarProps {
    contentHeight: number;
    viewportHeight: number;
    scrollOffset: number;
    style?: "block" | "line";
}

export function ScrollBar({
    contentHeight,
    viewportHeight,
    scrollOffset,
    style = "block"
}: ScrollBarProps) {
    // Don't render if content fits in viewport
    if (contentHeight <= viewportHeight) {
        return null;
    }

    // Calculate thumb size and position
    const thumbSize = Math.max(1, Math.round((viewportHeight / contentHeight) * viewportHeight));
    const maxOffset = contentHeight - viewportHeight;
    const thumbPosition = Math.round((scrollOffset / maxOffset) * (viewportHeight - thumbSize));

    // Build the scroll bar characters
    const chars = style === "block"
        ? {thumb: "█", track: "░"}
        : {thumb: "┃", track: "│"};

    const bar = Array.from({length: viewportHeight}, (_, i) => {
        const isThumb = i >= thumbPosition && i < thumbPosition + thumbSize;
        return isThumb ? chars.thumb : chars.track;
    });

    return (
        <Box flexDirection="column">
            {bar.map((char, i) => (
                <Text key={i} dimColor={char === chars.track}>{char}</Text>
            ))}
        </Box>
    );
}
