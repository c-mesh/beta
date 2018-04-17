import React from "react";
import ReactGA from 'react-ga';

class Analytics extends React.Component<RouteComponentProps<any>> {
    componentDidMount() {
    this.sendPageChange(this.props.location.pathname, this.props.location.search)
}

componentDidUpdate(prevProps: RouteComponentProps<any>) {
    console.log('Analytics componentDidUpdate ');
    if (this.props.location.pathname !== prevProps.location.pathname
      || this.props.location.search !== prevProps.location.search) {
      this.sendPageChange(this.props.location.pathname, this.props.location.search)
    }
  }

  sendPageChange(pathname: string, search: string = "") {
    const page = pathname + search
    console.log('Analytics sendPageChange: ' + page);
    ReactGA.set({page});
    ReactGA.pageview(page);
  }

  render() {
    return null
  }
}

export default Analytics;

