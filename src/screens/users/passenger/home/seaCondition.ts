// utils/seaCondition.ts

const GALE_WARNING_URL = 'https://www.pagasa.dost.gov.ph/marine/gale-warning';

// Idinagdag na rin dito ang Batanes at Babuyan batay sa pagsubok mo
const WATCH_KEYWORDS = [
    'polillo',
    'burdeos',
    'panukulan',
    'patnanungan',
    'jomalig',
    'balesin',
    'real',
    'infanta',
    'general nakar',
    'quezon',
];

export type SeaCondition = 'calm' | 'moderate' | 'rough' | 'veryRough';

export interface SeaConditionData {
    waveHeight: number;
    condition: SeaCondition;
    isPAGASAWarning: boolean;
    noData: boolean;
    source: string;
    seaboardText?: string;
}

// Classification batay sa PAGASA sea-state scale
export const getCondition = (h: number): SeaCondition =>
    h < 0.5 ? 'calm' : h < 2.5 ? 'moderate' : h < 4.0 ? 'rough' : 'veryRough';

// Standard Fetch para i-scrape ang PAGASA Gale Warning HTML
async function scrapePAGASA(): Promise<{ height: number; seaboard: string } | null> {
    console.log('[seaCondition:PAGASA] --------------------------------------------------');
    console.log('[seaCondition:PAGASA] Step 1: Fetching PAGASA Gale Warning page...');
    console.log('[seaCondition:PAGASA] URL:', GALE_WARNING_URL);

    try {
        const response = await fetch(GALE_WARNING_URL, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
            },
        });

        console.log('[seaCondition:PAGASA] HTTP Response Status:', response.status, response.statusText);

        if (!response.ok) {
            console.warn('[seaCondition:PAGASA] Fetch failed with status:', response.status);
            return null;
        }

        const html = await response.text();
        console.log('[seaCondition:PAGASA] Received HTML payload size:', html.length, 'characters');

        // 1. Linisin ang HTML: alisin ang scripts, styles, at tags para maging malinis na text
        const cleanText = html
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ');

        console.log('[seaCondition:PAGASA] Scanning cleaned page text for watch area keywords...');

        const lowerText = cleanText.toLowerCase();

        // 2. Hanapin kung may nag-match na keyword
        const matchedKeyword = WATCH_KEYWORDS.find((kw) => lowerText.includes(kw.toLowerCase()));

        if (matchedKeyword) {
            console.log(`[seaCondition:PAGASA] MATCH FOUND! Keyword: "${matchedKeyword}"`);

            // 3. Kumuha ng 500-character snippet mula sa kinaroroonan ng keyword
            const keywordIndex = lowerText.indexOf(matchedKeyword.toLowerCase());
            const snippet = cleanText.substring(keywordIndex, keywordIndex + 500);

            console.log('[seaCondition:PAGASA] Extracted text snippet around keyword:');
            console.log(`"... ${snippet} ..."`);

            // 4. Regex patterns para sa wave height (e.g., "2.8-4.5 m", "2.8 - 4.5m", "3.0 m")
            const waveRangePattern = /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:m|meters)/gi;
            const singleWavePattern = /(\d+(?:\.\d+)?)\s*(?:m|meters)/gi;

            // Subukang mag-match sa Range (e.g. 2.8 - 4.5 m)
            const rangeMatch = [...snippet.matchAll(waveRangePattern)][0];
            if (rangeMatch) {
                const maxHeight = parseFloat(rangeMatch[2]); // Kukunin ang maximum height (4.5)
                console.log(`[seaCondition:PAGASA] Parsed Max Wave Height (from range "${rangeMatch[0]}"): ${maxHeight}m`);
                return { height: maxHeight, seaboard: matchedKeyword.toUpperCase() };
            }

            // Subukang mag-match sa Single value (e.g. 3.0 m)
            const singleMatch = [...snippet.matchAll(singleWavePattern)][0];
            if (singleMatch) {
                const height = parseFloat(singleMatch[1]);
                console.log(`[seaCondition:PAGASA] Parsed Single Wave Height (from "${singleMatch[0]}"): ${height}m`);
                return { height, seaboard: matchedKeyword.toUpperCase() };
            }

            console.warn('[seaCondition:PAGASA] Keyword was found, but wave height pattern could not be parsed near it.');
        } else {
            console.log('[seaCondition:PAGASA] No active gale warning found matching your watch area.');
        }
    } catch (error) {
        console.error('[seaCondition:PAGASA] Error during scraping:', error);
    }
    return null;
}

