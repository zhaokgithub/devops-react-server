import React, { Component } from "react";
import { Layout, Menu, Breadcrumb, Icon } from 'antd';
import { Link } from 'react-router-dom';

function LayoutMenu(props) {
    let key = location.pathname
    return (
        <div>
            <div className="layout-sider-logo" />
            <Menu theme="dark" defaultSelectedKeys={[key]}>
                <Menu.Item key="/" style={{margin:0}}>
                    <Link to='/' >
                        <Icon type="home" />
                        <span >首页</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="/personal" style={{margin:0}}>
                    <Link to='/personal' >
                        <Icon type="user" />
                        <span >个人中心</span>
                    </Link>
                </Menu.Item>
            </Menu>
        </div>

    )
}

export default LayoutMenu