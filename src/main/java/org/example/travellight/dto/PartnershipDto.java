package org.example.travellight.dto;

import java.util.Map;

public class PartnershipDto {
    private String businessName;
    private String ownerName;
    private String email;
    private String phone;
    private String address;
    private String businessType;
    private String spaceSize;
    private String additionalInfo;
    private boolean agreeTerms;
    private boolean is24Hours;
    private Map<String, BusinessHourDto> businessHours;

    // Inner 클래스로 비즈니스 시간 DTO 정의
    public static class BusinessHourDto {
        private boolean enabled;
        private String open;
        private String close;

        // Getter와 Setter
        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getOpen() {
            return open;
        }

        public void setOpen(String open) {
            this.open = open;
        }

        public String getClose() {
            return close;
        }

        public void setClose(String close) {
            this.close = close;
        }
    }

    // Getter와 Setter 메소드들
    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getSpaceSize() {
        return spaceSize;
    }

    public void setSpaceSize(String spaceSize) {
        this.spaceSize = spaceSize;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public boolean isAgreeTerms() {
        return agreeTerms;
    }

    public void setAgreeTerms(boolean agreeTerms) {
        this.agreeTerms = agreeTerms;
    }

    public boolean isIs24Hours() {
        return is24Hours;
    }

    public void setIs24Hours(boolean is24Hours) {
        this.is24Hours = is24Hours;
    }

    public Map<String, BusinessHourDto> getBusinessHours() {
        return businessHours;
    }

    public void setBusinessHours(Map<String, BusinessHourDto> businessHours) {
        this.businessHours = businessHours;
    }
}