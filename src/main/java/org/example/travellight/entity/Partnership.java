package org.example.travellight.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "partnerships")
public class Partnership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String businessName;
    
    @Column(length = 100)
    private String ownerName;
    
    @Column(length = 255)
    private String email;
    
    @Column(length = 50)
    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    private double latitude;
    private double longitude;
    
    @Column(length = 100)
    private String businessType;
    
    @Column(length = 100)
    private String spaceSize;
    
    @Column(columnDefinition = "TEXT")
    private String additionalInfo;
    private boolean agreeTerms;
    private boolean is24Hours;

    @ElementCollection
    @CollectionTable(name = "partnership_business_hours",
            joinColumns = @JoinColumn(name = "partnership_id"))
    @MapKeyColumn(name = "day")
    @Column(name = "hours")
    private Map<String, String> businessHours = new HashMap<>();

    private String submissionId;
    private LocalDateTime createdAt;
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    private Integer smallBagsAvailable;
    private Integer mediumBagsAvailable;
    private Integer largeBagsAvailable;

    // 새로운 필드들 추가
    @ElementCollection
    @CollectionTable(name = "partnership_pictures",
            joinColumns = @JoinColumn(name = "partnership_id"))
    @Column(name = "picture_url", columnDefinition = "TEXT")
    private List<String> storePictures = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "partnership_amenities",
            joinColumns = @JoinColumn(name = "partnership_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    private Boolean insuranceAvailable = false;
    private Boolean hidden = false;

    @Column(columnDefinition = "TEXT")
    private String businessRegistrationUrl;

    @Column(columnDefinition = "TEXT")
    private String bankBookUrl;

    @Column(length = 100)
    private String accountNumber;
    
    @Column(length = 100)
    private String bankName;
    
    @Column(length = 100)
    private String accountHolder;

    @Column(length = 1000)
    private String rejectionReason;

    // 생성자
    public Partnership() {
        this.createdAt = LocalDateTime.now();
    }

    // Getter와 Setter 메소드들
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public double getLatitude() { return latitude; }

    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }

    public void setLongitude(double longitude) { this.longitude = longitude; }

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

    public Map<String, String> getBusinessHours() {
        return businessHours;
    }

    public void setBusinessHours(Map<String, String> businessHours) {
        this.businessHours = businessHours;
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getSmallBagsAvailable() { return smallBagsAvailable; }

    public void setSmallBagsAvailable(Integer smallBagsAvailable) { this.smallBagsAvailable = smallBagsAvailable; }

    public Integer getMediumBagsAvailable() { return mediumBagsAvailable; }

    public void setMediumBagsAvailable(Integer mediumBagsAvailable) { this.mediumBagsAvailable = mediumBagsAvailable; }

    public Integer getLargeBagsAvailable() { return largeBagsAvailable; }

    public void setLargeBagsAvailable(Integer largeBagsAvailable) { this.largeBagsAvailable = largeBagsAvailable; }

    public List<String> getStorePictures() { return storePictures; }

    public void setStorePictures(List<String> storePictures) { this.storePictures = storePictures; }

    public List<String> getAmenities() { return amenities; }

    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public Boolean getInsuranceAvailable() { return insuranceAvailable; }

    public void setInsuranceAvailable(Boolean insuranceAvailable) { this.insuranceAvailable = insuranceAvailable; }

    public Boolean getHidden() { return hidden; }

    public void setHidden(Boolean hidden) { this.hidden = hidden; }

    public String getBusinessRegistrationUrl() { return businessRegistrationUrl; }

    public void setBusinessRegistrationUrl(String businessRegistrationUrl) { this.businessRegistrationUrl = businessRegistrationUrl; }

    public String getBankBookUrl() { return bankBookUrl; }

    public void setBankBookUrl(String bankBookUrl) { this.bankBookUrl = bankBookUrl; }

    public String getAccountNumber() { return accountNumber; }

    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getBankName() { return bankName; }

    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountHolder() { return accountHolder; }

    public void setAccountHolder(String accountHolder) { this.accountHolder = accountHolder; }

    public String getRejectionReason() { return rejectionReason; }

    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}