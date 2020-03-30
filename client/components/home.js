import React from 'react'
import { connect } from 'react-redux'
import YoutubePlayer from './youtubePlayer'
import SubtitleTable from './subtitleTable'

const Home = ({ isLoggedIn, email }) => {
  return (
    <React.Fragment>
      {isLoggedIn ? (
        <center>
          <div className="homeContainer">
            <div className="overlay-desc">
              <center>
                <p>Welcome {email}</p>
                <YoutubePlayer />
              </center>
            </div>
          </div>
        </center>
      ) : (
          <center>
          </center>
        )}
    </React.Fragment>
  )
}

const mapStateToProps = state => {
  return {
    isLoggedIn: !!state.user.id,
    email: state.user.email
  }
}

export default connect(mapStateToProps, null)(Home)
