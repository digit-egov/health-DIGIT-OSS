import { Card, CardLabel, CardSectionHeader, CardText, Header, LabelFieldPair, LastRow, CardSectionSubText, CheckBox, Loader, TextInput, Dropdown, DatePicker, UploadFile, ActionBar, SubmitBar, CardLabelError } from "@egovernments/digit-ui-react-components";
import React, {Fragment, useEffect, useMemo, useReducer} from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const ApplicationBillAmendment = () => {
	//connectionNumber=WS/107/2021-22/227166&tenantId=pb.amritsar&service=WATER&connectionType=Metered
	const { t } = useTranslation()
	const {connectionNumber, tenantId, service, connectionType } = Digit.Hooks.useQueryParams();
	const stateId = Digit.ULBService.getStateId();
	const { isLoading: BillAmendmentMDMSLoading, data: BillAmendmentMDMS } = Digit.Hooks.ws.WSSearchMdmsTypes.useWSMDMSBillAmendment({tenantId: stateId});
	const billSearchFilters = { tenantId, consumerCode:connectionNumber, service:"WS" }
	const {data: billSearchData, isLoading: isBillSearchLoading} = Digit.Hooks.usePaymentSearch(tenantId, billSearchFilters );
	
	const { register, control, watch, setValue, unregister, handleSubmit, formState:{ errors }, ...methods } = useForm()

	const amendmentReason = watch("amendmentReason");
	const WS_REDUCED_AMOUNT = watch("WS_REDUCED_AMOUNT");
	const WS_ADDITIONAL_AMOUNT = watch("WS_ADDITIONAL_AMOUNT");
	const history = useHistory()
	// const { replace: replaceReducedTrigger } = useFieldArray({
	// 	control,
	// 	name: "WS_REDUCED_AMOUNT"
	//   });
	// const { replace: replaceAdditionTrigger } = useFieldArray({
	// 	control,
	// 	name: "WS_ADDITIONAL_AMOUNT"
	//   });
	const uploadFile = async (data, fname, props) => {
		try {
			dispatch({type: "addLoader", payload: { id: fname }})
			
			const response = await Digit.UploadServices.Filestorage("WS", data?.target?.files[0], tenantId);
			const fileStoreId = response?.data?.files?.[0]?.fileStoreId
		  if (fileStoreId) {
			const {data: urlResponse} = await Digit.UploadServices.Filefetch([fileStoreId], tenantId)
			const url = urlResponse?.fileStoreIds?.[0]?.url
			dispatch({type: "upload", payload: { id: fname, url }})
			props.onChange({ id: fname, url, fileName: data?.target?.files[0]?.name, fileStoreId, fileStore: fileStoreId })
		  } else {
			alert(t("CS_FILE_UPLOAD_ERROR"));
		  }
		} catch (err) {
		} finally {
			dispatch({type: "removeLoader", payload: { id: fname }})
		}
	  };

	useEffect(() => dispatch({type: "updateAmendmentReason", payload: amendmentReason}),[amendmentReason])

	function fileReducer(state, action) {
		switch(action.type) {
			case "upload":
				return state.map( e => e.documentType === action.payload.id ? {...e, url: action.payload.url} : e)
			case "remove":
				return state.map(e => {
					let __e = e
					if(e.documentType === action.payload.id) {
						delete __e.url
						delete __e.loader 
					}
					
					return __e 
				})
			case "addLoader":
				return state.map(e => e.documentType === action.payload.id ? {...e, loader: true} : e)
			case "removeLoader":
				return state.map(e => e.documentType === action.payload.id ? {...e, loader: false} : e)
			case "updateAmendmentReason":
				return action.payload?.allowedDocuments?.allowedDocs
			default:
				return state
		}
	}

	const functionToHandleFileUpload = async(data, fname, props) =>{
		await uploadFile(data, fname, props)
	}

	function functionToDisplayTheMessage(e){
		if(e?.url) {
			return e?.loader ? <Loader /> : t("CS_ACTION_FILEUPLOADED")	
		} 
		else{
			t("CS_ACTION_NO_FILEUPLOADED")
		}
	}
	const [requiredDocuments, dispatch] = useReducer(fileReducer,[])

	const setOtherTextFieldsAndActionToNull = (key) => {
		setValue(key, {VALUE:false})
		// methods.reset([`${key}.WS_CHARGE`])
	}

	const getDemandDetailsComparingUpdates = (d) => {
		const actionPerformed = JSON.parse(JSON.stringify(d?.WS_REDUCED_AMOUNT?.VALUE ? d?.WS_REDUCED_AMOUNT : d?.WS_ADDITIONAL_AMOUNT))
		delete actionPerformed?.VALUE
		const actionPerformedInArray = Object.entries(actionPerformed)	
		return actionPerformedInArray.map( e => {
			const preUpdateDataAmount = billSearchData.find( a => a.taxHeadCode === e[0])?.amount
			return {
				taxHeadMasterCode: e[0],
				taxAmount: e[1] - preUpdateDataAmount
			}
		})
	}

	const getTotalDetailsOfUpdatedData = (d) => {
		const actionPerformed = JSON.parse(JSON.stringify(d?.WS_REDUCED_AMOUNT?.VALUE ? d?.WS_REDUCED_AMOUNT : d?.WS_ADDITIONAL_AMOUNT))
		delete actionPerformed?.VALUE
		return {...actionPerformed, TOTAL: Object.values(actionPerformed).reduce((a,b) => parseInt(a)+parseInt(b),0)}
	}

	const onFormSubmit = (d) => {
		const data = {	
			Amendment: {
				consumerCode: connectionNumber,
				tenantId,
				businessService: "SW",
				amendmentReason: amendmentReason?.code,
				reasonDocumentNumber: d?.reasonDocumentNumber,
				effectiveFrom: new Date(d?.effectiveFrom).getTime(),
				effectiveTill: new Date(d?.effectiveTill).getTime(),
				documents: Object.values(d?.DOCUMENTS).map(e => {
					const res = {
						...e,
						documentType: e?.id,
						fileUrl: e?.url
					}
					delete res.id
					delete res.url
					return res
				}),
				demandDetails: getDemandDetailsComparingUpdates(d),
				additionalDetails: {
					searchBillDetails: getTotalDetailsOfUpdatedData(d)
				}
			}
		}
		history.push("/digit-ui/employee/ws/response",data)
	}

	return <form onSubmit={handleSubmit(onFormSubmit)}>
		<Header>{t("WS_BILL_AMENDMENT_BUTTON")}</Header>
		<Card>
			<LabelFieldPair>
				<CardLabel style={{fontWeight: "500"}}>{t("WS_ACKNO_CONNECTION_NO_LABEL")}</CardLabel>
				<CardText style={{marginBottom: "0px"}}>{connectionNumber}</CardText>
			</LabelFieldPair>
			<CardSectionHeader style={{marginBottom: "16px"}}>{t("WS_ADJUSTMENT_AMOUNT")}</CardSectionHeader>
			<CardSectionSubText style={{marginBottom: "16px"}}>{t("WS_ADJUSTMENT_AMOUNT_ADDITION_TEXT")}</CardSectionSubText>
			{!isBillSearchLoading ? <table>
				<tr style={{textAlign: "left"}}>
					<th>{t("WS_TAX_HEADS")}</th>
					<th>{t("WS_CURRENT_AMOUNT")}</th>
					<th>
						<>
							<Controller
								name="WS_REDUCED_AMOUNT.VALUE"
								key="WS_REDUCED_AMOUNT.VALUE"
								control={control}
								rules={{validate: (value) => {
									return !!value || !!WS_ADDITIONAL_AMOUNT?.VALUE
								}}}
								render={(props) => {
									return <CheckBox 
										// className="form-field"
										label={t("WS_REDUCED_AMOUNT")}
										onChange={(e) => {
											if (e.target.checked) {
												props.onChange(true)
												setOtherTextFieldsAndActionToNull("WS_ADDITIONAL_AMOUNT", false)
											} else {
												props.onChange(false)
											}
										}}
										checked={props?.value}
									/>
								}}
							/>
							{errors?.WS_REDUCED_AMOUNT?.VALUE ? <CardLabelError>{t("WS_REQUIRED_FIELD")}</CardLabelError> : null}
						</>
					</th>
					<th>
						<>
							<Controller
								name="WS_ADDITIONAL_AMOUNT.VALUE"
								key="WS_ADDITIONAL_AMOUNT.VALUE"
								control={control}
								rules={{validate: (value) => {
									return !!value || !!WS_REDUCED_AMOUNT?.VALUE
								}}}
								render={(props) => {
									return <CheckBox 
										// className="form-field"
										label={t("WS_ADDITIONAL_AMOUNT")}
										onChange={(e) => {
											if (e.target.checked) {
												props.onChange(true)
												setOtherTextFieldsAndActionToNull("WS_REDUCED_AMOUNT", false)
											} else {
												props.onChange(false)
											}
										}}
										checked={props?.value}
									/>
								}}
							/>
							{errors?.WS_ADDITIONAL_AMOUNT?.VALUE ? <CardLabelError>{t("WS_REQUIRED_FIELD")}</CardLabelError>: null}
						</>
					</th>
				</tr>
				<tr>
					<td style={{paddingRight: "60px"}}>{t("WS_CHARGE")}</td>
					<td style={{paddingRight: "60px", textAlign: "end"}}>₹ {billSearchData?.find(e => e.taxHeadCode === "WS_CHARGE")?.amount}</td>
					<td style={{paddingRight: "60px"}}>
						<>
							<TextInput disabled={!WS_REDUCED_AMOUNT?.VALUE} name="WS_REDUCED_AMOUNT.WS_CHARGE" inputRef={register({
								max: {
									value: billSearchData?.find(e => e.taxHeadCode === "WS_CHARGE")?.amount,
									message: t("WS_ERROR_ENTER_LESS_THAN_MAX_VALUE")
							}})} />
							{errors?.WS_REDUCED_AMOUNT?.WS_CHARGE && <CardLabelError>{errors?.WS_REDUCED_AMOUNT?.WS_CHARGE?.message}</CardLabelError>}
						</>
					</td>
					<td style={{paddingRight: "60px"}}><>
						<TextInput disabled={!WS_ADDITIONAL_AMOUNT?.VALUE} name="WS_ADDITIONAL_AMOUNT.WS_CHARGE" inputRef={register({
							min: {
								value: billSearchData?.find(e => e.taxHeadCode === "WS_CHARGE")?.amount,
								message: t("WS_ERROR_ENTER_MORE_THAN_MIN_VALUE")
							}})}/>
							{errors?.WS_ADDITIONAL_AMOUNT?.WS_CHARGE && <CardLabelError>{errors?.WS_ADDITIONAL_AMOUNT?.WS_CHARGE?.message}</CardLabelError>}
						</>
					</td>
				</tr>
				<tr>
					<td style={{paddingRight: "60px"}}>{t("WS_TIME_INTEREST")}</td>
					<td style={{paddingRight: "60px", textAlign: "end"}}>₹ {billSearchData?.find(e => e.taxHeadCode === "WS_TIME_INTEREST")?.amount}</td>
					<td style={{paddingRight: "60px"}}>
						<>
							<TextInput disabled={!WS_REDUCED_AMOUNT?.VALUE} name="WS_REDUCED_AMOUNT.WS_TIME_INTEREST" inputRef={register({max: {
								value: billSearchData?.find(e => e.taxHeadCode === "WS_TIME_INTEREST")?.amount,
								message: t("WS_ERROR_ENTER_LESS_THAN_MAX_VALUE")
							}})} />
							{errors?.WS_REDUCED_AMOUNT?.WS_TIME_INTEREST && <CardLabelError>{errors?.WS_REDUCED_AMOUNT?.WS_TIME_INTEREST?.message}</CardLabelError>}
						</>
					</td>
					<td style={{paddingRight: "60px"}}>
						<>
							<TextInput disabled={!WS_ADDITIONAL_AMOUNT?.VALUE} name="WS_ADDITIONAL_AMOUNT.WS_TIME_INTEREST" inputRef={register({min: {
								value: billSearchData?.find(e => e.taxHeadCode === "WS_TIME_INTEREST")?.amount,
								message: t("WS_ERROR_ENTER_MORE_THAN_MIN_VALUE")
							}})} />
							{errors?.WS_ADDITIONAL_AMOUNT?.WS_TIME_INTEREST && <CardLabelError>{errors?.WS_ADDITIONAL_AMOUNT?.WS_TIME_INTEREST?.message}</CardLabelError>}
						</>
					</td>
				</tr>
				<tr>
					<td style={{paddingRight: "60px"}}>{t("WS_WATER_CESS")}</td>
					<td style={{paddingRight: "60px", textAlign: "end"}}>₹ {billSearchData?.find(e => e.taxHeadCode === "WS_WATER_CESS")?.amount}</td>
					<td style={{paddingRight: "60px"}}>
						<>
							<TextInput disabled={!WS_REDUCED_AMOUNT?.VALUE} name="WS_REDUCED_AMOUNT.WS_WATER_CESS" inputRef={register({max: {
								value: billSearchData?.find(e => e.taxHeadCode === "WS_WATER_CESS")?.amount,
								message: t("WS_ERROR_ENTER_LESS_THAN_MAX_VALUE")
							}})} />
							{errors?.WS_REDUCED_AMOUNT?.WS_WATER_CESS && <CardLabelError>{errors?.WS_REDUCED_AMOUNT?.WS_WATER_CESS?.message}</CardLabelError>}
						</>
					</td>
					<td style={{paddingRight: "60px"}}>
						<>
							<TextInput disabled={!WS_ADDITIONAL_AMOUNT?.VALUE} name="WS_ADDITIONAL_AMOUNT.WS_WATER_CESS" inputRef={register({min: {
								value: billSearchData?.find(e => e.taxHeadCode === "WS_WATER_CESS")?.amount,
								message: t("WS_ERROR_ENTER_MORE_THAN_MIN_VALUE")
							}})} />
							{errors?.WS_ADDITIONAL_AMOUNT?.WS_WATER_CESS && <CardLabelError>{errors?.WS_ADDITIONAL_AMOUNT?.WS_WATER_CESS?.message}</CardLabelError>}
						</>
					</td>
				</tr>
				<tr>
					<td style={{paddingRight: "60px"}}>{t("WS_TIME_PENALTY")}</td>
					<td style={{paddingRight: "60px", textAlign: "end"}}>₹ {billSearchData?.find(e => e.taxHeadCode === "WS_TIME_PENALTY")?.amount}</td>
					<td style={{paddingRight: "60px"}}><>
						<TextInput disabled={!WS_REDUCED_AMOUNT?.VALUE} name="WS_REDUCED_AMOUNT.WS_TIME_PENALTY" inputRef={register({max: {
							value: billSearchData?.find(e => e.taxHeadCode === "WS_TIME_PENALTY")?.amount,
							message: t("WS_ERROR_ENTER_LESS_THAN_MAX_VALUE")
						}})} />
						{errors?.WS_REDUCED_AMOUNT?.WS_TIME_PENALTY && <CardLabelError>{errors?.WS_REDUCED_AMOUNT?.WS_TIME_PENALTY?.message}</CardLabelError>}
						</>
					</td>
					<td style={{paddingRight: "60px"}}><>
						<TextInput disabled={!WS_ADDITIONAL_AMOUNT?.VALUE} name="WS_ADDITIONAL_AMOUNT.WS_TIME_PENALTY" inputRef={register({min: {
							value: billSearchData?.find(e => e.taxHeadCode === "WS_TIME_PENALTY")?.amount,
							message: t("WS_ERROR_ENTER_MORE_THAN_MIN_VALUE")
						}})} />
						{errors?.WS_ADDITIONAL_AMOUNT?.WS_TIME_PENALTY && <CardLabelError>{errors?.WS_ADDITIONAL_AMOUNT?.WS_TIME_PENALTY?.message}</CardLabelError>}
						</>
					</td>
				</tr>
			</table> : <Loader />}
			{ BillAmendmentMDMSLoading ? <Loader/> : <>
				<CardSectionHeader style={{marginBottom: "16px"}}>{t("WS_ADD_DEMAND_REVISION_BASIS")}</CardSectionHeader>
				<CardSectionSubText style={{marginBottom: "16px"}}>{t("WS_SELECT_DEMAND_REVISION")}</CardSectionSubText>
				<LabelFieldPair>
					<CardLabel style={{fontWeight: "500"}}>{t("WS_DEMAND_REVISION_BASIS")}</CardLabel>
					<Controller
						name="amendmentReason"
						control={control}
						rules={{ required: true }}
						render={(props) => {
							return <Dropdown style={{width: "640px"}} option={BillAmendmentMDMS} selected={props?.value} optionKey={"i18nKey"} t={t} select={props?.onChange} />
						}}
					/>
					{errors?.amendmentReason ? <CardLabelError>{t("WS_REQUIRED_FIELD")}</CardLabelError> : null}
				</LabelFieldPair>
				<LabelFieldPair>
					<CardLabel style={{fontWeight: "500"}}>{t("WS_GOVERNMENT_NOTIFICATION_NUMBER")}</CardLabel>
					<div className="reasonDocumentNumber">
						<TextInput style={{width: "640px"}} name="reasonDocumentNumber" inputRef={register({required: true})} />
					</div>
					{errors?.reasonDocumentNumber ? <CardLabelError>{t("WS_REQUIRED_FIELD")}</CardLabelError> : null}
				</LabelFieldPair>
				<LabelFieldPair>
					<CardLabel style={{fontWeight: "500"}}>{t("WS_GOVERNMENT_NOTIFICATION_NUMBER")}</CardLabel>
					{/* <div className="field"> */}
						{/* <TextInput style={{width: "640px"}}  inputRef={register({})} /> */}
						{/* </div> */}
					<Controller
						render={(props) => <DatePicker style={{width:"640px"}} date={props.value} disabled={false} onChange={props.onChange} />}
						name="effectiveFrom"
						rules={{ required: true }}
						control={control}
					/>
					{errors?.effectiveFrom ? <CardLabelError>{t("WS_REQUIRED_FIELD")}</CardLabelError> : null}
				</LabelFieldPair>
				<LabelFieldPair>
					<CardLabel style={{fontWeight: "500"}}>{t("WS_GOVERNMENT_NOTIFICATION_NUMBER")}</CardLabel>
					{/* <div className="field">
						<TextInput style={{width: "640px"}} name="effectiveTill" inputRef={register({})} />
					</div> */}
					<Controller
						render={(props) => <DatePicker style={{width:"640px"}} date={props.value} disabled={false} onChange={props.onChange} />}
						name="effectiveTill"
						rules={{ required: true }}
						control={control}
					/>
					{errors?.effectiveTill ? <CardLabelError>{t("WS_REQUIRED_FIELD")}</CardLabelError> : null}
				</LabelFieldPair>
			</>}
			{!!amendmentReason ? <CardSectionHeader style={{marginBottom: "16px"}}>{t("WS_DOCUMENT_REQUIRED")}</CardSectionHeader> : null }
			{requiredDocuments?.map(e => <LabelFieldPair>
				<CardLabel style={{fontWeight: "500"}}>{t(`WS_${e?.documentType}`)}{e?.required ? `*` : null}</CardLabel>
				<div className="field">
					<Controller
						name={`DOCUMENTS.${e?.documentType}`}
						control={control}
						rules={e?.required ? { required: true }: {}}
						render={(props) => (
						<UploadFile
							id={`ws-doc-${e.documentType}`}
							onUpload={(d) => functionToHandleFileUpload(d, e?.documentType, props)}
							onDelete={() => dispatch({type: "remove", payload:{id: e?.documentType}})}
							style={{width: "640px"}}
							accept="image/*, .pdf, .png, .jpeg, .doc"
							showHintBelow={true}
							hintText={t("WS_DOCUMENTS_ATTACH_RESTRICTIONS_SIZE")}
							message={functionToDisplayTheMessage}
							textStyles={{ width: "100%" }}
							inputStyles={{ width: "280px" }}
						/>
						)}
					/>
					{/* {fileSize ? `${getFileSize(fileSize)}` : null}
					{imageUploadError ? <CardLabelError>{t(imageUploadError)}</CardLabelError> : null} */}
				{errors?.[e?.documentType] ? <CardLabelError>{t("WS_REQUIRED_FIELD")}</CardLabelError> : null}
				</div>
			</LabelFieldPair>)}
		</Card>
		<ActionBar>
			  <SubmitBar submit={true} label={t("ES_COMMON_TAKE_ACTION")}  />
		</ActionBar>
	</form>
}

export default ApplicationBillAmendment