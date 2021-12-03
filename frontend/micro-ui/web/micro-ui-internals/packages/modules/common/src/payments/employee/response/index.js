import React, { useEffect } from "react";
import { Banner, Card, CardText, SubmitBar, ActionBar, DownloadPrefixIcon } from "@egovernments/digit-ui-react-components";
import { useHistory, useParams, Link, LinkLabel } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";

export const SuccessfulPayment = (props) => {
  const { addParams, clearParams } = props;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  props.setLink(t("PAYMENT_LOCALIZATION_RESPONSE"));
  let { consumerCode, receiptNumber, businessService } = useParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  receiptNumber = receiptNumber.replace(/%2F/g, "/");
  const { data = {}, isLoading } = Digit.Hooks.obps.useBPADetailsPage(tenantId, { applicationNo: consumerCode });

  useEffect(() => {
    return () => {
      queryClient.clear();
    };
  }, []);

  const getMessage = () => t("ES_PAYMENT_COLLECTED");
  // console.log("--------->", consumerCode);

  const { data: generatePdfKey } = Digit.Hooks.useCommonMDMS(tenantId, "common-masters", "ReceiptKey", {
    select: (data) =>
      data["common-masters"]?.uiCommonPay?.filter(({ code }) => businessService?.includes(code))[0]?.receiptKey || "consolidatedreceipt",
  });

  const printCertificate = async () => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = Digit.ULBService.getStateId();
    const applicationDetails = await Digit.TLService.search({ applicationNumber: consumerCode, tenantId });
    const generatePdfKeyForTL = "tlcertificate";

    if (applicationDetails) {
      let response = await Digit.PaymentService.generatePdf(state, { Licenses: applicationDetails?.Licenses }, generatePdfKeyForTL);
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
  };

  const getPermitOccupancyOrderSearch = async(order) => {
    // let requestData = {...data?.applicationData, edcrDetail:[{...data?.edcrDetails}]}
    // let response = await Digit.PaymentService.generatePdf(data?.applicationData?.tenantId, { Bpa: [requestData] }, order);
    // const fileStore = await Digit.PaymentService.printReciept(data?.applicationData?.tenantId, { fileStoreIds: response.filestoreIds[0] });
    // window.open(fileStore[response?.filestoreIds[0]], "_blank");

    let queryObj = { applicationNo: data?.applicationData?.applicationNo };
    let bpaResponse = await Digit.OBPSService.BPASearch(data?.applicationData?.tenantId, queryObj);
    const edcrResponse = await Digit.OBPSService.scrutinyDetails(data?.applicationData?.tenantId, { edcrNumber: data?.applicationData?.edcrNumber });
    let bpaData = bpaResponse?.BPA?.[0], edcrData = edcrResponse?.edcrDetail?.[0];
    let currentDate = new Date();
    bpaData.additionalDetails.runDate = convertDateToEpoch(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate());
    let reqData = {...bpaData, edcrDetail: [{...edcrData}]};
    let response = await Digit.PaymentService.generatePdf(data?.applicationData?.tenantId, { Bpa: [reqData] }, order);
    const fileStore = await Digit.PaymentService.printReciept(data?.applicationData?.tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }


  const printReciept = async () => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = Digit.ULBService.getStateId();
    const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
    let response = { filestoreIds: [payments.Payments[0]?.fileStoreId] };

    if (!payments.Payments[0]?.fileStoreId) {
      response = await Digit.PaymentService.generatePdf(state, { Payments: payments.Payments }, generatePdfKey);
      // console.log({ response });
    }
    const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response.filestoreIds[0]], "_blank");
  };

  return (
    <React.Fragment>
      <Card>
        <Banner message={getMessage()} info={t("PAYMENT_LOCALIZATION_RECIEPT_NO")} applicationNumber={receiptNumber} successful={true} />
        <CardText>{t("ES_PAYMENT_SUCCESSFUL_DESCRIPTION")}</CardText>
        {generatePdfKey ? (
          <div style={{ display: "flex" }}>
            <div className="primary-label-btn d-grid" style={{ marginLeft: "unset", marginRight: "20px" }} onClick={printReciept}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
              </svg>
              {t("CS_COMMON_PRINT_RECEIPT")}
            </div>
            {businessService == "TL" ? (
              <div className="primary-label-btn d-grid" style={{ marginLeft: "unset" }} onClick={printCertificate}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                </svg>
                {t("CS_COMMON_PRINT_CERTIFICATE")}
              </div>
            ) : null}
            {data?.applicationData?.businessService === "BPA_OC" && data?.applicationData?.status==="APPROVED" ? (
              <div className="primary-label-btn d-grid" style={{ marginLeft: "unset" }} onClick={e => getPermitOccupancyOrderSearch("occupancy-certificate")}>
                <DownloadPrefixIcon />
                {t("BPA_OC_CERTIFICATE")}
              </div>
            ) : null}
            {data?.applicationData?.businessService === "BPA_LOW" ? (
              <div className="primary-label-btn d-grid" style={{ marginLeft: "unset" }} onClick={r => getPermitOccupancyOrderSearch("buildingpermit-low")}>
                <DownloadPrefixIcon />
                {t("BPA_PERMIT_ORDER")}
              </div>
            ) : null}
            {data?.applicationData?.businessService === "BPA" && (data?.applicationData?.businessService !== "BPA_LOW") && (data?.applicationData?.businessService !== "BPA_OC") && data?.applicationData?.status==="PENDING_SANC_FEE_PAYMENT"? (
              <div className="primary-label-btn d-grid" style={{ marginLeft: "unset" }} onClick={r => getPermitOccupancyOrderSearch("buildingpermit")}>
                <DownloadPrefixIcon />
                {t("BPA_PERMIT_ORDER")}
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
      <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
        <Link to="/digit-ui/employee">
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      </ActionBar>
    </React.Fragment>
  );
};

export const FailedPayment = (props) => {
  props.setLink("Response");
  const { addParams, clearParams } = props;
  const { t } = useTranslation();
  const { consumerCode } = useParams();

  const getMessage = () => t("ES_PAYMENT_COLLECTED_ERROR");
  return (
    <React.Fragment>
      <Card>
        <Banner message={getMessage()} complaintNumber={consumerCode} successful={false} />
        <CardText>{t("ES_PAYMENT_FAILED_DETAILS")}</CardText>
      </Card>
      <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
        <Link to="/digit-ui/employee">
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      </ActionBar>
    </React.Fragment>
  );
};
