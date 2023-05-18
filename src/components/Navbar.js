import React, {useState, useEffect, useContext, useMemo} from 'react';
import {useMutation} from '@apollo/react-hooks'
import gql from 'graphql-tag'
import {useLocation, Route, Link} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {Button} from 'uikit-react'
import {TextField, Typography, TextareaAutosize, Select, Checkbox, Card, CardContent, CardActionArea} from '@material-ui/core'
import {CookieWorker} from '../libs/CookieWorker'
import Home from './Home'
import Register from './Register'
import Login from './Login'
import CreateOrder from './CreateOrder'
import Orders from './Orders'
import Order from './Order'
import CreateSleep from './CreateSleep'
import Sleeps from './Sleeps'
import Sleep from './Sleep'

const Navbar = () => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [routes] = useState([
        {
            label: 'Home',
            position: '*',
            url: '/'
        },
        {
            label: 'Register',
            position: '-',
            url: '/register'
        },
        {
            label: 'Login',
            position: '-',
            url: '/login'
        },
        {
            label: 'orders',
            position: '+',
            url: '/orders'
        },
        {
            label: 'sleeps',
            position: '+',
            url: '/sleeps'
        },
    ])

    useEffect(() => {
        let instance = new CookieWorker('web3-client')

        let data = instance.gain()

        if (data === null) {
            instance.save(null, 10)
        } else {
            setUser(data)
        }
    }, [])

    const filteredRoutes = () => {
        
        if (user === null) {
            return routes.filter(el => el.position !== '+')
        } else {
            return routes.filter(el => el.position !== '-')
        }
    }

    return (
        <div className="con">
                   
            <div className='invs'>
                {filteredRoutes().map(el => (
                    <Card className='inv' onClick={() => setLoc(el.url)}>
                        <CardContent>
                            <Typography>{el.label}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Route component={Home} path="/" />
            <Route component={Register} path="/register" />
            <Route component={Login} path="/login" />
            <Route component={CreateOrder} path="/create-order/:id" />
            <Route component={Orders} path="/orders" />
            <Route component={Order} path="/order/:id" />
            <Route component={CreateSleep} path="/create-sleep/:id" />
            <Route component={Sleeps} path="/sleeps" />
            <Route component={Sleep} path="/sleep/:id" />
        </div>
    );
}

export default Navbar