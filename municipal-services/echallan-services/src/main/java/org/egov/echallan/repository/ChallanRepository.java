package org.egov.echallan.repository;

import lombok.extern.slf4j.Slf4j;

import java.io.ObjectInputStream.GetField;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egov.common.contract.request.RequestInfo;
import org.egov.echallan.config.ChallanConfiguration;
import org.egov.echallan.model.Challan;
import org.egov.echallan.model.ChallanRequest;
import org.egov.echallan.model.SearchCriteria;
import org.egov.echallan.producer.Producer;
import org.egov.echallan.repository.builder.ChallanQueryBuilder;
import org.egov.echallan.repository.rowmapper.ChallanCountRowMapper;
import org.egov.echallan.repository.rowmapper.ChallanRowMapper;
import org.egov.echallan.util.CommonUtils;
import org.egov.echallan.web.models.collection.Bill;
import org.egov.echallan.web.models.collection.PaymentDetail;
import org.egov.echallan.web.models.collection.PaymentRequest;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.egov.echallan.util.ChallanConstants.*;
import static org.egov.echallan.repository.builder.ChallanQueryBuilder.*;


@Slf4j
@Repository
public class ChallanRepository {

    private Producer producer;
    
    private ChallanConfiguration config;

    private JdbcTemplate jdbcTemplate;

    private ChallanQueryBuilder queryBuilder;

    private ChallanRowMapper rowMapper;
    
    private RestTemplate restTemplate;

    @Value("${egov.filestore.host}")
    private String fileStoreHost;

    @Value("${egov.filestore.setinactivepath}")
	private String fileStoreInactivePath;

    @Autowired
	private ObjectMapper mapper;

    @Autowired
    private ChallanCountRowMapper countRowMapper;

    @Autowired
    private CommonUtils utils;

    @Autowired
    public ChallanRepository(Producer producer, ChallanConfiguration config,ChallanQueryBuilder queryBuilder,
    		JdbcTemplate jdbcTemplate,ChallanRowMapper rowMapper,RestTemplate restTemplate) {
        this.producer = producer;
        this.config = config;
        this.jdbcTemplate = jdbcTemplate;
        this.queryBuilder = queryBuilder ; 
        this.rowMapper = rowMapper;
        this.restTemplate = restTemplate;
    }



    /**
     * Pushes the request on save topic
     *
     * @param challanRequest The challan create request
     */
    public void save(ChallanRequest challanRequest) {
    	
        producer.push(challanRequest.getChallan().getTenantId(),config.getSaveChallanTopic(), challanRequest);
    }
    
    /**
     * Pushes the request on update topic
     *
     * @param challanRequest The challan create request
     */
    public void update(ChallanRequest challanRequest) {
    	
        producer.push(challanRequest.getChallan().getTenantId(),config.getUpdateChallanTopic(), challanRequest);
    }
    
    
    public List<Challan> getChallans(SearchCriteria criteria) {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = queryBuilder.getChallanSearchQuery(criteria, preparedStmtList);
        query = utils.replaceSchemaPlaceholder(query, criteria.getTenantId());
        List<Challan> challans =  jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
        return challans;
    }



	public void updateFileStoreId(List<Challan> challans) {
		List<Object[]> rows = new ArrayList<>();

        challans.forEach(challan -> {
        	rows.add(new Object[] {challan.getFilestoreid(),
        			challan.getId()}
        	        );
        });

        String query = FILESTOREID_UPDATE_SQL;
        query = utils.replaceSchemaPlaceholder(query, challans.get(0).getTenantId());
        jdbcTemplate.batchUpdate(query,rows);
		
	}
	
	 public void setInactiveFileStoreId(String tenantId, List<String> fileStoreIds)  {
			String idLIst = fileStoreIds.toString().substring(1, fileStoreIds.toString().length() - 1).replace(", ", ",");
			String Url = fileStoreHost + fileStoreInactivePath + "?tenantId=" + tenantId + "&fileStoreIds=" + idLIst;
			try {
				  restTemplate.postForObject(Url, null, String.class) ;
			} catch (Exception e) {
				log.error("Error in calling fileStore "+e.getMessage());
			}
			 
		}



	public void updateChallanOnCancelReceipt(HashMap<String, Object> record) {
		// TODO Auto-generated method stub

		PaymentRequest paymentRequest = mapper.convertValue(record, PaymentRequest.class);
		RequestInfo requestInfo = paymentRequest.getRequestInfo();

		List<PaymentDetail> paymentDetails = paymentRequest.getPayment().getPaymentDetails();
		String tenantId = paymentRequest.getPayment().getTenantId();

        // Adding in MDC so that tracer can add it in header
        MDC.put(TENANTID_MDC_STRING, tenantId);

		List<Object[]> rows = new ArrayList<>();
		for (PaymentDetail paymentDetail : paymentDetails) {
			Bill bill = paymentDetail.getBill();
			rows.add(new Object[] {bill.getConsumerCode(),
        			bill.getBusinessService()}
        	        );
		}
        String query = CANCEL_RECEIPT_UPDATE_SQL;
        query = utils.replaceSchemaPlaceholder(query, tenantId);
        jdbcTemplate.batchUpdate(query,rows);
		
	}

    /**
     * DB Repository that makes jdbc calls to the db and fetches challan count.
     *
     * @param tenantId
     * @return
     */
    public Map<String,String> fetchChallanCount(String tenantId){
        Map<String,String> response = new HashMap<>();
        List<Object> preparedStmtList = new ArrayList<>();

        String query = queryBuilder.getChallanCountQuery(tenantId, preparedStmtList);
        query = utils.replaceSchemaPlaceholder(query, tenantId);
        try {
            response=jdbcTemplate.query(query, preparedStmtList.toArray(),countRowMapper);
        }catch(Exception e) {
            log.error("Exception while making the db call: ",e);
            log.error("query; "+query);
        }
        return response;
    }
    
}
