package org.example.travellight.dto;

import java.util.List;
import java.util.Map;

public class PartnershipDto {
    private String businessName;
    private String ownerName;
    private String email;
    private String phone;
    private String address;
    private double latitude;
    private double longitude;
    private String businessType;
    private String spaceSize;
    private String additionalInfo;
    private boolean agreeTerms;
    private boolean is24Hours;
    private Map<String, BusinessHourDto> businessHours;
    private Integer smallBagsAvailable;
    private Integer mediumBagsAvailable;
    private Integer largeBagsAvailable;

    // 새로운 필드들
    private List<String> storePictures;
    private List<String> amenities;
    private Boolean insuranceAvailable;
    private Boolean hidden;
    private String businessRegistrationUrl;
    private String bankBookUrl;
    private String accountNumber;
    private String bankName;
    private String accountHolder;
    private String rejectionReason;

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

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
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

    public Integer getSmallBagsAvailable() {
        return smallBagsAvailable;
    }

    public void setSmallBagsAvailable(Integer smallBagsAvailable) {
        this.smallBagsAvailable = smallBagsAvailable;
    }

    public Integer getMediumBagsAvailable() {
        return mediumBagsAvailable;
    }

    public void setMediumBagsAvailable(Integer mediumBagsAvailable) {
        this.mediumBagsAvailable = mediumBagsAvailable;
    }

    public Integer getLargeBagsAvailable() {
        return largeBagsAvailable;
    }

    public void setLargeBagsAvailable(Integer largeBagsAvailable) {
        this.largeBagsAvailable = largeBagsAvailable;
    }

    public List<String> getStorePictures() {
        return storePictures;
    }

    public void setStorePictures(List<String> storePictures) {
        this.storePictures = storePictures;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public Boolean getInsuranceAvailable() {
        return insuranceAvailable;
    }

    public void setInsuranceAvailable(Boolean insuranceAvailable) {
        this.insuranceAvailable = insuranceAvailable;
    }

    public Boolean getHidden() {
        return hidden;
    }

    public void setHidden(Boolean hidden) {
        this.hidden = hidden;
    }

    public String getBusinessRegistrationUrl() {
        return businessRegistrationUrl;
    }

    public void setBusinessRegistrationUrl(String businessRegistrationUrl) {
        this.businessRegistrationUrl = businessRegistrationUrl;
    }

    public String getBankBookUrl() {
        return bankBookUrl;
    }

    public void setBankBookUrl(String bankBookUrl) {
        this.bankBookUrl = bankBookUrl;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountHolder() {
        return accountHolder;
    }

    public void setAccountHolder(String accountHolder) {
        this.accountHolder = accountHolder;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}