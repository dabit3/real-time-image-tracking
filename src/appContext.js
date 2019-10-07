import React from "react"
const AppContext = React.createContext()

class ContextProviderComponent extends React.Component {
  state = {
    categories: ['Animal'],
  }

  updateCategories = categories => {
    let categoryArray = categories.split(',')
    categoryArray = categoryArray.map(c => c.trim())
    this.setState({ categories: categoryArray})
    console.log('categories: ', categories)
    console.log('categoryArray: ', categoryArray)
  }

  render() {
    return (
      <AppContext.Provider value={{
        ...this.state,
        updateCategories: this.updateCategories
      }}>
        {this.props.children}
      </AppContext.Provider>
    )
  }
}

export {
  AppContext,
  ContextProviderComponent
}