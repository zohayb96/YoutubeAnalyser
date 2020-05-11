import React from 'react';
import { connect } from 'react-redux';
import YoutubePlayer from './youtubePlayer';
// Main page of application, renders youtube player component when logged in

const Home = ({ isLoggedIn, username }) => {
  return (
    <React.Fragment>
      {isLoggedIn ? (
        <center>
          <div className="homeContainer">
            <div className="overlay-desc">
              <center>
                <YoutubePlayer />
              </center>
            </div>
          </div>
        </center>
      ) : (
        <center></center>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    isLoggedIn: !!state.user.id,
    username: state.user.username,
  };
};

export default connect(mapStateToProps, null)(Home);
