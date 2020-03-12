import React, { Component } from 'react';
import ErrorBoundary from './pages/exception/Error';
import { Provider } from 'mobx-react';
import BasicLayout from './components/layout/LayoutBasic';
import store from './store/index';
import 'antd/dist/antd.css';
import './assets/styles/basic.css';
import { BrowserRouter } from 'react-router-dom';



@ErrorBoundary("error")
class App extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <Provider {...store}>
                <BrowserRouter>
                    <BasicLayout />
                </BrowserRouter>
            </Provider>
        )
    }
}

export default App