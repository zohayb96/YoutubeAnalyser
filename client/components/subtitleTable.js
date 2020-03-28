import React, { Component } from 'react'
import { connect } from 'react-redux'

class SubtitleTable extends Component {
  componentDidMount() {

  }
  render() {
    const rows = this.props.subtitleData
    const start = rows.start
    const end = rows.end
    const subText = rows.text
    return (
      <tr>
        <td><a href="https://www.w3schools.com/html/">
          {new Date(start * 1000).toISOString().substr(11, 8)}</a>
        </td>
        <td><a href="https://www.w3schools.com/html/">
          {new Date(end * 1000).toISOString().substr(11, 8)}</a>
        </td>
        <td>{subText}</td>
      </tr>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}
const mapDispatchToProps = (dispatch, ownProps) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(SubtitleTable)
