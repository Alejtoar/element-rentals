"use client";

import React, { useState } from "react";
import { Hero } from "./Hero";
import { PropertyListing } from "./PropertyListing";
import { LeadForms } from "./LeadForms";

interface HomePageClientProps {
    dict: any;
    lang: "en" | "es";
}

export default function HomePageClient({ dict, lang }: HomePageClientProps) {
    const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
        startDate: "",
        endDate: "",
    });

    const handleSearch = (checkIn: string, checkOut: string) => {
        setDateFilter({ startDate: checkIn, endDate: checkOut });
    };

    return (
        <>
            <Hero
                dict={dict.hero}
                catalogDict={dict.catalog}
                lang={lang}
                onSearch={handleSearch}
            />
            <div id="property-catalog">
                <PropertyListing
                    dict={dict.catalog}
                    lang={lang}
                    propertyDict={dict.property_card}
                    initialStartDate={dateFilter.startDate}
                    initialEndDate={dateFilter.endDate}
                />
            </div>
            <div id="owner-lead-form">
                <LeadForms dict={dict.leads} lang={lang} />
            </div>
        </>
    );
}
