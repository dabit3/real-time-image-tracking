/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const process = `query Process($imageKey: String!) {
  process(imageKey: $imageKey) {
    id
    imageKey
    rekognitionData
  }
}
`;
export const getImageData = `query GetImageData($id: ID!) {
  getImageData(id: $id) {
    id
    imageKey
    rekognitionData
  }
}
`;
export const listImageDatas = `query ListImageDatas(
  $filter: ModelImageDataFilterInput
  $limit: Int
  $nextToken: String
) {
  listImageDatas(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      imageKey
      rekognitionData
    }
    nextToken
  }
}
`;
