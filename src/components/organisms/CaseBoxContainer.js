import React from "react"
import { useTranslation } from "react-i18next"
import Box from "@material-ui/core/Box"
import styled from "styled-components"
import { mapColorForStatus } from "@/utils/colorHelper"
import { bps } from "@/ui/theme"
import _get from "lodash/get"
import _uniq from "lodash/uniq"
import _groupBy from "lodash/groupBy"
import _map from "lodash/map"
import * as moment from "moment"
import { withLanguage } from "@/utils/i18n"
import Typography from "@material-ui/core/Typography"
import MaleIcon from "@/components/icons/male.svg"
import FemaleIcon from "@/components/icons/female.svg"
import ImportIcon from "@/components/icons/import.svg"

const CaseAvatar = styled(Box)`
  cursor: pointer;
  font-weight: 900;
  font-size: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  max-width: 70px;
  width: calc(100% / 5);
  height: 32px;
  margin-bottom: 30px;

  g {
    fill: ${props => props.statuscolor};
  }

  svg.male,
  svg.female {
    position: absolute;
  }

  svg.imported {
    position: absolute;
    top: -8px;
    right: 10px;
    width: 16px;
    height: 16px;
    z-index: 1;
  }

  .case-no {
    position: absolute;
    display: table;
    margin: 2px auto;
    color: ${props => props.statuscolor};
  }
`
const WarsGroupContainer = styled(Box)`
  margin: 16px 0 16px;
  border-bottom: 1px #cfcfcf solid;
  }
`

const GroupHeader = styled(Typography)`
  margin-bottom: 16px;
`

const DescriptionContainer = styled(Box)`
  margin: 10px 0px;
`

const StyledContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;

  ${bps.down("sm")} {
    margin: 0 -4px;
  }
