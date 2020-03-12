import React, { Component } from 'react';
import LayoutHeader from './LayoutHeader';
import LayoutMenu from './LayoutMenu';
import LayoutContent from './LayoutContent';
import { Layout, Breadcrumb } from 'antd';
import { Route } from 'react-router-dom';
const { Sider, Content } = Layout;


class LayoutBasic extends Component {
    componentDidMount() {

    }
    render() {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider>
                    <LayoutMenu></LayoutMenu>
                </Sider>
                <Layout>
                    <LayoutHeader />
                    <Content style={{ padding: 20 }}>
                        <Breadcrumb>
                            <Breadcrumb.Item>首页</Breadcrumb.Item>
                        </Breadcrumb>
                        <LayoutContent />
                    </Content>
                </Layout>
            </Layout>
        )
    }
}

export default LayoutBasic