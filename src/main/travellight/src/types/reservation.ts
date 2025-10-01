export interface ReservationDto {
    id: number;
    userId: number;
    userEmail: string;
    userName: string;
    placeName: string;
    placeAddress: string;
    placeLatitude?: number;
    placeLongitude?: number;
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
    paymentId?: string;
    createdAt?: string;
} 