/**
 * Debug script - Paste this in browser console to check household data
 */

// 1. Check if business property fields are being sent when saving
console.log('=== DEBUGGING BUSINESS PROPERTY ===');

// 2. Intercept fetch to see what's being sent
const originalFetch = window.fetch;
window.fetch = function (...args) {
    const [url, options] = args;

    if (url.includes('households')) {
        console.log('🔍 Household API Call:', url);
        if (options && options.body) {
            try {
                const body = JSON.parse(options.body);
                console.log('📦 Payload:', {
                    businessArea: body.business_area,
                    businessConstructionYear: body.business_construction_year,
                    businessFloors: body.business_floors,
                    businessRooms: body.business_rooms,
                    businessSector: body.business_sector
                });
            } catch (e) {
                console.log('📦 Body:', options.body);
            }
        }
    }

    return originalFetch.apply(this, args).then(response => {
        if (url.includes('households')) {
            response.clone().json().then(data => {
                console.log('✅ Response:', data);
            }).catch(() => { });
        }
        return response;
    });
};

console.log('✅ Debug interceptor installed. Now try to save a household with business property info.');
console.log('Watch the console for 🔍 and 📦 messages.');
