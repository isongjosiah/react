import React from 'react';
import { render } from '@testing-library/react';
import ReactDOM from 'react-dom'
import renderer from 'react-test-renderer'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import App, { Search, Button, Table } from './App';


describe('App', () => {
  // test('renders learn react link', () => {
  //   const { getByText } = render(<App />);
  //   const linkElement = getByText(/learn react/i);
  //   expect(linkElement).toBeInTheDocument();
  // });
  it('renders without crashing', () => {
    const div = document.createElement('div')
    render(<App />, div);
    ReactDOM.unmountComponentAtNode(div)
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <App />
    )
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot()
  })

})

describe('Search', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Search>Search</Search>, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(<Search>Search</Search>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

})

describe('Button', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Button>Give Me More</Button>, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Button>Give More</Button>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('Table', () => {
  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'Y' },
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' },
    ],
  }

  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Table {...props}></Table>, div)
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Table {...props}></Table>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('shows two items in list', () => {
    const element = shallow(
      <Table {...props} />
    )

    expect(element.find('.table-row').lenght).toBe(2)
  })
})

