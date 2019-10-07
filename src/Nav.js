/** @jsx jsx */

import React from 'react'
import { css, jsx } from '@emotion/core'
import {Link } from "react-router-dom";

class Nav extends React.Component {
  render() {
    return (
      <div>
        <div>
          <p css={mrRekognizer}>REKOGNIZER</p>
        </div>
        <div css={navContainer}>
          <Link to='/detect' css={navItem}>
            <p>Detect</p>
          </Link>
          <Link to='/results' css={navItem}>
            <p>Results</p>
          </Link>
        </div>
      </div>
    )
  }
}

const mrRekognizer = css`
  font-size: 36px;
  margin-bottom: 10px;
  margin-top: 25px;
`

const navItem = css`
  margin-right: 20px;
  cursor: pointer;
  text-decoration: none;
  color: white;
  &:hover {
    opacity: .8;
  }
  & p {
    color: white;
  }
`

const navContainer = css`
  display: flex;
`

export default Nav