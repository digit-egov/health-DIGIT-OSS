package org.egov.rn.web.controllers;

import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.egov.rn.service.FormService;
import org.egov.rn.service.RegistrationService;
import org.egov.rn.web.models.*;
import org.egov.rn.web.utils.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.validation.Valid;
import java.util.List;

@javax.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2022-08-23T14:53:48.053+05:30")

@Controller
@Slf4j
@RequestMapping("/forms/v1")
public class FormsApiController {

    private final FormService formService;

    @Autowired
    public FormsApiController(FormService formService) {
        this.formService = formService;
    }

    @RequestMapping(value = "/_submit", method = RequestMethod.POST)
    public ResponseEntity<String> submitForm(@Valid @RequestBody FormSubmissionRequest formSubmissionRequest) {
        return ResponseEntity.ok(formService.submit(formSubmissionRequest));
    }
    
    @RequestMapping(value = "/_list/{formId}", method = RequestMethod.POST)
    public ResponseEntity<String> getFormById(@PathVariable("formId") String formId) {
        return ResponseEntity.ok(formService.getForm(formId=formId));
    }


}
