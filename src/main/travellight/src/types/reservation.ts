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
    paymentMethod?: string; // 결제 방법 (card, paypal)
    paymentAmount?: number; // 결제 금액
    paymentTime?: string; // 결제 시간
    paymentStatus?: string; // 결제 상태 (PAID, FAILED, CANCELLED, REFUNDED)
    paymentProvider?: string; // 결제 제공자 (portone, paypal, tosspayments 등)
    cardCompany?: string; // 카드사명 (신한, 삼성, 현대 등)
    cardType?: string; // 카드 타입 (신용카드, 체크카드, 할부카드 등)
    couponCode?: string; // 사용한 쿠폰 코드
    couponName?: string; // 쿠폰 이름
    couponDiscount?: number; // 쿠폰 할인 금액
    originalPrice?: number; // 쿠폰 적용 전 원가
    createdAt?: string;
}

// Payment 엔티티 타입 정의
export interface PaymentDto {
    id: number;
    reservationId: number;
    paymentId: string; // 포트원 결제 ID
    transactionId?: string; // 거래 ID
    merchantId?: string; // 가맹점 ID
    storeId?: string; // 스토어 ID
    paymentMethod: string; // 결제 방법 (card, paypal, easypay 등)
    paymentProvider?: string; // 결제 제공자/PG사 (KCP_V2, TOSSPAYMENTS, PayPal 등)
    easyPayProvider?: string; // 간편결제 제공자 (TOSSPAY, NAVERPAY, KAKAOPAY 등)
    cardCompany?: string; // 카드사 (HANA_CARD, SHINHAN_CARD 등)
    cardType?: string; // 카드 타입 (CREDIT, DEBIT 등)
    cardNumber?: string; // 마스킹된 카드번호 (532750******0970)
    cardName?: string; // 카드명 (토스뱅크카드)
    installmentMonth?: number; // 할부 개월 (0이면 일시불)
    isInterestFree?: boolean; // 무이자 할부 여부
    approvalNumber?: string; // 승인번호
    paymentAmount?: number; // 결제 금액
    paymentStatus: string; // 결제 상태 (PENDING, PAID, FAILED, CANCELLED, REFUNDED)
    paymentTime?: string; // 결제 시간
    cancelledAt?: string; // 취소 시간
    cancelReason?: string; // 취소 사유
    refundAmount?: number; // 환불 금액
    channelType?: string; // 채널 타입 (TEST, LIVE)
    channelId?: string; // 채널 ID
    channelKey?: string; // 채널 키
    channelName?: string; // 채널명
    pgMerchantId?: string; // PG사 가맹점 ID
    pgTransactionId?: string; // PG사 거래 ID
    createdAt: string;
    updatedAt: string;
} 