"use client";

import { useEffect } from "react";
import { initializeUTMTracking } from "@/lib/utm";

/**
 * UTM Tracker Component
 * 
 * Initializes UTM tracking on page load.
 * Should be included in the root layout to capture UTM parameters
 * from the URL and store them in sessionStorage.
 */
export function UTMTracker() {
    useEffect(() => {
        initializeUTMTracking();
    }, []);

    return null; // This component doesn't render anything
}
