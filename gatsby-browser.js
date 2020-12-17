/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

import React, { useEffect } from "react"
import "@/i18n"
import I18nWrapper from "@/components/I18nWrapper"
import RootLayout from "@/components/templates/RootLayout"
import ContextStore from "@/contextStore"
import { ROUTE_CHANGE } from "@/reducers/route"

import "tailwindcss/base.css"
import "tailwindcss/components.css"
import "tailwindcss/utilities.css"

// update the route
const Router = ({ path }) => {
  // some shit when useStaticQuery here..
  const {
    route: { dispatch },
  } = React.useContext(ContextStore)
  let actualPath = path
  // TODO: dynamic langauges from somewhere?
  actualPath = actualPath.replace(/^\/en(?!\w)/, "") || "/"

  useEffect(() => {
    dispatch({ type: ROUTE_CHANGE, path: actualPath, fullPath: path })
  }, [actualPath, path, dispatch])
  return null
}

export const wrapPageElement = ({ element, props }) => {
  return (
    <>
      <Router path={props.uri}></Router>
      <I18nWrapper locale={props.pageContext.locale}>{element}</I18nWrapper>
    </>
  )
}

// Wrap the theme
export const wrapRootElement = ({ element }) => {
  console.log(`
  -----------------------------
  COVID-19 in HK｜武漢肺炎民間資訊
  -----------------------------

  We are waiting for your commit :)

  GitHub Repo:
  https://github.com/nandiheath/warsinhk

  `)

  return <RootLayout>{element}</RootLayout>
}
