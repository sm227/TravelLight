-- Partnership 테이블 스키마 업데이트
-- 작성일: 2025-10-17
-- 목적: Base64 이미지 및 긴 텍스트 데이터 저장을 위한 컬럼 타입 변경

-- 1. 기본 정보 필드 타입 변경
ALTER TABLE partnerships ALTER COLUMN business_name TYPE VARCHAR(500);
ALTER TABLE partnerships ALTER COLUMN owner_name TYPE VARCHAR(100);
ALTER TABLE partnerships ALTER COLUMN email TYPE VARCHAR(255);
ALTER TABLE partnerships ALTER COLUMN phone TYPE VARCHAR(50);
ALTER TABLE partnerships ALTER COLUMN address TYPE TEXT;
ALTER TABLE partnerships ALTER COLUMN business_type TYPE VARCHAR(100);
ALTER TABLE partnerships ALTER COLUMN space_size TYPE VARCHAR(100);
ALTER TABLE partnerships ALTER COLUMN additional_info TYPE TEXT;

-- 2. 서류 및 이미지 필드 타입 변경 (Base64 인코딩된 이미지 저장)
ALTER TABLE partnerships ALTER COLUMN business_registration_url TYPE TEXT;
ALTER TABLE partnerships ALTER COLUMN bank_book_url TYPE TEXT;

-- 3. 계좌 정보 필드 타입 변경
ALTER TABLE partnerships ALTER COLUMN account_number TYPE VARCHAR(100);
ALTER TABLE partnerships ALTER COLUMN bank_name TYPE VARCHAR(100);
ALTER TABLE partnerships ALTER COLUMN account_holder TYPE VARCHAR(100);

-- 4. 거부 사유 필드 (이미 VARCHAR(1000)으로 설정되어 있을 수 있음)
ALTER TABLE partnerships ALTER COLUMN rejection_reason TYPE VARCHAR(1000);

-- 5. 매장 사진 테이블의 URL 필드 타입 변경 (Base64 이미지 저장)
ALTER TABLE partnership_pictures ALTER COLUMN picture_url TYPE TEXT;

-- 완료
-- 이 마이그레이션을 실행한 후 애플리케이션을 재시작하세요.

