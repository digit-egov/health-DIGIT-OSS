package org.egov.rn.web.models;

import io.swagger.annotations.ApiModel;
import lombok.*;
import org.springframework.validation.annotation.Validated;

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
public class FormDataSubmissionRequest {
 private String key;
 private String value;
}

