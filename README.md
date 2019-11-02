## Real-time image recognition

![](header.png)

### What is this?

This app will allow you to set a tracker on the types of items you'd like to detect. It will then check for movement, detect the item in the picture, and if the item is on the list of items being tracked, will display the image in an image feed.

### To deploy this project

1. Update the [Amplify CLI](https://aws-amplify.github.io/docs/) to the latest version

```sh
$ npm install -g @aws-amplify/cli
```

2. Clone the repo & install the dependencies

```sh
git clone https://github.com/dabit3/real-time-image-tracking.git

cd real-time-image-tracking

npm install
```

3. Initialize & deploy the Amplify project

```sh
amplify init

amplify push
```

4. Update the IAM policy associated with the Lambda function to have access to Rekognition as well as the S3 bucket (open the AWS console and open the Lambda function to see the associated role)

Function name can be found in `amplify/backend/function/rekognitionfunction-<environment-name>`

5. Update the environment variables in the Lambda console: `BUCKET`, `APPSYNC_ENDPOINT`, and `APPSYNC_KEY`. All of these values can be found in `aws-exports.js`

6. Run the project

```sh
npm start
```

### Tools

- React
- AWS Amplify
- AWS AppSync
- Amazon Cognito
- Amazon Rekognition
- React Router
- AWS Lambda

### GraphQL schema

```graphql
type ImageData @model
  @auth(rules: [
    { allow: public },
    { allow: private }
    ])
{
  id: ID!
  imageKey: String
  rekognitionData: String
  imageTypes: [String]
}

type Query {
  process(imageKey: String!): ImageData @function(name: "rekognitionfunction-${env}")
}
```

### Lambda function:

```javascript
const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-2'})
const rekognition = new AWS.Rekognition()
const axios = require('axios')
const gql = require('graphql-tag')
const graphql = require('graphql')
const { print } = graphql
const uuid = require('uuid/v4')

const saveData = gql`mutation CreateImageData($input: CreateImageDataInput!) {
  createImageData(input: $input) {
    id
    imageKey
    rekognitionData
  }
}`;

exports.handler = function (event, context) { //eslint-disable-line
  var params = {
    Image: {
      S3Object: {
        Bucket: process.env.BUCKET, 
        Name: "public/" + event.arguments.imageKey
      }
    }, 
    MaxLabels: 10, 
    MinConfidence: 70
  };

  rekognition.detectLabels(params, function(err, data) {
    if (err) {
      context.done(err)
    } else {
      const rekognitionData = JSON.stringify(data)
      axios({
        url: process.env.APPSYNC_ENDPOINT,
        method: 'post',
        headers: {
          'x-api-key': process.env.APPSYNC_KEY
        },
        data: {
          query: print(saveData),
          variables: {
            input: {
              imageKey: event.arguments.imageKey,
              rekognitionData
            }
          }
        }
      })
      .then(successData => {
        const { id, imageKey, rekognitionData } = successData.data.data.createImageData
        const graphqlData = {
          id,
          imageKey,
          rekognitionData
        }
        context.done(null, graphqlData)
      })
      .catch(err => context.done(err))
    }
  })
}
```
