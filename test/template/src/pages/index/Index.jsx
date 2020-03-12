import React, { Component } from 'react';
import Api from 'service/api';
import './index.less'

class Index extends Component {

    componentDidMount() {
        this.queryUserInfo()
    }
    queryUserInfo = async function () {
        let res = await Api.getUserInfo()
    }
    render() {
        return (<div className="test">Index</div>)
    }
}

export default Index