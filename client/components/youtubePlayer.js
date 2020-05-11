import React, { Component } from 'react';
import { connect } from 'react-redux';
import YouTube from 'react-youtube';
import axios from 'axios';
import { isNullOrUndefined } from 'util';
import { decode } from 'querystring';
var lda = require('lda');
var keywordExtractor = require('keyword-extractor');
var Sentiment = require('sentiment');

class YoutubePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // default video
      videoId: '',
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
      termNumber: 5,
      // ?t=51 time parameter to seek to that time
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.generateTopicModel = this.generateTopicModel.bind(this);
  }

  // Fucntion used to extract youtube vieo id from a youtube video link
  // ex: https://www.youtube.com/watch?v=wzjWIxXBs_s to wzjWIxXBs_s
  parseLinkIntoId(url) {
    try {
      var ID = '';
      url = url
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
      } else {
        ID = url;
      }
      return ID;
    } catch (error) {
      console.log('Invalid URl');
    }
  }

  handleChange(event) {
    this.setState({ videoLink: event.target.value });
    console.log(this.state);
  }

  handleSearch(event) {
    this.setState({ search: event.target.value });
    console.log(this.state);
  }

  // Used to create an array of subtitle objects to save to state in subtitle list to allow them to be displayed and used for NLP algorithms
  createObject(subArray) {
    let tempSubArray = [];
    var i = 0;
    for (i = 0; i < subArray.length - 1; i++) {
      // var el = document.createElement('html');
      // el.innerHTML = subArray[i];
      var mystring = subArray[i];
      mystring = mystring.split('"');
      var formattedText = mystring[4].slice(mystring[4].lastIndexOf('>') + 1);
      tempSubArray.push({
        start: parseFloat(mystring[1]),
        end: parseFloat(mystring[1]) + parseFloat(mystring[3]),
        text: formattedText,
      });
    }
    this.setState({ subtitleList: tempSubArray });
  }

  // Get caption data object from the video data xml file
  async getCaptions(videoData) {
    var doc = new DOMParser().parseFromString(videoData.data, 'text/xml');
    let innerData = doc.firstChild.innerHTML;
    var replaceSpecial = innerData.replace(/&amp;#39;/g, "'");
    // Check for more xml special charachters
    // replaceSpecial.replace(/&amp;quot;/g, "'");
    let subtitleArray = replaceSpecial.split('</text>');
    // DELETE BELOW
    this.createObject(subtitleArray);

    this.generateTopicModel();
  }

  capitalize(s) {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  async handleSubmit(event) {
    // Stop trigger of refresh
    event.preventDefault();
    // RESET STATE

    const video = String(this.parseLinkIntoId(this.state.videoLink));

    this.setState({
      topics: [],
      subtitleList: [],
      posKeyWords: [],
      negKeyWords: [],
      seekTime: 0,
      search: '',
    });
    // AXIOS
    // const videoUrl = `https://video.google.com/timedtext?lang=en&v=${video}`
    const videoUrl = `https://video.google.com/timedtext?lang=en&v=${video}`;
    this.setState({ videoId: video });
    this.getCaptions(videoUrl);
    const captions = await axios
      .get(videoUrl)
      .then((res) => this.getCaptions(res));
    // event.target.playVideo();
  }

  // set seektime on state to allow video player to play from particular start time
  seekToTime(time) {
    var intvalue = Math.floor(time);
    // let timeSeek = (this.state.videoId + '?t=' + intvalue)
    this.setState({ seekTime: intvalue });
  }

  getSubtitleDocFormat() {
    let subtitleTextList = [];
    let subList = this.state.subtitleList;
    for (var i in subList) {
      subtitleTextList.push(subList[i].text);
    }
    return subtitleTextList;
  }

  generateTopicModel() {
    // Stop refresh from occuring when function called
    event.preventDefault();

    // var text =
    //   'Cats are small. Dogs are big. Cats like to chase mice. Dogs like to eat bones.';
    // var documents = text.match(/[^\.!\?]+[\.!\?]+/g);
    let documentSubtitles = this.getSubtitleDocFormat();

    let sentimentDataPos = [];
    let sentimentDataNeg = [];
    var sentiment = new Sentiment();

    // Extract setiment words from subtitles and push to rspective array
    let sentimentDataChunk = sentiment.analyze(documentSubtitles.join(','));
    sentimentDataChunk.positive.map((posData) => {
      sentimentDataPos.push(this.capitalize(posData));
    });
    sentimentDataChunk.negative.map((negData) => {
      sentimentDataNeg.push(this.capitalize(negData));
    });

    // Save positive and negative words and avoid duplicates using a set
    let posSetWords = [...new Set(sentimentDataPos)];
    let negSetWords = [...new Set(sentimentDataNeg)];

    // Sentiment Analysis
    let sentimentScoreData = sentimentDataChunk.score;
    // LDA Topic Modeling
    var ldaResult = lda(
      documentSubtitles,
      this.state.topicNumber,
      this.state.termNumber
    );

    this.setState({
      topics: ldaResult,
      posKeyWords: posSetWords,
      negKeyWords: negSetWords,
      sentimentScore: sentimentScoreData,
    });
  }

  // Stop refresh trigger
  doNothing() {
    event.preventDefault();
    return false;
  }

  // Change search term to specified search term
  setSearchParam(searchTerm) {
    document.getElementById('textSearch').value = searchTerm;
    this.setState({ search: searchTerm });
  }

  render() {
    let filteredCaptionData = this.state.subtitleList.filter((sub) => {
      return (
        sub.text.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1
      );
    });
    // Player options for yt player
    const opts = {
      height: '200',
      width: '350',
      playerVars: {
        autoplay: 1,
        start: this.state.seekTime,
      },
    };

    return (
      <div>
        <div id="youtube">
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
              <input
                className="field"
                type="text"
                id="youtubeLink"
                placeholder="Insert Youtube Video Link"
                required=""
                name="video"
                onChange={this.handleChange}
                value={this.state.videoLink}
              ></input>
              <button type="submit" onClick={this.handleSubmit}>
                Submit
              </button>
            </form>
            <form
              className="form"
              onChange={this.handleSearch}
              onSubmit={this.doNothing}
            >
              <input
                id="textSearch"
                type="text"
                placeholder="Search"
                onSubmit={this.doNothing}
              />
            </form>
            {/* Conditonal render to hid terms if none exist */}
            {this.state.posKeyWords.length !== 0 &&
            this.state.negKeyWords.length !== 0 ? (
              <div id="keywords">
                <table border="1">
                  <React.Fragment>
                    <th>Positive Key Words</th>
                    {this.state.posKeyWords.map((posWord, index) => {
                      return (
                        <tr
                          key={index}
                          onClick={() => this.setSearchParam(posWord)}
                        >
                          <td>{posWord}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                </table>
                <table border="1">
                  <React.Fragment>
                    <th>Negative Key Words</th>
                    {this.state.negKeyWords.map((negWord, index) => {
                      return (
                        <tr
                          key={index}
                          onClick={() => this.setSearchParam(negWord)}
                        >
                          <td>{negWord}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                </table>
              </div>
            ) : (
              // No content
              <p></p>
            )}
            <div>
              {this.state.sentimentScore > 0 ? (
                <p>
                  Overall Sentiment Score: {this.state.sentimentScore}{' '}
                  (Positive) 😁
                </p>
              ) : this.state.sentimentScore < 0 ? (
                <p>
                  Overall Sentiment Score: {this.state.sentimentScore}{' '}
                  (Negative) 😥
                </p>
              ) : (
                <p></p>
              )}
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
                              {new Date(sub.start * 1000)
                                .toISOString()
                                .substr(11, 8)}
                            </td>
                            <td onClick={() => this.seekToTime(sub.end)}>
                              {new Date(sub.end * 1000)
                                .toISOString()
                                .substr(11, 8)}
                            </td>
                            <td onClick={() => this.seekToTime(sub.start)}>
                              {sub.text}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </React.Fragment>
                </table>
              ) : (
                <p>{/* no content */}</p>
              )}
            </div>
            <div id="topics">
              {this.state.topics.length !== 0 ? (
                <table border="1">
                  {this.state.topics.map((topic, index) => {
                    return (
                      <React.Fragment key={index}>
                        <th>Topic {index + 1}</th>
                        <th>%</th>
                        {topic.map((topicData, index) => {
                          return (
                            <tbody id={index}>
                              <tr>
                                <td
                                  onClick={() =>
                                    this.setSearchParam(
                                      topicData.term.toString()
                                    )
                                  }
                                >
                                  {this.capitalize(topicData.term.toString())}
                                </td>
                                <td>
                                  {(topicData.probability * 100).toFixed(1)}
                                </td>
                              </tr>
                            </tbody>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </table>
              ) : (
                // No content
                <div>
                  {this.state.subtitleList.length == 0 ? (
                    <h2>Try Another Link</h2>
                  ) : (
                    <p></p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <p>Guide:</p>
          <p>
            Insert a link to a youtube video, use the search bar to search for
            terms if available. If no terms show up, please try another video
            link
          </p>
          <p>Works for videos with available English Subtitles/CC</p>
          <p>Example: https://youtu.be/OMDVTZ-ycaY</p>
          <p>Search words and timestamps are clickable</p>
        </div>
      </div>
    );
  }

  _onReady(event) {
    event.target.pauseVideo();
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.user,
});

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(YoutubePlayer);
