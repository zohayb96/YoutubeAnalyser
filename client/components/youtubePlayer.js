import React, { Component } from 'react'
import { connect } from 'react-redux'
import YouTube from 'react-youtube';
import axios from 'axios';
import { isNullOrUndefined } from 'util';
import { decode } from 'querystring';
var lda = require('lda');
var keywordExtractor = require("keyword-extractor");
var Sentiment = require('sentiment');

class YoutubePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // default video
      videoId: '6Af6b_wyiwI',
      videoLink: '',
      subtitleList: [],
      seekTime: 0,
      topics: [],
      keywordList: [],
      posKeyWords: [],
      negKeyWords: [],
      sentimentScore: 0,
      search: '',
      // LDA Topic Modeling Parameters
      topicNumber: 5,
      termNumber: 3
      // ?t=51 time parameter to seek to that time
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
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

  handleSearch(event) {
    this.setState({ search: event.target.value })
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
    var doc = new DOMParser().parseFromString(videoData.data, "text/xml");
    let innerData = (doc.firstChild.innerHTML);
    var replaceSpecial = innerData.replace(/&amp;#39;/g, "'");
    // Check for more xml special charachters
    // replaceSpecial.replace(/&amp;quot;/g, "'");
    let subtitleArray = replaceSpecial.split('</text>')
    this.createObject(subtitleArray)
    this.generateTopicModel();
  }


  async handleSubmit(event) {
    // Stop trigger of refresh
    event.preventDefault()
    // RESET STATE
    this.setState({
      subtitleList: [],
      seekTime: 0,
      topics: [],
      keywordList: [],
      search: ''
    })

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
    // let timeSeek = (this.state.videoId + '?t=' + intvalue)
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
    console.log(documentSubtitles.length)
    // console.log(documentSubtitles)
    // Run LDA to get terms for 2 topics (5 terms each).

    // Convert subtitle list into chunked array to apply keyword extraction
    // Default is 10
    var i, j, temparray, chunk = 10;
    let keywordsExtracted = []

    let sentimentDataPos = []
    let sentimentDataNeg = []
    var sentiment = new Sentiment();

    // for (i = 0, j = documentSubtitles.length; i < j; i += chunk) {
    //   temparray = documentSubtitles.slice(i, i + chunk);
    //   var extractionResult = keywordExtractor.extract(temparray, {
    //     language: "english",
    //     remove_digits: true,
    //     return_changed_case: true,
    //     remove_duplicates: true,
    //     return_chained_words: false,
    //   });
    //   keywordsExtracted.push(extractionResult)
    // }

    let sentimentDataChunk = (sentiment.analyze(documentSubtitles.join(',')))
    sentimentDataChunk.positive.map((posData) => {
      sentimentDataPos.push(posData)
    })
    sentimentDataChunk.negative.map((negData) => {
      sentimentDataNeg.push(negData)
    })

    // Sentiment Analysis
    console.log(sentimentDataChunk);
    let sentimentScoreData = sentimentDataChunk.score
    // number of topics
    //this.state.topicNumber

    // number of terms
    // this.state.termsNumber
    var ldaResult = lda(documentSubtitles, this.state.topicNumber, this.state.termNumber);
    this.setState({ topics: ldaResult, posKeyWords: sentimentDataPos, negKeyWords: sentimentDataNeg, sentimentScore: sentimentScoreData })
  }


  render() {
    // console.log('currentUserFromRedux:', this.props.currentUser)
    let filteredCaptionData = this.state.subtitleList.filter((sub) => {
      return sub.text.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1
    });
    const opts = {
      height: '200',
      width: '350',
      playerVars: {
        autoplay: 1,
        start: this.state.seekTime
      }
    };

    return (
      <div id="youtube" >
        <div id="playerContainer">
          <div id="player">
            <YouTube
              videoId={this.state.videoId}
              opts={opts}
              onReady={this._onReady}
            // seekTo={this.seekTo}
            />
          </div>
          <form>
            <input className="field" type="text" id="youtubeLink" placeholder="Youtube Video Link" required="" name="video" onChange={this.handleChange} value={this.state.videoLink}></input>
            <button type="submit" onClick={this.handleSubmit}>Submit</button>
          </form>
          <form className="form" onChange={this.handleSearch}>
            <input
              id="textSearch"
              type="text"
              placeholder="Search"
            />
          </form>
          {(this.state.posKeyWords.length !== 0 && this.state.negKeyWords.length !== 0) ? (
            <div id="keywords">
              <table border="1" >
                <React.Fragment>
                  <th>Positive Key Words</th>
                  {this.state.posKeyWords.map((posWord, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          {posWord}
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              </table>
              <table border="1" >
                <th>Negative Key Words</th>
                {this.state.negKeyWords.map((negWord, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        {negWord}
                      </td>
                    </tr>
                  )
                })}
              </table>
            </div>
          ) : (
              // No content
              <p></p>
            )}
          <div>
            {(this.state.sentimentScore > 0) ?
              (<p>Overall Sentiment Score: {this.state.sentimentScore} (Positive) 😁</p>) :
              (this.state.sentimentScore < 0) ?
                (<p>Overall Sentiment Score: {this.state.sentimentScore} (Negative) 😥</p>) :
                (<p></p>)}
          </div>
        </div>
        <div id="captionContainer">
          {/* <div id="captionContainer"> */}
          <div id="captions">
            {/* ?? */}
            {/* SEARCH!!! */}
            {this.state.subtitleList.length !== 0 ? (
              <table border="1">
                <React.Fragment>
                  <th>Start</th>
                  <th>End</th>
                  <th>Text</th>
                  <tbody>
                    {filteredCaptionData.map((sub, index) => {
                      // return <SubtitleTable subtitleData={sub} vidId={}/>
                      return (
                        <tr key={index}>
                          <td onClick={() => this.seekToTime(sub.start)}>
                            {new Date(sub.start * 1000).toISOString().substr(11, 8)}
                          </td>
                          <td onClick={() => this.seekToTime(sub.end)}>
                            {new Date(sub.end * 1000).toISOString().substr(11, 8)}
                          </td>
                          <td>{sub.text}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </React.Fragment>
              </table>
            ) : (
                <p>
                  {/* no content */}
                </p>
              )
            }
          </div>
          <div id="topics">
            {this.state.topics.length !== 0 ? (
              <table border="1">
                {this.state.topics.map((topic, index) => {
                  return (
                    <React.Fragment key={index}>
                      <th>Topic {index + 1}</th>
                      <tr>
                        {topic.map((topicData, index) => {
                          return (
                            <div id={index}>
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
                    </React.Fragment>
                  )
                })}
              </table>
            ) : (
                // No content
                <p></p>
              )}
          </div>
        </div>
      </div>
    )
  }

  _onReady(event) {
    event.target.pauseVideo();
  }
}


const mapStateToProps = state => ({
  currentUser: state.user
})

const mapDispatchToProps = dispatch => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(YoutubePlayer)
