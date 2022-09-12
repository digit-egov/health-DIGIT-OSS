package org.egov.rn.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.annotations.ApiModel;
import lombok.*;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * The request object, containing all necessary information for registering an entity and the request body metadata
 */
@ApiModel(description = "The request object, containing all necessary information for registering an entity and the request body metadata")
@Validated
@javax.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2022-08-25T14:10:15.466+05:30")

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class FormAdditionalDataSubmissionRequest {
 @JsonProperty("data")
 private List<FormDataSubmissionRequest> formDataSubmissionRequestList;
 private String schema;

}

