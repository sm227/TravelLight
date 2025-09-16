package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.entity.Delivery;
import org.example.travellight.entity.DeliveryStatus;
import org.example.travellight.entity.Driver;
import org.example.travellight.repository.DeliveryRepository;
import org.example.travellight.repository.DriverRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;

    public Delivery saveDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    @Transactional(readOnly = true)
    public List<Delivery> getDeliveriesByReservationId(Long reservationId) {
        return deliveryRepository.findByReservationId(reservationId);
    }

    @Transactional(readOnly = true)
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Delivery getDeliveryById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배달을 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<Delivery> getDeliveriesByDriverId(Long driverId) {
        return deliveryRepository.findByDriverIdOrderByRequestedAtDesc(driverId);
    }

    public void assignDriver(Long deliveryId, Long driverId) {
        Delivery delivery = getDeliveryById(deliveryId);
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("배달원을 찾을 수 없습니다."));

        delivery.assignToDriver(driver);
        deliveryRepository.save(delivery);
    }

    public void updateDeliveryStatus(Long deliveryId, DeliveryStatus status) {
        Delivery delivery = getDeliveryById(deliveryId);
        delivery.setStatus(status);

        if (status == DeliveryStatus.PICKED_UP) {
            delivery.markAsPickedUp();
        } else if (status == DeliveryStatus.DELIVERED) {
            delivery.markAsDelivered();
        }

        deliveryRepository.save(delivery);
    }

    @Transactional(readOnly = true)
    public List<Delivery> getPendingDeliveries() {
        return deliveryRepository.findPendingDeliveries();
    }

    @Transactional(readOnly = true)
    public List<Delivery> getUnassignedDeliveries() {
        return deliveryRepository.findUnassignedDeliveries();
    }
} 