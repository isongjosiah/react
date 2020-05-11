import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAtom } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { sortBy } from 'lodash'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './App.css';


const DEFAULT_QUERY = 'react'
const DEFAULT_HPP = '100'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
}

const updateSearchTopStoriesState = (hits, page) => (prevState) => {
  const { searchKey, results } = prevState

  const oldHits = results && results[searchKey] ? results[searchKey].hits : []

  const updatedHits = [...oldHits, ...hits]
  return {
    results: {
      ...results,
      [searchKey]: { hits: updatedHits, page }
    },
    isLoading: false
  }
}


class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    }

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this)
    this.setSearchTopStories = this.setSearchTopStories.bind(this)
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this)
    this.onDismiss = this.onDismiss.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
    this.onSearchSubmit = this.onSearchSubmit.bind(this)
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm]
  }
  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value })
  }
  setSearchTopStories(result) {
    const { hits, page } = result

    this.setState(updateSearchTopStoriesState(hits, page))
  }



  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true })
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this.setState({ error }))
  }

  componentDidMount() {
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm })
    this.fetchSearchTopStories(searchTerm)
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm })
    if (this.needsToSearchTopStories(searchTerm)) {
      console.log("searcing")
      this.fetchSearchTopStories(searchTerm)
    }
    event.preventDefault()
  }

  onDismiss(id) {
    const { searchKey, results } = this.state
    const { hits, page } = results[searchKey]
    const isNotId = item => item.objectID !== id
    const updatedHits = hits.filter(isNotId)
    this.setState({
      results: { ...results, [searchKey]: { hits: updatedHits, page } }

    })
  }


  render() {
    const { searchTerm, results, searchKey, error, isLoading } = this.state
    const page = (results && results[searchKey] && results[searchKey].page) || 0
    const list = (results && results[searchKey] && results[searchKey].hits) || []

    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit} > Search </Search>
        </div>
        {error
          ? <div className="interactions">
            <p>Something went wrong.</p>
          </div> : < Table list={list} onDismiss={this.onDismiss} />}
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
          >
            More
          </ButtonWithLoading>
        </div>
      </div >
    );
  }
}

class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus()
    }
  }

  render() {

    const {
      value,
      onChange,
      onSubmit,
      children
    } = this.props
    return (
      <form onSubmit={onSubmit} > <input
        type="text"
        value={value}
        onChange={onChange}
        ref={el => this.input = el}
      />
        <button type="submit">{children}</button>
      </form>
    )
  }
}

class Table extends Component {
  constructor(props) {
    super(props)

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    }

    this.onSort = this.onSort.bind(this)
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse
    this.setState({ sortKey, isSortReverse })
  }
  render() {
    const { list, onDismiss } = this.props
    const { sortKey, isSortReverse } = this.state
    const sortedList = SORTS[sortKey](list)
    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList

    return (
      <div className="table" >
        <div className="table-header">
          <span style={{ width: '40px' }}><Sort activeSortkey={sortKey} sortKey={'TITLE'} onSort={this.onSort}> Title </Sort></span>
          <span style={{ width: '30%' }}><Sort activeSortkey={sortKey} sortKey={'AUTHOR'} onSort={this.onSort}>Author</Sort></span>
          <span style={{}}><Sort activeSortkey={sortKey} sortKey={'COMMENTS'} onSort={this.onSort}> Comments </Sort></span>

          <span style={{}}><Sort activeSortkey={sortKey} sortKey={'POINTS'} onSort={this.onSort}> Points </Sort></span>
          <span style={{ width: '10%' }}>Archive</span>
        </div>
        {reverseSortedList.map(item =>
          <div key={item.objectID} className="table-row">
            <span style={{ width: '40%' }}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '30%' }}>{item.author}</span>
            <span style={{ width: '10%' }}>{item.num_comments}</span>
            <span style={{ width: '10%' }}>{item.points}</span>
            <span style={{ width: '10%' }}>
              <Button
                onClick={() => onDismiss(item.objectID)}
                className="buttton-inline">Dismiss</Button>
            </span>
          </div>)}
      </div >
    )
  }
}

const Sort = ({ sortKey, onSort, children, activeSortKey }) => {
  const sortClass = classNames(
    'button-inline', { 'button-active': sortKey === activeSortKey }
  )

  if (sortKey === activeSortKey) {
    sortClass.push('button-active')
  }
  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass}>{children}</Button>
  )
}
class Button extends Component {
  render() {
    const {
      onClick,
      className,
      children,
    } = this.props

    return (
      <button onClick={onClick}
        className={className}
        type="button"
      >
        {children}
      </button>
    )
  }

}

const Loading = () => (
  <div>
    <FontAwesomeIcon icon={faAtom} style={{ padding: '20px' }} size="lg" spin />
  </div>
)

const withLoading = (Component) => ({ isLoading, ...rest }) =>
  isLoading
    ? <Loading />
    : <Component {...rest} />


const ButtonWithLoading = withLoading(Button)
Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}

Button.defaultProps = {
  className: '',
}

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
}

Search.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}
export default App;

export {
  Button,
  Search,
  Table,
}