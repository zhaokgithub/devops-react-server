import React, { Component } from 'react';
import Api from '../../service/api';

class Index extends Component {

    componentDidMount() {
        console.log(this.props)
        this.queryUserInfo()
    }
    queryUserInfo = async function () {
        let res = await Api.getUserInfo()
    }
    render() {
        return (<div>personal</div>)
    }
}

export default Index