export declare function normalizeTime(parms: {
    start?: string;
    end?: string;
    all_day?: boolean;
    timeZone: string;
}): {
    start_on: string | undefined;
    end_on: string | undefined;
    all_day: true;
    start_at?: undefined;
    end_at?: undefined;
} | {
    start_at: string | undefined;
    all_day: false | undefined;
    end_at: string | undefined;
    start_on?: undefined;
    end_on?: undefined;
};
export declare function tollmTime(parms: {
    start_on?: string;
    end_on?: string;
    start_at?: string;
    end_at?: string;
    all_day: boolean;
    timeZone: string;
}): {
    start_at: string | undefined;
    end_at: string | undefined;
    all_day: false;
} | {
    start_at: string | undefined;
    end_at: string | undefined;
    all_day: true;
};
export declare function toLlmData(parms: {
    start_on?: string;
    end_on?: string;
    start_at?: string;
    end_at?: string;
    all_day?: boolean;
    timeZone: string;
}): {
    start: string | undefined;
    end: string | undefined;
    all_day: false | undefined;
} | {
    start: string | undefined;
    end: string | undefined;
    all_day: true;
};
