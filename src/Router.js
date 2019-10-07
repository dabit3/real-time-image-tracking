import React from 'react'
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import Nav from './Nav'
import Detect from './Detect'
import Results from './Results'
import { ContextProviderComponent } from './appContext'

export default function Router() {
  return (
    <ContextProviderComponent>
      <div>
        <BrowserRouter>
          <Nav />
          <Switch>
            <Route path="/detect" component={Detect} />
            <Route path="/results" component={Results} />
            <Route component={Detect} />
          </Switch>
        </BrowserRouter>
      </div>
    </ContextProviderComponent>
  )
}