// Standard Fetch para sa Open-Meteo Marine API
async function fetchOpenMeteo(lat: number, lng: number): Promise<number | null> {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wind_wave_height&timezone=Asia/Manila`;
    console.log('[seaCondition:OpenMeteo] --------------------------------------------------');
    console.log('[seaCondition:OpenMeteo] Step 2: Fetching Open-Meteo Marine API...');
    console.log('[seaCondition:OpenMeteo] URL:', url);

    try {
        const response = await fetch(url);
        console.log('[seaCondition:OpenMeteo] Response Status:', response.status);

        if (!response.ok) {
            console.warn('[seaCondition:OpenMeteo] Fetch failed with status:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('[seaCondition:OpenMeteo] Raw Payload:', JSON.stringify(data.current));

        const waveH = data.current?.wave_height;
        const windWaveH = data.current?.wind_wave_height;

        console.log('[seaCondition:OpenMeteo] Parsed wave_height:', waveH);
        console.log('[seaCondition:OpenMeteo] Parsed wind_wave_height:', windWaveH);

        if (waveH === null || waveH === undefined) {
            console.warn('[seaCondition:OpenMeteo] No wave height grid data for this lat/lng.');
            return null;
        }

        const finalHeight = Math.max(waveH, windWaveH ?? 0);
        console.log('[seaCondition:OpenMeteo] Final wave height selected (Max of two):', finalHeight, 'm');
        return finalHeight;
    } catch (error) {
        console.error('[seaCondition:OpenMeteo] Error fetching Open-Meteo data:', error);
    }
    return null;
}

// Main exported function na gagamitin sa UI Component
export async function fetchSeaConditionData(lat: number, lng: number): Promise<SeaConditionData> {
    console.log('[seaCondition] ==================================================');
    console.log(`[seaCondition] START: Fetching Sea Condition for Lat: ${lat}, Lng: ${lng}`);

    // 1. Unahing suriin ang PAGASA Gale Warning Page
    const pagasaResult = await scrapePAGASA();

    if (pagasaResult !== null) {
        const condition = getCondition(pagasaResult.height);
        console.log('[seaCondition] OVERRIDE APPLIED: Active PAGASA Warning detected!');
        console.log('[seaCondition] Result:', {
            waveHeight: pagasaResult.height,
            condition,
            isPAGASAWarning: true,
            source: 'PAGASA Gale Warning',
            seaboardText: pagasaResult.seaboard,
        });
        console.log('[seaCondition] ==================================================');

        return {
            waveHeight: pagasaResult.height,
            condition,
            isPAGASAWarning: true,
            noData: false,
            source: 'PAGASA Gale Warning',
            seaboardText: pagasaResult.seaboard,
        };
    }

    // 2. Pag walang warning sa PAGASA, kunin mula sa Open-Meteo Forecast
    const openMeteoHeight = await fetchOpenMeteo(lat, lng);

    if (openMeteoHeight !== null) {
        const condition = getCondition(openMeteoHeight);
        console.log('[seaCondition] SUCCESS: Using Open-Meteo Marine Forecast data.');
        console.log('[seaCondition] Result:', {
            waveHeight: openMeteoHeight,
            condition,
            isPAGASAWarning: false,
            source: 'Open-Meteo Marine API',
        });
        console.log('[seaCondition] ==================================================');

        return {
            waveHeight: openMeteoHeight,
            condition,
            isPAGASAWarning: false,
            noData: false,
            source: 'Open-Meteo Marine API',
        };
    }

    // 3. Fallback pag parehong walang nakuha
    console.warn('[seaCondition] ERROR: Both PAGASA Scraper and Open-Meteo failed to produce data.');
    console.log('[seaCondition] ==================================================');

    return {
        waveHeight: 0,
        condition: 'calm',
        isPAGASAWarning: false,
        noData: true,
        source: 'None',
    };
}