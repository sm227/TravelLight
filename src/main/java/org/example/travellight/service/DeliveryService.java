package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.entity.Delivery;
import org.example.travellight.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    public Delivery saveDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }
    
    @Transactional(readOnly = true)
    public List<Delivery> getDeliveriesByReservationId(Long reservationId) {
        return deliveryRepository.findByReservationId(reservationId);
    }
} 