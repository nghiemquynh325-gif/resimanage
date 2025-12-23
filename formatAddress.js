/**
 * Format address to proper case
 * Example: "28/C4, KHU PHỐ 3, PHƯỜNG AN PHÚ, TP.HCM" 
 *       -> "28/C4, Khu Phố 3, Phường An Phú, Thành Phố Hồ Chí Minh"
 */
function formatAddress(address) {
    if (!address) return address;

    return address
        .toString()
        .trim()
        .split(',')
        .map(part => {
            // Trim and convert to lowercase
            const trimmed = part.trim().toLowerCase();

            // Split by spaces and capitalize first letter of each word
            return trimmed
                .split(' ')
                .map(word => {
                    if (word.length === 0) return word;
                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join(' ');
        })
        .join(', ');
}

// Add this function after formatName() in the script
// Copy and paste it into bulk-import-residents.js at line 355
