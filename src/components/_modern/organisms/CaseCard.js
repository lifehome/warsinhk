import React from "react"

import styled from "styled-components"

// legacy import
import {
  mapColorForClassification,
  mapColorForStatus,
} from "@/utils/_modern/colorHelper"
// import _get from "lodash.get"
// import { formatDateMDD } from "@/utils"
import { withLanguage, getLocalizedPath } from "@/utils/i18n"

const CaseCard = styled.div`
  min-height: 128px;
  max-height: 610px;

  line-height: 1.25;
`

const CaseClassificationSpan = styled.span`
  border: 1px solid ${props => props.$bordercolor};
  background: ${props => props.$backgroundcolor || "transparent"};
  color: ${props => props.$textcolor};
  padding: 5px 8px;
`

const CaseHeaderDiv = styled.div`
  background: ${props => props.$statuscolor};
`

// const WarsCaseTrack = ({ i18n, t, track }) => {
//   return (
//     <>
//       {track.map((tr, i) => {
//         const remarksText = withLanguage(i18n, tr.node, "remarks")
//         const subDistrict = withLanguage(i18n, tr.node, "sub_district")
//         return (
//           <div key={i} className="track-item">
//             <div className="track-header">
//               <div>{withLanguage(i18n, tr.node, "action")}</div>
//               <div>
//                 {tr.node.start_date === tr.node.end_date
//                   ? formatDateMDD(tr.node.end_date)
//                   : `${formatDateMDD(tr.node.start_date)} - ${formatDateMDD(
//                       tr.node.end_date
//                     )}`}
//               </div>
//             </div>
//             <div className="">
//               <p>
//                 {t("cases_sub_district_location", {
//                   sub_district: subDistrict === "-" ? "" : subDistrict,
//                   location: withLanguage(i18n, tr.node, "location"),
//                 })}
//               </p>
//             </div>
//             {remarksText && (
//               <div className="track-remarks">
//                 <p>
//                   {renderTextWithCaseLink(i18n, tr.node, "remarks")}
//                 </p>
//               </div>
//             )}
//             <div className="track-source">
//               {tr.node.source_url_1 && (
//                 <a href={tr.node.source_url_1}>
//                   <label>{t("high_risk.source_1")}</label>
//                 </a>
//               )}
//               {tr.node.source_url_2 && (
//                 <a href={tr.node.source_url_2}>
//                   <label>{t("high_risk.source_2")}</label>
//                 </a>
//               )}
//             </div>
//           </div>
//         )
//       })}
//     </>
//   )
// }

const renderTextWithCaseLink = (i18n, node, text = "detail") => {
  let rawText = withLanguage(i18n, node, text, true)

  let regexp = /#\d+/g
  let relatedCases = []
  let m
  do {
    m = regexp.exec(rawText)
    if (m) {
      relatedCases.push(m)
    }
  } while (m)
  let splitedRawText = rawText.split(regexp)

  return (
    <>
      {splitedRawText.map((str, i) => {
        let caseNo = relatedCases[i] && relatedCases[i][0]

        return (
          <>
            {str}
            {caseNo && (
              <a
                href={getLocalizedPath(
                  i18n,
                  `/cases/${caseNo.slice(1, caseNo.length)}`
                )}
              >
                {caseNo}
              </a>
            )}
          </>
        )
      })}
    </>
  )
}

