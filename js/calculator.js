// js/calculator.js
function calculateAccommodationCosts(checkInDate, checkOutDate, roomType) {
    // Sample Naver (야놀자) standard prices
    const roomPrices = {
        "single": 100000, // Price per night for single room
        "double": 150000, // Price per night for double room
        "suite": 250000   // Price per night for suite
    };

    // Calculate the number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDifference = checkOut - checkIn;
    const numberOfNights = timeDifference / (1000 * 3600 * 24);
    
    if (numberOfNights <= 0) {
        return "Check-out date must be after check-in date.";
    }
    
    const pricePerNight = roomPrices[roomType.toLowerCase()];
    if (!pricePerNight) {
        return "Invalid room type selected.";
    }

    const totalCost = pricePerNight * numberOfNights;
    return totalCost;
}

// Example usage:
// const totalCost = calculateAccommodationCosts('2026-03-08', '2026-03-10', 'double');
// console.log(`Total cost: ${totalCost} KRW`);