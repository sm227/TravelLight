package org.example.travellight.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "partnerships")
public class Partnership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
}