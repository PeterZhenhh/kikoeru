import type { AppEnv } from "../../types/hono.ts";
import { tryGetContext } from "hono/context-storage";

export const getRemoteDomain = () => {
    return tryGetContext<AppEnv>()?.env?.rprx_jasmr || "https://www.jasmr.net";
};

export { tracks } from "./tracks";
export { default as search } from "./search";
export { default as mediaStream } from "./mediaStream";
export { default as subtitle } from "./subtitle";

export type ApiVideo = {
    id: number;
    type: string;
    hqDownload: string;
    thumbnail: string;
    duration: string;
    rjCode: string;
    likes: number;
    saves: number;
    subtitled: boolean;
    isLiked: string;
    isSaved: number;
    title: {
        english: string;
        japanese: string;
        chinese: string;
        korean: string;
        spanish: string;
    };
    description: {
        english: string;
        japanese: string;
        chinese: string;
        korean: string;
        spanish: string;
    };
    circle: {
        id: number;
        romaji: string;
        kana: string;
        videos: number;
        followers: number;
        isFollowed: number;
    };
    captions: {
        english: string;
        japanese: string;
        chinese: string;
        korean: string;
        spanish: string;
    };
    images: string;
    tags: string;
    tracks: ReturnType<JSON["stringify"]>;
    ageRating: string;
    comments: string;
    userProgress: number;
    engagement: string;
    isTranslationRequested: number;
    source: string;
    earlyAccessLocked: boolean;
    related: {
        relevance: number;
        id: number;
        image: string;
        imageBlur: string;
        rjCode: string;
        language: string;
        ageRating: string;
        duration: string;
        subtitled: boolean;
        subtitleType: string;
        title: {
            english: string;
            japanese: string;
            chinese: string;
            korean: string;
            spanish: string;
        };
        circleId: number;
        circle: string;
        tags: string;
        views: number;
        likes: number;
        userProgress: number;
    }[];
};

export type VideoTracks = {
    title: {
        english: string;
        japanese: string;
        chinese: string;
        korean: string;
        spanish: string;
    };
    length: number;
}[];
