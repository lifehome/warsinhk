const colors = require("tailwindcss/colors")

export const mapColorForClassification = classification => {
  const mapping = {
    imported: {
      main: colors.rose[600],
      contrastText: "#fff",
    },
    imported_close_contact: {
      main: colors.pink[800],
      contrastText: "#fff",
    },
    local: {
      main: colors.teal[800],
      contrastText: "#fff",
    },
    local_possibly: {
      main: colors.teal[700],
      contrastText: "#fff",
    },
    local_unknown_source: {
      main: colors.teal[900],
      contrastText: "#fff",
    },
    local_possibly_close_contact: {
      main: colors.teal[600],
      contrastText: "#fff",
    },
    local_close_contact: {
      main: colors.teal[600],
      contrastText: "#fff",
    },
    default: {
      main: colors.gray[900],
      contrastText: "#fff",
    },
  }

  if (!mapping[classification]) return mapping["default"]
  return mapping[classification]
}

export const mapColorForStatus = status => {
  const mapping = {
    hospitalised: {
      main: colors.amber[900],
      contrastText: "#fff",
    },
    stable: {
      main: colors.orange[500],
      contrastText: "#fff",
    },
    hospitalised_again: {
      main: colors.orange[900],
      contrastText: "#fff",
    },
    pending_admission: {
      main: "#f99f02",
      contrastText: "#fff",
    },
    discharged: {
      main: "#368e3b",
      contrastText: "#fff",
    },
    serious: {
      main: "#eb605e",
      contrastText: "#fff",
    },
    critical: {
      main: colors.red[900],
      contrastText: "#fff",
    },
    deceased: {
      main: colors.gray[700],
      contrastText: "#fff",
    },
    no_admission: {
      main: colors.gray[500],
      contrastText: "#fff",
    },
    asymptomatic: {
      main: "#4f5096",
      contrastText: "#fff",
    },
    default: {
      main: "#cfcfcf",
      contrastText: "#fff",
    },
  }

  if (!mapping[status]) return mapping["default"]
  return mapping[status]
}
