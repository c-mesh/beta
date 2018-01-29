import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import Main from './components/Main.jsx';
import history from './history.js';

if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    render((
        <Router history={history}>
            <Main />
        </Router>),
        document.getElementById('app'));
} else {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host;
    window.location.href = baseUrl + "/web";
}

