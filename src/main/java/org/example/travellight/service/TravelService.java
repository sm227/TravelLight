package org.example.travellight.service;

import org.example.travellight.entity.Travel;
import org.example.travellight.repository.TravelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TravelService {

    private final TravelRepository travelRepository;

    @Autowired
    public TravelService(TravelRepository travelRepository) {
        this.travelRepository = travelRepository;
    }

    // 테스트
    public Travel saveTravel(Travel travel) {
        return travelRepository.save(travel);
    }
}