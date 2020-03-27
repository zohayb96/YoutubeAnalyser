import React, { Component } from 'react'
import { connect } from 'react-redux'
import YouTube from 'react-youtube';
const youtubedl = require('youtube-dl')

class YoutubePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: "",
      videoLink: ""
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }

  parseLinkIntoId(url) {
    var ID = '';
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
      ID = url[2].split(/[^0-9a-z_\-]/i);
      ID = ID[0];
    }
    else {
      ID = url;
    }
    return ID;
  }

  handleChange(event) {
    this.setState({ videoLink: event.target.value })
    console.log(this.state)
  }

  handleSubmit(event) {
    // Stop trigger of refresh
    event.preventDefault()
    const video = (this.parseLinkIntoId(this.state.videoId))
    this.setState({ videoId: video })
  }

  render() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1
      }
    };

    return (
      <div>
        <YouTube
          videoId={this.state.videoId}
          opts={opts}
          onReady={this._onReady}
        />
        <form>
          <input className="field" type="text" placeholder="Youtube Video Link" required="" width="100%" name="video" onChange={this.handleChange} value={this.state.videoLink}></input>
          <button type="submit" onClick={this.handleSubmit}>Submit</button>
        </form>
      </div>
    )
  }

  _onReady(event) {
    event.target.pauseVideo();
  }
}


const mapStateToProps = state => ({

})

const mapDispatchToProps = dispatch => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(YoutubePlayer)
