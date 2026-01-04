import React, {useRef, useState, useEffect} from "react";
import {Text, Box, useInput} from "ink";
import type {Song} from "../types/index.js";
import {ScrollList, type ScrollListRef} from "ink-scroll-list";
import {ScrollBar} from "./ScrollBar.js";

interface MenuProps {
    songs: Song[];
    selectedIndex: number;
    onSelect: (song: Song) => void;
    onNavigate: (delta: number) => void;
    onSearch: () => void;
}

export function Menu({songs, selectedIndex, onSelect, onNavigate, onSearch}: MenuProps) {
    const listRef = useRef<ScrollListRef>(null);
    const [scrollOffset, setScrollOffset] = useState(0);

    useEffect(() => {
        const viewportHeight = 5;
        // Calculate scroll offset to match ScrollList's 'auto' alignment
        // Keep selected item in view with minimal scrolling
        setScrollOffset(prev => {
            if (selectedIndex < prev) {
                // Scrolled above viewport - snap to top
                return selectedIndex;
            } else if (selectedIndex >= prev + viewportHeight) {
                // Scrolled below viewport - snap to bottom
                return selectedIndex - viewportHeight + 1;
            }
            // Item still in viewport - keep current offset
            return prev;
        });
    }, [selectedIndex]);

    useInput((input, key) => {
        if (input === "s" || input === "S") {
            onSearch();
            return;
        }
        if (key.upArrow) {
            onNavigate(-1);
        } else if (key.downArrow) {
            onNavigate(1);
        } else if (key.return) {
            if (songs[selectedIndex]) {
                onSelect(songs[selectedIndex]);
            }
        }
    });

    if (songs.length === 0) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color="yellow">No local songs found.</Text>
                <Text dimColor>
                    Add JSON files to the lyrics/ folder, or press [S] to search online.
                </Text>
                <Box marginTop={1}>
                    <Text dimColor>[S] Search online | Ctrl+C to exit</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">
                Select a song (↑/↓ to navigate, Enter to select):
            </Text>
            {/*<Box flexDirection="column" marginTop={1}>*/}
            {/*  {songs.map((song, index) => (*/}
            {/*    <Box key={song.filename || index}>*/}
            {/*      <Text*/}
            {/*        color={index === selectedIndex ? "green" : undefined}*/}
            {/*        bold={index === selectedIndex}*/}
            {/*      >*/}
            {/*        {index === selectedIndex ? "▸ " : "  "}*/}
            {/*        {song.title}*/}
            {/*        <Text dimColor> - {song.artist}</Text>*/}
            {/*      </Text>*/}
            {/*    </Box>*/}
            {/*  ))}*/}
            {/*</Box>*/}
            <Box marginTop={1}>
                <Box flexDirection="row">
                    <ScrollList
                        ref={listRef}
                        flexDirection="column"
                        height={5}
                        selectedIndex={selectedIndex}
                        width={50}
                    >
                        {songs.map((song, index) => (
                            <Box key={song.filename || index}>
                                <Text
                                    color={index === selectedIndex ? "green" : undefined}
                                    bold={index === selectedIndex}
                                >
                                    {index === selectedIndex ? "▸ " : "  "}
                                    {song.title}
                                    <Text dimColor> - {song.artist}</Text>
                                </Text>
                            </Box>
                        ))}
                    </ScrollList>
                    <Box marginLeft={1} flexShrink={0}>
                        <ScrollBar
                            contentHeight={songs.length}
                            viewportHeight={5}
                            scrollOffset={scrollOffset}
                        />
                    </Box>
                </Box>
            </Box>
            <Box marginTop={1}>
                <Text dimColor>[S] Search online | Ctrl+C to exit</Text>
            </Box>
        </Box>
    );
}