`

export const WarsCaseBox = React.forwardRef((props, ref) => {
  const {
    cases: { node },
    handleBoxClick,
  } = props

  return (
    <CaseAvatar
      className={`wars_box_${node.case_no}`}
      statuscolor={mapColorForStatus(node.status).main}
      onClick={e => handleBoxClick(node)}
    >
      {node.classification === "imported" && <ImportIcon />}
      <span className="case-no">{node.case_no}</span>
      {node.gender === "F" ? <FemaleIcon /> : <MaleIcon />}
    </CaseAvatar>
  )
})

export const WarsCaseBoxContainer = React.forwardRef((props, ref) => {
  const { filteredCases, handleBoxClick, selectedGroupButton } = props
  const { t, i18n } = useTranslation()

  // --------------------------------------
  // selectedGroupButton
  // --------------------------------------
  // 1: by date   : from latest to oldest
  // 2: by date   : from oldest to latest
  // 3: by area   : from greatest to least
  // 4: by area   : from least to greatest
  // 5: by group  : from more to less
  // 6: by group  : from less to more
  // 7: by status
  // --------------------------------------

  if (selectedGroupButton === 1 || selectedGroupButton === 2) {
    // **********************
    // ** By Date
    // **********************

    // Grouping Logic:
    // 1. descending chronological order
    // 2. First row: Most recent date's case
    // 3. Other rows: Every 7 days a row eg. Feb 22- Feb 28, Feb 15 - Feb 21 etc
    const lastConfirmedDate = _get(
      filteredCases,
      "[0].node.confirmation_date",
      ""
    )
    const caseStartDate = moment("2020-01-21")

    const dateMap = {
      [lastConfirmedDate]: moment(lastConfirmedDate).format("M.DD"),
    }
    let date = moment(lastConfirmedDate).add(-1, "day")
    let count = 0
    let dateLabel = ""
    while (date.isAfter(caseStartDate)) {
      // Group by 7 days
      // if (count % 7 === 0) {
      //   dateLabel = `${moment(date)
      //     .add(-7, "days")
      //     .format("M.DD")} - ${date.format("M.DD")}`
      // }
      //
      if (count % 1 === 0) {
        dateLabel = date.format("M.DD")
      }
      dateMap[date.format("YYYY-MM-DD")] = dateLabel
      count++
      date = date.add(-1, "day")
    }
    let dates = _uniq(Object.values(dateMap))

    if (selectedGroupButton === 2) {
      dates = dates.reverse()
    }

    return (
      <>
        {dates.map((dateKey, index) => {
          let matchedCases = filteredCases.filter(
            ({ node }) => dateMap[node.confirmation_date] === dateKey
          ).length
          return (
            matchedCases > 0 && (
              <WarsGroupContainer index={index}>
                <GroupHeader variant="h6">
                  {dateKey} (
                  {t("cases.box_view_cases", { cases: matchedCases })})
                </GroupHeader>
                <StyledContainer>
                  {filteredCases
                    .filter(
                      ({ node }) => dateMap[node.confirmation_date] === dateKey
                    )
                    .map(cases => (
                      <WarsCaseBox
                        cases={cases}
                        handleBoxClick={handleBoxClick}
                      />
                    ))}
                </StyledContainer>
              </WarsGroupContainer>
            )
          )
        })}
      </>
    )
  } else if (selectedGroupButton === 3 || selectedGroupButton === 4) {
    // **********************
    // ** By Area
    // **********************
    const groupedCases = _groupBy(
      filteredCases,
      ({ node: { citizenship_en } }) => `${citizenship_en}`
    )

    let casesByGroups = _map(groupedCases, (v, k) => ({
      citizenship_en: _uniq(v.map(({ node }) => node.citizenship_en))[0],
      citizenship_zh: _uniq(v.map(({ node }) => node.citizenship_zh))[0],
      cases: v,
      total: v.length,
    }))

    if (selectedGroupButton === 3) {
      casesByGroups = casesByGroups.sort((x, y) => y.total - x.total)
    }

    if (selectedGroupButton === 4) {
      casesByGroups = casesByGroups.sort((x, y) => x.total - y.total)
    }

    return (
      <>
        {casesByGroups.map((casesByGroup, index) => {
          let { citizenship_en, cases } = casesByGroup
          let area

          if (citizenship_en === "#N/A") {
            area = t("cases.uncategorized")
          } else {
            area = withLanguage(i18n, casesByGroup, "citizenship")
          }

          return (
            <WarsGroupContainer index={index}>
              <GroupHeader variant="h6">
                {area} ({t("cases.box_view_cases", { cases: cases.length })})
              </GroupHeader>
              <StyledContainer>
                {casesByGroup.cases.map(cases => (
                  <WarsCaseBox cases={cases} handleBoxClick={handleBoxClick} />
                ))}
              </StyledContainer>
            </WarsGroupContainer>
          )
        })}
      </>
    )
  } else if (selectedGroupButton === 5 || selectedGroupButton === 6) {
    // **********************
    // ** By Group
    // **********************
    const groupedCases = _groupBy(
      filteredCases,
      ({ node: { group_id } }) => `${group_id}`
    )

    let casesByGroups = _map(groupedCases, (v, k) => ({
      group_id: k,
      group_name_en: _uniq(v.map(({ node }) => node.group_name_en))[0],
      group_name_zh: _uniq(v.map(({ node }) => node.group_name_zh))[0],
      group_description_en: _uniq(
        v.map(({ node }) => node.group_description_en)
      )[0],
      group_description_zh: _uniq(
        v.map(({ node }) => node.group_description_zh)
      )[0],
      cases: v,
      total: v.length,
    }))

    if (selectedGroupButton === 5) {
      casesByGroups = casesByGroups.sort((x, y) => y.total - x.total)
    }

    if (selectedGroupButton === 6) {
      casesByGroups = casesByGroups.sort((x, y) => x.total - y.total)
    }

    return (
      <>
        {casesByGroups.map((casesByGroup, index) => {
          let { group_id, cases } = casesByGroup
          let group, description

          if (group_id === "null") {
            group = t("cases.uncategorized")
          } else {
            group = withLanguage(i18n, casesByGroup, "group_name")
          }

          description = withLanguage(i18n, casesByGroup, "group_description")

          return (
            <WarsGroupContainer index={index}>
              <GroupHeader variant="h6">
                {group} ({t("cases.box_view_cases", { cases: cases.length })})
              </GroupHeader>
              {description && (
                <DescriptionContainer>{description}</DescriptionContainer>
              )}
              <StyledContainer>
                {casesByGroup.cases.map(cases => (
                  <WarsCaseBox cases={cases} handleBoxClick={handleBoxClick} />
                ))}
              </StyledContainer>
            </WarsGroupContainer>
          )
        })}
      </>
    )
  } else if (selectedGroupButton === 7) {
    // **********************
    // ** By Status
    // **********************
    const groupedCases = _groupBy(
      filteredCases,
      ({ node: { status } }) => `${status}`
    )
    const casesByGroups = _map(groupedCases, (v, k) => ({
      status: k,
      cases: v,
    }))

    return (
      <>
        {casesByGroups.map((casesByGroup, index) => {
          let { status, cases } = casesByGroup

          if (cases.length === 0) {
            return null
          }

          if (status === null || status === "") {
            status = t("cases.uncategorized")
          } else {
            status = t(`cases.status_${status}`)
          }

          return (
            <WarsGroupContainer index={index}>
              <GroupHeader variant="h6">
                {status} ({t("cases.box_view_cases", { cases: cases.length })})
              </GroupHeader>
              <StyledContainer>
                {casesByGroup.cases.map(cases => (
                  <WarsCaseBox cases={cases} handleBoxClick={handleBoxClick} />
                ))}
              </StyledContainer>
            </WarsGroupContainer>
          )
        })}
      </>
    )
  }
})
