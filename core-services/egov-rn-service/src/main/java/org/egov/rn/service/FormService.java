package org.egov.rn.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.rn.kafka.RnProducer;
import org.egov.rn.repository.Registration.RegistrationRepository;
import org.egov.rn.service.models.State;
import org.egov.rn.validators.RegistrationValidator;
import org.egov.rn.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.Valid;
import java.util.List;

@Service
@Slf4j
public class FormService {


    @Autowired
    public FormService() {

    }

    public String submit(@Valid FormSubmissionRequest formSubmissionRequest){
        // TODO Implement
        return formSubmissionRequest.toString();
    }

    public String getForm(String id){
        return "";
    }
}
