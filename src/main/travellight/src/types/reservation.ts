export interface ReservationDto {
    id: number;
    userId: number;
    userEmail: string;
    userName: string;
    placeName: string;
    placeAddress: string;
    reservationNumber: string;
    storageDate: string;
    storageEndDate: string;
    storageStartTime: string;
    storageEndTime: string;
    smallBags: number;
    mediumBags: number;
    largeBags: number;
    totalPrice: number;
    storageType: 'day' | 'period';
    status: 'RESERVED' | 'COMPLETED' | 'CANCELLED';
} 