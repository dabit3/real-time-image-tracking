import React from 'react'
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { onCreateImageData } from './graphql/subscriptions'
import { AppContext } from './appContext'

class Results extends React.Component {
  state = {
    images: [],
    input: ''
  }
  async componentDidMount() {
    API.graphql(graphqlOperation(onCreateImageData))
      .subscribe({
        next: async imageData => {
          const { value: { data: { onCreateImageData: { id, imageKey, rekognitionData } }}} = imageData
          const labels = JSON.parse(rekognitionData)
          const categories = labels.Labels.map(label => label.Name.toLowerCase())
          const images = [...this.state.images]
          this.props.context.categories.forEach(async c => {
            if (categories.includes(c.toLowerCase())) {
              const src = await Storage.get(imageKey)
              const label = categories.join(' or ')
              const imageInfo = {
                label, src
              }
              images.push(imageInfo)
            }
          })
          this.setState({ images })
        }
      })
  }
  updateInput = e => {
    this.setState({ input: e.target.value })
  }
  updateCategories = () => {
    this.props.context.updateCategories(this.state.input)
    this.setState({ input: '' })
  }
  render() {
    return (
      <div>
        <p style={whiteText}>Currently tracking {this.props.context.categories.join(' & ')}</p>
        <input onChange={this.updateInput} value={this.state.input} style={inputStyle} placeholder="Update categories" />
        <button style={buttonStyle} onClick={this.updateCategories}>Update Categories</button>
        { !this.state.images.length && <p style={heading}>Awaiting results.....</p>}
        {
          this.state.images.map((image, index) => {
            return (
              <div key={index}>
                <p>{image.label}</p>
                <img
                  style={{ width: 600, height: 300 }}
                  src={image.src} />
              </div>
            )
          })
        }
      </div>
    )
  }
}

const whiteText = {
  color: 'white',
  margin: '18px 0px 20px'
}

const inputStyle = {
  height: 45,
  margin: '0px 10px',
  padding: '8px 12px',
  outline: 'none',
  border: 'none',
  fontFamily: "sans-serif",
  color: 'black',
  fontSize: 16
}

const buttonStyle = {
  padding: '16px 50px',
  outline: 'none',
  border: 'none',
  backgroundColor: 'rgba(255, 255, 255, .1)',
  borderRadius: 7,
  marginTop: 10,
  marginRight: 5,
  cursor: 'pointer'
}

const heading = {
  fontSize: 26
}

function ResultsWithContext(props) {
  return (
    <AppContext.Consumer>
      {
        context => <Results {...props} context={context} />
      }
    </AppContext.Consumer>
  )
}

export default ResultsWithContext