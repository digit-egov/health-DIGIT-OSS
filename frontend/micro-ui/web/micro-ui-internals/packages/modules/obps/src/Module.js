import React from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import { Loader, CitizenHomeCard, OBPSIcon, CitizenInfoLabel } from "@egovernments/digit-ui-react-components";
import CitizenApp from "./pages/citizen";

import BPACitizenHomeScreen from "./pages/citizen/home";
import EDCRForm from "./pageComponents/EDCRForm";
import BasicDetails from "./pageComponents/BasicDetails";
import DocsRequired from "./pageComponents/DocsRequired";
import PlotDetails from "./pageComponents/PlotDetails";
import ScrutinyDetails from "./pageComponents/ScrutinyDetails";
import OwnerDetails from "./pageComponents/OwnerDetails";
import DocumentDetails from "./pageComponents/DocumentDetails";
import NOCDetails from "./pageComponents/NOCDetails";
import LocationDetails from "./pageComponents/LocationDetails";
import StakeholderDocsRequired  from "./pageComponents/StakeholderDocsRequired";
import GIS from "./pageComponents/GIS";
import OCEDCRDocsRequired from "./pageComponents/OCEDCRDocsRequired";
import OCeDCRScrutiny from "./pageComponents/OCeDCRScrutiny";
import OCUploadPlanDiagram from "./pageComponents/OCUploadPlanDiagram";
import OCBasicDetails from "./pageComponents/OCBasicDetails";

import LicenseType from "./pageComponents/LicenseType";
import LicenseDetails from "./pageComponents/LicenseDetails";
import CorrospondenceAddress from "./pageComponents/CorrospondenceAddress";
import PermanentAddress from "./pageComponents/PermanentAddress";
import StakeholderDocuments from "./pageComponents/StakeholderDocuments";
import EmployeeApp from "./pages/employee";
import InspectionReport from "./pageComponents/InspectionReport";

const OBPSModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = ["bpa", "bpareg"]; //"bpa";
  const { path, url } = useRouteMatch();
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  Digit.SessionStorage.set("OBPS_TENANTS", tenants);

  if (isLoading) {
    return <Loader />;
  }

  if (userType === "citizen") {
    return <CitizenApp path={path} stateCode={stateCode} />;
  }

  return <EmployeeApp path={path} stateCode={stateCode} />
}

const OBPSLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();

  const links = [
    {
      link: `${matchPath}/my-applications`,
      i18nKey: t("BPA_CITIZEN_HOME_VIEW_APP_BY_CITIZEN_LABEL"),
    },
    {
      link: `${matchPath}/stakeholder/apply/stakeholder-docs-required`,
      i18nKey: t("BPA_CITIZEN_HOME_STAKEHOLDER_LOGIN_LABEL"),
    },
    {
      link: `${matchPath}/home`,
      i18nKey: t("BPA_CITIZEN_HOME_ARCHITECT_LOGIN_LABEL"),
    },
  ];

  return (
    <div>
      <CitizenHomeCard header={t("ACTION_TEST_BUILDING_PLAN_APPROVAL")} links={links} Icon={() => <OBPSIcon />} />
      <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t(`BPA_CITIZEN_HOME_STAKEHOLDER_INCLUDES_INFO_LABEL`)} style={{margin: "0px 16px"}} />
    </div>
  );
} 

const componentsToRegister = {
  OBPSModule,
  OBPSLinks,
  BPACitizenHomeScreen,
  EDCRForm,
  BasicDetails,
  DocsRequired,
  PlotDetails,
  ScrutinyDetails,
  OwnerDetails,
  DocumentDetails,
  NOCDetails,
  LocationDetails,
  GIS,
  OCEDCRDocsRequired,
  OCeDCRScrutiny,
  OCUploadPlanDiagram,
  StakeholderDocsRequired,
  LicenseType,
  LicenseDetails,
  CorrospondenceAddress,
  PermanentAddress,
  StakeholderDocuments,
  OCBasicDetails,
  InspectionReport
}

export const initOBPSComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};