import React from 'react';
import PhotoCaption from './PhotoCaption.js';

import url from './mountains.jpg';

/**
 * @CLIENT_SERVER
 */
export default class PhotoCaptionThumbnail extends React.Component {
  render() {
    return <div>
      <PhotoCaption url={url} caption={"Photo by Brandon Lam"} width={300} />
    </div>;
  }
}