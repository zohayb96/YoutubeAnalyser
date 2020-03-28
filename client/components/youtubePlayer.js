import React, { Component } from 'react'
import { connect } from 'react-redux'
import YouTube from 'react-youtube';
import axios from 'axios';
import { isNullOrUndefined } from 'util';
import { decode } from 'querystring';
import SubtitleTable from './subtitleTable'

class YoutubePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: '2g811Eo7K8U',
      videoLink: '',
      subtitleList: [],
      seekTime: 0
      // ?t=51 time parameter to seek to that time
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  parseLinkIntoId(url) {
    try {
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
    } catch (error) {
      console.log('Invalid URl')
    }
  }

  handleChange(event) {
    this.setState({ videoLink: event.target.value })
    console.log(this.state)
  }

  removeElement(el) {
    el && el.parentNode && el.parentNode.removeChild(el);
  }

  createObject(subArray) {
    let tempSubArray = []
    var i = 0;
    for (i = 0; i < subArray.length - 1; i++) {
      // var el = document.createElement('html');
      // el.innerHTML = subArray[i];
      var mystring = subArray[i]
      mystring = mystring.split('"')
      var formattedText = mystring[4].slice(mystring[4].lastIndexOf('>') + 1);
      tempSubArray.push({
        start: parseFloat(mystring[1]),
        end: parseFloat(mystring[1]) + parseFloat(mystring[3]),
        text: formattedText
      })
    }
    this.setState({ subtitleList: tempSubArray })
  }

  async getCaptions(videoData) {
    // console.log(videoData.data)
    // console.log(typeof (videoData.data))
    var doc = new DOMParser().parseFromString(videoData.data, "text/xml");
    let innerData = (doc.firstChild.innerHTML);
    var replaceSpecial = innerData.replace(/&amp;#39;/g, "'");
    let subtitleArray = replaceSpecial.split('</text>')
    // console.log(subtitleArray)
    this.createObject(subtitleArray)
  }

  async handleSubmit(event) {
    // Stop trigger of refresh
    event.preventDefault()
    const video = String(this.parseLinkIntoId(this.state.videoLink))
    // AXIOS
    const videoUrl = `http://video.google.com/timedtext?lang=en&v=${video}`
    this.setState({ videoId: video })
    this.getCaptions(videoUrl)
    const captions = await axios.get(videoUrl).then(res => this.getCaptions(res));
    // event.target.playVideo();
  }

  seekToTime(time) {
    var intvalue = Math.floor(time);
    let timeSeek = (this.state.videoId + '?t=' + intvalue)
    this.setState({ seekTime: intvalue })
    console.log(this.state)
  }


  render() {
    const opts = {
      height: '200',
      width: '350',
      playerVars: {
        autoplay: 0
      }
    };

    return (
      <div id="youtube">
        <YouTube
          videoId={this.state.videoId}
          opts={opts}
          onReady={this._onReady}
        // seekTo={this.seekTo}
        />
        <form>
          <input className="field" type="text" placeholder="Youtube Video Link" required="" name="video" onChange={this.handleChange} value={this.state.videoLink}></input>
          <button type="submit" onClick={this.handleSubmit}>Submit</button>
        </form>
        <center>
          <table>
            <th>Start</th>
            <th>End</th>
            <th>Text</th>
            {this.state.subtitleList.map(sub => {
              // return <SubtitleTable subtitleData={sub} vidId={}/>
              return (
                <tr key={sub.start}>
                  <td >
                    {new Date(sub.start * 1000).toISOString().substr(11, 8)}
                  </td>
                  <td onClick={() => this.seekToTime(sub.end)}>
                    {new Date(sub.end * 1000).toISOString().substr(11, 8)}
                  </td>
                  <td>{sub.text}</td>
                </tr>
              )
            })}
          </table>
        </center>
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
