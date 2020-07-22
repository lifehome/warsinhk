import React, { useState, useRef } from "react"
import PropTypes from "prop-types"
import Chip from "@material-ui/core/Chip"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import ListItem from "@material-ui/core/ListItem"
import IconButton from "@material-ui/core/IconButton"
import AddIcon from "@material-ui/icons/Add"
import DoneIcon from "@material-ui/icons/Done"
import omit from "lodash/omit"
import TextField from "@material-ui/core/TextField"
import loopbackFilters from "loopback-filters"

const OptionTag = ({
  label,
  options,
  filters,
  field,
  setOption,
  clearFilter,
  filteredList,
  toFilterEntry,
  filterType = "options",
  filterPlaceholder = "",
  getWhereFilter,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const elementRef = useRef()
  const inputRef = useRef()
  const selectValue = option => () => {
    setOption(option)
    setMenuOpen(false)
  }
  const openMenu = () => setMenuOpen(true)
  const closeMenu = () => setMenuOpen(false)
  const filterExists = Boolean(filters[field])
  return (
    <div
      style={{ display: "inline-block", marginRight: "1em" }}
      ref={elementRef}
    >
      <Chip
        size="small"
        variant="outlined"
        color={filterExists ? "secondary" : undefined}
        clickable
        deleteIcon={filterExists ? undefined : <AddIcon />}
        onDelete={filterExists ? () => clearFilter(field) : openMenu}
        label={label}
        onClick={openMenu}
      />
      {menuOpen && (
        <Menu anchorEl={elementRef.current} open={menuOpen} onClose={closeMenu}>
          {filterType === "string" && (
            <form
              onSubmit={event => {
                event.preventDefault()
                const value = inputRef.current.value
                selectValue({ field, filterName: label, value, label: value })()
              }}
            >
              <ListItem>
                <TextField
                  name="filterValue"
                  placeholder={filterPlaceholder}
                  defaultValue={filterExists ? filters[field] : ""}
                  inputRef={inputRef}
                  style={{ width: 280 }}
                />
                <IconButton color="primary" type="submit">
                  <DoneIcon />
                </IconButton>
              </ListItem>
            </form>
          )}
          {options
            .map(option => ({
              ...option,
              field,
              count: loopbackFilters(filteredList, {
                where: getWhereFilter({ [field]: option.value }),
              }).length,
            }))
            .map((option, index) => (
              <form key={index}>
                <MenuItem
                  key={option.value}
                  onClick={selectValue({
                    ...option,
                    filterName: label,
                    field,
                  })}
                  style={{ display: "flex", justifyContent: "space-between" }}
                  selected={filterExists && filters[field] === option.value}
                >
                  <span>{option.label}</span>
                  <span style={{ textAlign: "right", marginLeft: "2em" }}>
                    {option.count}
                  </span>
                </MenuItem>
              </form>
            ))}
        </Menu>
      )}
    </div>
  )
}

const TagStyledFilter = props => {
  const { options, list, onListFiltered } = props
  const [orderedItemSym] = useState(Symbol("order"))
  const [filteredList, setFilteredList] = useState(list)
  const [filters, setFilters] = useState({ [orderedItemSym]: [] })
  const getWhereFilter = newFilters => {
    const andFilters = options
      .filter(i => !i.isOrFilter)
      .map(i =>
        newFilters[i.realFieldName]
          ? i.toFilterEntry([i.realFieldName, newFilters[i.realFieldName]])
          : undefined
      )
      .filter(Boolean)

    const orFilters = options
      .filter(i => i.isOrFilter)
      .map(i =>
        newFilters[i.realFieldName]
          ? i.toFilterEntry([i.realFieldName, newFilters[i.realFieldName]])
          : undefined
      )
      .filter(Boolean)
    return {
        and: [
            Object.fromEntries(andFilters),
            ...orFilters.map(filters => ({or: filters}))
        ]
    }
  }
  const applyFilter = newFilters => {
    const where = getWhereFilter(newFilters)
    const result = loopbackFilters(list, {
      where,
    })
    setFilters(newFilters)
    setFilteredList(result)
    onListFiltered(result)
  }
  const setOption = option => {
    const newFilter = {
      ...omit(filters, option.field),
      [option.field]: option.value,
      [orderedItemSym]: [
        ...filters[orderedItemSym].filter(i => i.field !== option.field),
        option,
      ],
    }
    applyFilter(newFilter)
  }
  const clearFilter = field => {
    const newFilter = {
      ...omit(filters, field),
      [orderedItemSym]: filters[orderedItemSym].filter(i => i.field !== field),
    }
    applyFilter(newFilter)
  }
  return (
    <React.Fragment>
      <div style={{ marginTop: "1em", lineHeight: 2 }}>
        {options.map(option => (
          <OptionTag
            key={option.realFieldName + option.value}
            {...option}
            filters={filters}
            setOption={setOption}
            clearFilter={clearFilter}
            field={option.realFieldName}
            list={list}
            filteredList={filteredList}
            filterType={option.filterType}
            getWhereFilter={getWhereFilter}
          />
        ))}
      </div>
      <div style={{ marginTop: "1em", lineHeight: 2 }}>
        {filters[orderedItemSym].map(option => (
          <div
            style={{ display: "inline-block", marginRight: "1em" }}
            key={option.filterName}
          >
            <Chip
              size="small"
              clickable
              color="primary"
              label={`${option.filterName}: ${option.label}`}
              onDelete={() => clearFilter(option.field)}
              onClick={() => clearFilter(option.field)}
            />
          </div>
        ))}
      </div>
    </React.Fragment>
  )
}

TagStyledFilter.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      node: PropTypes.object.isRequired,
    }).isRequired
  ).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      realFieldName: PropTypes.string.isRequired,
      filterType: PropTypes.oneOf(["options", "string", undefined]),
      toFilter: PropTypes.func,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          field: PropTypes.string.isRequired,
        }).isRequired
      ).isRequired,
    }).isRequired
  ).isRequired,
  onListFiltered: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  searchKey: PropTypes.string.isRequired,
}

export default TagStyledFilter