export const ModernCaseCard = React.forwardRef((props, ref) => {
  const {
    node,
    i18n,
    t,
    // isSelected,
    // patientTrack,
    // handleClose = undefined,
    // showViewMore = false,
    // backToCase = false,
  } = props
  // const trackData = _get(patientTrack, "[0].edges", null)

  // eslint-disable-next-line react-hooks/exhaustive-deps

  // const track = React.useMemo(
  //   () => trackData && <WarsCaseTrack i18n={i18n} t={t} track={trackData} />,
  //   [i18n, t, trackData]
  // )

  const statusText = withLanguage(i18n, node, "status")
  const hospitalText = withLanguage(i18n, node, "hospital")
  const citizenshipText = withLanguage(i18n, node, "citizenship")

  const dateFormat = /\d{4}-\d{2}-\d{2}/g

  return (
    <CaseCard
      key={`case-${node.case_no}`}
      ref={ref}
      className="lg:w-1/3 md:w-full rounded-lg shadow bg-white my-3"
    >
      <div className="container mx-auto pb-3">
        <CaseHeaderDiv
          $statuscolor={mapColorForStatus(node.status).main}
          className="rounded-t-lg flex justify-between border-b border-solid border-gray-300 px-5 py-4 items-center"
        >
          <h1 className="font-bold text-white text-lg">
            {`#${node.case_no}`}
            <small className="px-2">
              {`(${
                statusText && statusText !== "#N/A" && statusText !== "-"
                  ? statusText
                  : t("cases.status_pending_update")
              })`}
            </small>
          </h1>
        </CaseHeaderDiv>
        <div className="caseTitle flex flex-row justify-between items-center px-5 py-5">
          <span className="font-bold text-lg">
            {node.age && t("dashboard.patient_age_format", { age: node.age })}{" "}
            {(node.gender === "M" || node.gender === "F") &&
              t(`dashboard.gender_${node.gender}`)}
          </span>
          <div className="caseInformation">
            {node.classification && (
              <CaseClassificationSpan
                $bordercolor={
                  mapColorForClassification(node.classification).main
                }
                $backgroundcolor={
                  mapColorForClassification(node.classification).main
                }
                $textcolor={
                  mapColorForClassification(node.classification).contrastText
                }
                className="text-sm rounded-lg"
              >
                {withLanguage(i18n, node, "classification")}
              </CaseClassificationSpan>
            )}
          </div>
        </div>
        <div className="patient_history px-5 pt-0 py-4 flex flex-wrap flex-row justify-between">
          <div className="patient_record flex flex-col justify-center">
            <div className="patient_hospital pb-3 flex flex-col">
              <label className="gum text-sm">
                {t("dashboard.patient_hospital")}
              </label>
              <span className="text">
                {(hospitalText && hospitalText !== "#N/A" && hospitalText) ||
                  t("dashboard.patient_hospital_not_announced")}
              </span>
            </div>
            <div className="patient_citizenship flex flex-col">
              <label className="gum text-sm">
                {t("dashboard.patient_citizenship")}
              </label>
              <span className="text">
                {(citizenshipText &&
                  citizenshipText !== "#N/A" &&
                  citizenshipText) ||
                  "-"}
              </span>
            </div>
          </div>
          <div className="highlighted_dates flex flex-col justify-center">
            {node.onset_date && (
              <div className="onset_date pb-3 flex flex-col">
                <label className="gum text-sm">
                  {t("dashboard.patient_onset_date")}
                </label>
                <span className="text">
                  {node.onset_date.match(dateFormat)
                    ? node.onset_date
                    : node.onset_date.toLowerCase() === "asymptomatic" ||
                      node.onset_date.toLowerCase() === "none"
                    ? t("cases.asymptomatic")
                    : ""}
                </span>
              </div>
            )}
            <div className="confirm_date flex flex-col">
              <label className="gum text-sm">
                {t("dashboard.patient_confirm_date")}
              </label>
              <span className="text">{node.confirmation_date}</span>
            </div>
          </div>
        </div>
        <div className="caseContent block px-5 py-4 border-t border-solid border-gray-300">
          <p className="caseDescription py-2 pt-0">
            {renderTextWithCaseLink(i18n, node, "detail")}
          </p>
          <p>
            {node.source_url_1 && (
              <a href={node.source_url_1}>{t("dashboard.source")}</a>
            )}{" "}
            {node.source_url_2 && (
              <a href={node.source_url_2}>{t("dashboard.source")}</a>
            )}
          </p>
        </div>
      </div>
    </CaseCard>
  )
})
