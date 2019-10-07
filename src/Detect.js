import React from 'react'
import uuid from 'uuid/v4'
import { Storage } from 'aws-amplify'
import { API, graphqlOperation } from 'aws-amplify'
import { AppContext } from './appContext'

const processImage = `
  query processImage($imageKey: String!) {
    process(imageKey: $imageKey) {
      id
      rekognitionData
      imageKey
    }
  }
`

const PIXEL_SCORE_THRESHOLD = 50
function getDiff(x, y) {
  return Math.abs(x - y)
}

function getImageData(imageData) {
  var imageScore = 0;
  for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i] / 3;
      var g = imageData.data[i + 1] / 3;
      var b = imageData.data[i + 2] / 3;
      var pixelScore = r + g + b;
      if (pixelScore >= PIXEL_SCORE_THRESHOLD) {
          imageScore++;
      }
  }
  return imageScore
}

class Detect extends React.Component {
  state = {
    streamWidth: null,
    streamHeight: null,
    currentImageData: [],
    imageScore: 0,
  }
  interval = null
  canvas = {}
  imageContext = {}
  video = document.getElementById('video');
  componentDidMount() {
    this.canvas = document.getElementById('canvas');
    this.imageContext = this.canvas.getContext('2d')
    this.video = document.getElementById('video');
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          let height = stream.getVideoTracks()[0].getSettings().height
          let width = stream.getVideoTracks()[0].getSettings().width
          if (width > 1000) {
            height = height / 1.5
            width = width / 1.5
          }
          this.setState({
            streamWidth: width,
            streamHeight: height
          })
          // https://stackoverflow.com/questions/53626318/chrome-update-failed-to-execute-createobjecturl-on-url/53734174
          try {
            this.video.src = window.URL.createObjectURL(stream);
          } catch (error) {
            this.video.srcObject = stream;
          }
          this.video.play();
      });
    }
  }
  startTracking = () => {
    if (this.interval) clearInterval(this.interval)
    this.setImageScore()
    this.interval = setInterval(() => {
      this.checkImageDiff()
    }, 1000)
  }
  cancelTracking = () => {
    clearInterval(this.interval)
  }
  setImageScore = () => {
    this.imageContext.drawImage(this.video, 0, 0, this.state.streamWidth, this.state.streamHeight);
    const imageData = this.imageContext.getImageData(0, 0, this.state.streamWidth, this.state.streamHeight)
    const imageScore = getImageData(imageData)
    this.setState({ imageScore })
  }
  checkImageDiff = () => {
    this.imageContext.drawImage(this.video, 0, 0, this.state.streamWidth, this.state.streamHeight);
    const imageData = this.imageContext.getImageData(0, 0, this.state.streamWidth, this.state.streamHeight)
    const newScore = getImageData(imageData)
    const prevScore = this.state.imageScore
    this.setState({ imageScore: newScore })
    const diff = getDiff(newScore, prevScore)
    console.log('diff: ', diff)
    if (diff > 10000) {
      console.log('movement detected...')
      this.saveImageFromCanvas()
    } else {
      console.log('No movement detected...')
    }
  }
  saveImageFromCanvas = () => {
    var image = new Image()
    image.id = "pic" + uuid()
    var canvas = document.getElementById("canvas");
    image.src = canvas.toDataURL();
    var blobBin = atob(image.src.split(',')[1]);
    var array = [];
    for(var i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    var file = new Blob([new Uint8Array(array)], {type: 'image/jpg'});
    const fileName = `images/${uuid()}_snapshot.jpg`
    console.log('fileName: ', fileName)
    // return
    Storage.put(fileName, file)
      .then(() => {
        const imageInfo = { imageKey: fileName }
        API.graphql(graphqlOperation(processImage, imageInfo))
          .then(data => {
            const rekognitionData = JSON.parse(data.data.process.rekognitionData)
            console.log('rekognitionData: ', rekognitionData)
            
        })
        .catch(error => {
          console.log('error: ', error)
          this.setState({
            processing: false,
          })
        })
      })
      .catch(err => {
        console.log('error from upload: ', err)
        this.setState({
          processing: false,
        })
      })
  }
  render() {
    return (
      <div>
        <video
          style={{
            height: this.state.streamHeight,
          }}
        id="video" width={this.state.streamWidth} autoPlay></video>
        <canvas style={{
            position: 'absolute',
            marginLeft: -9999,
            height: !this.state.isSnapped || !this.state.showCamera ? '0px' : this.state.streamHeight
          }} id="canvas" width={this.state.streamWidth} height={this.state.streamHeight}></canvas>
        <button style={buttonStyle} onClick={this.startTracking}>Start Tracking</button>
        <button style={buttonStyle} onClick={this.cancelTracking}>Stop Tracking</button>
      </div>
    )
  }
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

function DetectWithContext(props) {
  return (
    <AppContext.Consumer>
      {
        context => <Detect {...props} context={context} />
      }
    </AppContext.Consumer>
  )
}

export default DetectWithContext