package org.egov.rn.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class ServiceRequestRepository {
    private ObjectMapper objectMapper;
    private RestTemplate restTemplate;

    @Autowired
    public ServiceRequestRepository(ObjectMapper objectMapper, RestTemplate restTemplate) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
    }


    public Object fetchResult(StringBuilder uri, Object request) {
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        return restTemplate.postForObject(uri.toString(), request, Map.class);
    }

    public Object fetchResult(StringBuilder uri, Object request, Class clazz) {
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        System.out.println(request);
        return restTemplate.postForObject(uri.toString(), request, clazz);
    }
}
