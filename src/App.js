/** @jsx jsx */

import React from 'react';
import logo from './logo.svg';
import './App.css';
import Router from './Router'
import { Global, css, jsx } from '@emotion/core'
import { withAuthenticator } from 'aws-amplify-react'

function App() {
  return (
    <>
      <Global
        styles={globalCss}
      />
      <div css={appContainer}>
        <Router />
      </div>
    </>
  );
}

const appContainer = css`
  width: 900px;
  margin: 0 auto;
`

const globalCss = css`
  * {
    box-sizing: border-box;
    color: #d73132;
    font-family: 'Mr Robot';
  }
  body {
    background-color: #1c2b34;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    border: 10px solid #d73132;
    padding: 20px;
  }
`

export default withAuthenticator(App);
