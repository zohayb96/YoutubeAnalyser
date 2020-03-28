import React, { Component } from 'react'
import { connect } from 'react-redux'
import YouTube from 'react-youtube';
import axios from 'axios';
import { isNullOrUndefined } from 'util';
import { decode } from 'querystring';
import SubtitleTable from './subtitleTable'
var lda = require('lda');

class YoutubePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: '2g811Eo7K8U',
      videoLink: '',
      subtitleList: [],
      seekTime: 0,
      topics: []
      // ?t=51 time parameter to seek to that time
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.generateTopicModel = this.generateTopicModel.bind(this);
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
    this.generateTopicModel();
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
  }

  getSubtitleDocFormat() {
    let subtitleTextList = []
    let subList = this.state.subtitleList
    for (var i in subList) {
      subtitleTextList.push(subList[i].text)
    }
    return subtitleTextList
  }

  generateTopicModel() {
    event.preventDefault()
    let tempTopicDict = []
    var text = 'Cats are small. Dogs are big. Cats like to chase mice. Dogs like to eat bones.';
    var documents = text.match(/[^\.!\?]+[\.!\?]+/g);
    // console.log(documents)
    let documentSubtitles = this.getSubtitleDocFormat()
    console.log(documentSubtitles)
    // Run LDA to get terms for 2 topics (5 terms each).
    // var i, j, temparray, chunk = 10;
    // for (i = 0, j = documentSubtitles.length; i < j; i += chunk) {
    // temparray = documentSubtitles.slice(i, i + chunk);
    var ldaResult = lda(documentSubtitles, 8, 5);
    this.setState({ topics: ldaResult })
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
        <div id="player">
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
        </div>
        <center>
          {/* <form> */}
          {/* <input className="field" type="text" placeholder="Search"></input> */}
          {/* <button onClick={this.generateTopicModel}>PRESS MEEEEE</button> */}
          {/* </form> */}
          <table>
            <th>Start</th>
            <th>End</th>
            <th>Text</th>
            {this.state.subtitleList.map(sub => {
              // return <SubtitleTable subtitleData={sub} vidId={}/>
              return (
                <tr key={sub.key}>
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
        <table>
          {this.state.topics.map((topic, index) => {
            return (
              <div>
                <th>Topic {index}</th>
                <tr>
                  {topic.map(topicData => {
                    return (
                      <div>
                        <td>
                          {topicData.term.toString()}
                        </td>
                        <td>
                          {topicData.probability}
                        </td>
                      </div>
                    )
                  })}
                </tr>
              </div>
            )
          })}
        </table>
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
