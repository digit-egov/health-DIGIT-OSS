import React from "react";
import { useSelector } from "react-redux";
import { useRouteMatch } from "react-router-dom";
import EmployeeApp from "./pages";
import BillsCard from "./billHomeCard";
import BillsFilter from "./components/BillsFilter";
import BillInbox from "./pages/SearchBill/BillInbox";
import ActionModal from "./components/Modal";
import BillDetails from "./pages/BillDetails";
import Banner from "./components/Banner";

export const BillsModule = ({ stateCode, userType }) => {
  const { path, url } = useRouteMatch();
  if (userType === "employee") {
    return <EmployeeApp path={path} url={url} userType={"employee"} />;
  } else return null;
};

const componentsToRegister = {
  BillsModule,
  BillsCard,
  BillInbox: BillInbox,
  BillDetails: BillDetails,
  ActionModal,
  Banner,
  BILLS_INBOX_FILTER: (props) => <BillsFilter {...props} />,
};

export const initBillsComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};