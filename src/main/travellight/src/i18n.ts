import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      home: 'Home',
      services: 'Services',
      howItWorks: 'Usage',
      pricing: 'Price',
      partnership: 'Partnership',
      myPage: 'My Page',
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Sign Out',
      language: 'Language',
      storageService: 'Storage Service Partnership',
      eventStorage: 'Event Storage Service',
      partner: 'Partner Portal',
      profile: 'My Profile',
      settings: 'Settings',
      greeting: 'Hello, ',
      korean: 'Korean',
      english: 'English',
      heroTitle1: 'Travel light,',
      heroTitle2: 'Let TravelLight handle your luggage',
      heroDescription: 'Are you bothered by heavy luggage during your travels? TravelLight safely stores and delivers your belongings. Experience travel freedom with our attended storage, self-storage, and luggage delivery services.',
      useService: 'Use Service',
      learnMore: 'Learn More',
      attendedStorage: 'Attended Storage',
      attendedStorageDesc: 'Professional staff safely stores your luggage.',
      selfStorage: 'Self Storage',
      selfStorageDesc: '24-hour self-storage service available anytime.',
      luggageDelivery: 'Luggage Delivery',
      luggageDeliveryDesc: 'We deliver your luggage safely to your desired location.',
      ourServices: 'Our Services',
      servicesDescription: 'TravelLight offers three core services tailored to travelers\' diverse needs. Experience the optimal solution for travel freedom.',
      attendedServiceTitle: 'Attended Storage Service',
      attendedServiceDesc: 'Professional staff safely stores your luggage in a secure facility.',
      useAttendedStorage: 'Use Attended Storage',
      selfStorageTitle: 'Self Storage Service',
      useSelfStorage: 'Use Self Storage',
      deliveryServiceTitle: 'Luggage Delivery Service',
      deliveryServiceDesc: 'We safely deliver your luggage from your travel destination to your next destination.',
      useDeliveryService: 'Use Delivery Service',
      feature1: 'Safe luggage storage by professional staff',
      feature2: '24-hour security system operation',
      feature3: 'Various sizes of luggage storage available',
      feature4: 'Long-term storage discount benefits',
      feature5: 'Luggage check service during storage',
      feature6: 'Available 24/7',
      feature7: 'Easy reservation and payment with app',
      feature8: 'Various sizes of lockers provided',
      feature9: 'Hourly rate system',
      feature10: 'Located at major tourist sites and transportation hubs',
      feature11: 'Same-day delivery service',
      feature12: 'Real-time delivery tracking',
      feature13: 'Safe packaging service',
      feature14: 'Insurance service provided',
      feature15: 'Delivery available nationwide',
      footerDescription: 'We provide the best luggage storage and delivery services for travel freedom. Use it conveniently anytime, anywhere.',
      footerServices: 'Services',
      attendedStorage2: 'Attended Storage',
      selfStorage2: 'Self Storage',
      luggageDelivery2: 'Luggage Delivery',
      priceGuide: 'Price Guide',
      howToUse: 'How to Use',
      aboutCompany: 'About Company',
      aboutUs: 'About Us',
      notice: 'Notice',
      pressRelease: 'Press Release',
      careers: 'Careers',
      partnership2: 'Partnership',
      customerSupport: 'Customer Support',
      faq: 'FAQ',
      inquiry: '1:1 Inquiry',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      location: 'Location',
      customerCenter: 'Customer Center',
      businessHours: 'Weekdays 09:00 - 18:00',
      closed: 'Closed on weekends and holidays',
      allRights: 'All rights reserved.',
      myPageTitle: 'My Page',
      myPageDescription: 'Check your travel history and manage your account information.',
      tripCheck: 'Check Trips',
      editInfo: 'Edit Information',
      dateRange: 'Date Range',
      recentMonths: 'Last 3 months ~ Service Type All Types ~',
      loading: 'Loading...',
      noReservations: 'No reservations found.',
      reservationNumber: 'Reservation No. : ',
      storageStart: 'Storage Start : ',
      storageEnd: 'Storage End : ',
      luggageCount: 'Luggage Count : Small ',
      mediumBags: ', Medium ',
      largeBags: ', Large ',
      totalPrice: 'Total Price : ',
      viewDetails: 'View Details',
      editInfoMessage: 'Account information edit feature is under development.',
      statusReserved: 'Reserved',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled',
      pieces: ' pieces',
      whereToGo: 'Where to go?',
      search: 'Search',
      start: 'Start',
      end: 'End',
      noPhoneNumber: 'No phone number',
      bankHours: 'Weekdays 09:00 - 16:00',
      storeHours: '24 hours',
      close: 'Close',
      backToList: 'Back to list',
      makeReservation: 'Make reservation',
      cardPayment: 'Card Payment',
      paymentAmount: 'Payment amount: ',
      enterCardInfo: 'Enter card information',
      cardNumber: 'Card number',
      expiryDate: 'Expiry date (MM/YY)',
      cardholderName: 'Cardholder name',
      cardholderNamePlaceholder: 'Name as shown on card',
      termsAgreement: 'By proceeding with payment, you agree to TravelLight\'s Terms of Service and Privacy Policy.',
      pay: 'Pay',
      paymentComplete: 'Payment Complete!',
      reservationSuccess: 'Your luggage storage reservation at ',
      hasBeenCompleted: ' has been successfully completed.',
      reservationDate: 'Reservation date',
      reservationTime: 'Reservation time',
      storedItems: 'Stored items',
      none: 'None',
      storageLocation: 'Storage location',
      address: 'Address',
      reservationEmailSent: 'Reservation details have been sent to your email.',
      confirm: 'Confirm',
      luggageStorageReservation: 'Luggage Storage Reservation',
      selectLuggage: 'Select luggage to store',
      smallBag: 'Small bag',
      smallBagDesc: '15-inch laptop bag, backpack, etc.',
      mediumBag: 'Medium bag',
      mediumBagDesc: 'Carry-on (up to 24 inches), medium-sized bag',
      largeBag: 'Large bag',
      largeBagDesc: 'Carry-on (over 24 inches), large bag',
      dayPerPrice: ' / day',
      storageDuration: 'Storage duration',
      daySameDay: 'Same day',
      periodStorage: 'Period',
      year: '',
      month: '',
      day: '',
      storageDate: 'Storage date',
      storageStartDate: 'Start date',
      loginRequired: 'Login required',
      loginRequiredMessage: 'You must be logged in to save a reservation.',
      reservationSaveError: 'An error occurred while saving reservation information',
      reservationSaveErrorRetry: 'An error occurred while saving reservation information. Please try again.',
      storageTime: 'Storage Time',
      startTime: 'Start Time',
      endTime: 'End Time',
      operatingHours: 'Operating hours: 00:00 ~ 23:59',
      selectDateAndTime: 'Please select date and time',
      totalAmount: 'Total amount',
      selectAllDateAndTime: 'Please select all dates and times',
      storeLocation: 'Store Location',
      won: ' KRW',
      storageEndDate: 'End date',
      operatingHoursFormat: '* Operating hours: %s ~ %s',
      operatingHoursDefault: '* Operating hours: 09:00 ~ 18:00',
      operatingHoursWarning: ' (Please set within operating hours)',
      setWithinOperatingHours: 'Please set within operating hours',
      processing: "Processing",
      processingPayment: "Processing Payment",
      
      // Partner page translations
      partnerWelcome: 'TravelLight Partner Program',
      partnerDescription: 'Provide luggage storage services to customers and generate additional revenue. Help travelers with convenience and grow your business with TravelLight.',
      storeManagement: 'Store Management',
      storeManagementDescription: 'Manage reservations, store information, operating hours, and all other features needed for store operation.',
      manageStore: 'Manage Store',
      mapView: 'View Map',
      mapViewDescription: 'View your store location and surrounding TravelLight partner stores on the map.',
      viewMap: 'View Map',
      partnerBenefits: 'Partner Program Benefits',
      additionalRevenue: 'Additional Revenue',
      additionalRevenueDescription: 'Generate additional revenue using idle space. Get new business opportunities through travelers\' luggage storage needs.',
      increasedTraffic: 'Increased Traffic',
      increasedTrafficDescription: 'Travelers who come to store their luggage are likely to purchase products or services in your store. Secure a new customer base.',
      marketingSupport: 'Marketing Support',
      marketingSupportDescription: 'Your store gets exposure on the TravelLight app and website for promotional effect. It\'s an opportunity to naturally introduce your store to travelers.',
      howToJoin: 'How to Join as a Partner',
      joinDescription: 'You can become a TravelLight partner through a simple process. Please follow the steps below:',
      registerTitle: 'Apply',
      registerDescription: 'Apply for partnership by entering the necessary information on the Partnership Inquiry page.',
      reviewTitle: 'Review and Approval',
      reviewDescription: 'The TravelLight team will review your application and notify you of the approval by email.',
      startTitle: 'Start Service',
      startDescription: 'Create a partner account after approval to access the store management system and start the service.',
      joinNow: 'Join as a Partner Now',
      joinNowDescription: 'Contact us if you need more information. The TravelLight team will guide you in detail.',
      applyNow: 'Apply Now'
    }
  },
  ko: {
    translation: {
      home: '홈',
      services: '서비스',
      howItWorks: '이용방법',
      pricing: '가격',
      partnership: '제휴·협업 문의',
      myPage: '마이페이지',
      login: '로그인',
      register: '회원가입',
      logout: '로그아웃',
      language: '언어',
      storageService: '짐보관 서비스 제휴 신청',
      eventStorage: '콘서트 및 행사 전용 이동식 짐보관 신청',
      partner: '파트너',
      profile: '내 프로필',
      settings: '설정',
      greeting: '안녕하세요, ',
      korean: '한국어',
      english: 'English',
      heroTitle1: '여행은 가볍게,',
      heroTitle2: '짐은 TravelLight에게',
      heroDescription: '여행 중 무거운 짐 때문에 불편하셨나요? TravelLight가 여러분의 짐을 안전하게 보관하고 배송해 드립니다. 유인보관, 무인보관, 짐배송 서비스로 여행의 자유를 느껴보세요.',
      useService: '서비스 이용하기',
      learnMore: '더 알아보기',
      attendedStorage: '유인보관',
      attendedStorageDesc: '전문 직원이 여러분의 짐을 안전하게 보관합니다.',
      selfStorage: '무인보관',
      selfStorageDesc: '24시간 언제든지 이용 가능한 무인 보관함으로 편리하게 짐을 보관하세요.',
      luggageDelivery: '짐배송',
      luggageDeliveryDesc: '원하는 장소로 짐을 안전하게 배송해 드립니다.',
      ourServices: '우리의 서비스',
      servicesDescription: 'TravelLight는 여행자들의 다양한 니즈에 맞춘 세 가지 핵심 서비스를 제공합니다. 여행의 자유를 위한 최적의 솔루션을 경험해보세요.',
      attendedServiceTitle: '유인보관 서비스',
      attendedServiceDesc: '전문 직원이 상주하는 보관소에서 여러분의 짐을 안전하게 보관해 드립니다.',
      useAttendedStorage: '유인보관 이용하기',
      selfStorageTitle: '무인보관 서비스',
      useSelfStorage: '무인보관 이용하기',
      deliveryServiceTitle: '짐배송 서비스',
      deliveryServiceDesc: '여행지에서 다음 목적지까지 짐을 안전하게 배송해 드립니다.',
      useDeliveryService: '짐배송 이용하기',
      feature1: '전문 직원의 안전한 짐 보관',
      feature2: '24시간 보안 시스템 운영',
      feature3: '다양한 크기의 짐 보관 가능',
      feature4: '장기 보관 할인 혜택',
      feature5: '보관 중 짐 확인 서비스',
      feature6: '24시간 연중무휴 이용 가능',
      feature7: '앱으로 간편한 예약 및 결제',
      feature8: '다양한 크기의 보관함 제공',
      feature9: '시간 단위 요금제',
      feature10: '주요 관광지 및 교통 요지에 위치',
      feature11: '당일 배송 서비스',
      feature12: '실시간 배송 추적',
      feature13: '안전한 포장 서비스',
      feature14: '보험 서비스 제공',
      feature15: '국내 전 지역 배송 가능',
      footerDescription: '여행의 자유를 위한 최고의 짐 보관 및 배송 서비스를 제공합니다. 언제 어디서나 편리하게 이용하세요.',
      footerServices: '서비스',
      attendedStorage2: '유인보관',
      selfStorage2: '무인보관',
      luggageDelivery2: '짐배송',
      priceGuide: '가격안내',
      howToUse: '이용방법',
      aboutCompany: '회사소개',
      aboutUs: '회사소개',
      notice: '공지사항',
      pressRelease: '보도자료',
      careers: '채용정보',
      partnership2: '파트너십',
      customerSupport: '고객지원',
      faq: '자주 묻는 질문',
      inquiry: '1:1 문의',
      termsOfService: '이용약관',
      privacyPolicy: '개인정보처리방침',
      location: '위치',
      customerCenter: '고객센터',
      businessHours: '평일 09:00 - 18:00',
      closed: '주말 및 공휴일 휴무',
      allRights: 'All rights reserved.',
      myPageTitle: '마이페이지',
      myPageDescription: '여행 내역 확인 및 회원 정보를 관리하세요.',
      tripCheck: '여행 확인',
      editInfo: '정보 수정',
      dateRange: '날짜 범위',
      recentMonths: '최근 3개월 ~ 서비스 유형 모든 유형 ~',
      loading: '로딩 중...',
      noReservations: '예약 내역이 없습니다.',
      reservationNumber: '예약번호 : ',
      storageStart: '보관 시작 : ',
      storageEnd: '보관 종료 : ',
      luggageCount: '짐 개수 : 소형 ',
      mediumBags: ', 중형 ',
      largeBags: ', 대형 ',
      totalPrice: '총 금액 : ',
      viewDetails: '상세보기',
      editInfoMessage: '회원 정보 수정 기능은 준비 중입니다.',
      statusReserved: '예약완료',
      statusCompleted: '이용완료',
      statusCancelled: '취소됨',
      pieces: '개',
      whereToGo: '어디로 가시나요?',
      search: '검색',
      start: '시작',
      end: '종료',
      noPhoneNumber: '전화번호 정보 없음',
      bankHours: '평일 09:00 - 16:00',
      storeHours: '24시간 영업',
      close: '닫기',
      backToList: '목록으로 돌아가기',
      makeReservation: '예약하기',
      cardPayment: '카드 결제',
      paymentAmount: '결제 금액: ',
      enterCardInfo: '카드 정보 입력',
      cardNumber: '카드 번호',
      expiryDate: '만료일 (MM/YY)',
      cardholderName: '카드 소유자 이름',
      cardholderNamePlaceholder: '카드에 표시된 이름',
      termsAgreement: '결제를 진행하면 TravelLight의 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.',
      pay: '결제하기',
      paymentComplete: '결제가 완료되었습니다!',
      reservationSuccess: '가방 보관 예약이 성공적으로 완료되었습니다.',
      hasBeenCompleted: '에',
      reservationDate: '예약 날짜',
      reservationTime: '예약 시간',
      storedItems: '보관 물품',
      none: '없음',
      storageLocation: '보관 장소',
      address: '주소',
      reservationEmailSent: '예약 정보가 이메일로 발송되었습니다.',
      confirm: '확인',
      luggageStorageReservation: '가방 보관 예약',
      selectLuggage: '보관할 가방 선택',
      smallBag: '소형 가방',
      smallBagDesc: '15인치 노트북 가방, 배낭 등',
      mediumBag: '중형 가방',
      mediumBagDesc: '캐리어(24인치 이하), 중형 가방',
      largeBag: '대형 가방',
      largeBagDesc: '캐리어(24인치 이상), 대형 가방',
      dayPerPrice: '원 / 일',
      storageDuration: '보관 기간 설정',
      daySameDay: '당일 보관',
      periodStorage: '기간 보관',
      year: '년',
      month: '월',
      day: '일',
      storageDate: '보관 날짜',
      storageStartDate: '시작 날짜',
      loginRequired: '로그인이 필요합니다',
      loginRequiredMessage: '로그인이 필요합니다. 예약을 저장하려면 로그인 상태여야 합니다.',
      reservationSaveError: '예약 정보를 저장하는 중 오류가 발생했습니다',
      reservationSaveErrorRetry: '예약 정보를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      storageTime: '보관 시간',
      startTime: '시작 시간',
      endTime: '종료 시간',
      operatingHoursFormat: '* 운영 시간 : %s ~ %s',
      operatingHours: '운영 시간 : 00:00 ~ 23:59',
      selectDateAndTime: '보관 날짜와 시간을 선택해주세요',
      totalAmount: '총 금액',
      selectAllDateAndTime: '날짜와 시간을 모두 선택해주세요',
      storeLocation: '매장 위치',
      won: '원',
      storageEndDate: '종료 날짜',
      operatingHoursDefault: '* Operating hours: 09:00 ~ 18:00',
      operatingHoursWarning: ' (운영 시간 내로 설정해주세요)',
      setWithinOperatingHours: '운영 시간 내로 설정해주세요',
      processing: "처리 중",
      processingPayment: "결제를 처리하고 있습니다",
      
      // Partner page translations
      partnerWelcome: '트래블라이트 파트너 프로그램',
      partnerDescription: '고객들에게 수하물 보관 서비스를 제공하고 추가 수익을 창출하세요. 트래블라이트와 함께 여행자들의 편의를 돕고 비즈니스를 성장시키세요.',
      storeManagement: '매장 관리',
      storeManagementDescription: '예약 관리, 매장 정보 설정, 운영 시간 조정 등 매장 운영에 필요한 모든 기능을 제공합니다.',
      manageStore: '매장 관리하기',
      mapView: '지도 보기',
      mapViewDescription: '내 매장 위치 및 주변 트래블라이트 파트너 매장을 지도에서 확인하세요.',
      viewMap: '지도 보기',
      partnerBenefits: '파트너 프로그램 혜택',
      additionalRevenue: '추가 수익 창출',
      additionalRevenueDescription: '유휴 공간을 활용해 추가 수익을 창출하세요. 여행자들의 수하물 보관 수요를 통해 새로운 비즈니스 기회를 얻을 수 있습니다.',
      increasedTraffic: '방문객 증가',
      increasedTrafficDescription: '수하물을 맡기러 온 여행자들이 매장 내 상품이나 서비스를 구매할 가능성이 높아집니다. 새로운 고객층을 확보하세요.',
      marketingSupport: '마케팅 지원',
      marketingSupportDescription: '트래블라이트 앱과 웹사이트에 매장이 노출되어 홍보 효과를 얻을 수 있습니다. 여행자들에게 자연스럽게 매장을 알릴 수 있는 기회입니다.',
      howToJoin: '파트너 가입 방법',
      joinDescription: '간단한 절차를 통해 트래블라이트 파트너가 될 수 있습니다. 아래 단계를 따라 진행해 주세요:',
      registerTitle: '가입 신청',
      registerDescription: '제휴·협업 문의 페이지에서 필요한 정보를 입력하여 파트너 가입을 신청합니다.',
      reviewTitle: '검토 및 승인',
      reviewDescription: '트래블라이트 팀이 신청 내용을 검토하고 승인 여부를 이메일로 안내해 드립니다.',
      startTitle: '서비스 시작',
      startDescription: '승인 후 파트너 계정을 생성하여 매장 관리 시스템에 접속하고 서비스를 시작합니다.',
      joinNow: '지금 파트너 가입하기',
      joinNowDescription: '더 많은 정보가 필요하시면 문의하세요. 트래블라이트 팀이 상세히 안내해 드리겠습니다.',
      applyNow: '지금 신청하기'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('preferredLanguage') || 'ko',
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n; 