import React, {useState, useEffect, useContext, useMemo} from 'react';
import {useMutation} from '@apollo/react-hooks'
import gql from 'graphql-tag'
import shortid from 'shortid'
import moment from 'moment'
import {useLocation} from 'wouter'
import ReactMapGL, {Marker} from 'react-map-gl'
import {Button} from 'uikit-react'
import {TextField, Typography, TextareaAutosize, Select, Checkbox, Card, CardContent, CardActionArea} from '@material-ui/core'
import {CookieWorker} from '../libs/CookieWorker'

const Orders = () => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [view, setView] = useState({
        latitude: 55,
        longitude: 83,
        width: '800px',
        height: '350px',
        zoom: 7
    })
    const [orders, setOrders] = useState(null)

    const token = 'pk.eyJ1Ijoic2xhdnVzNTQiLCJhIjoiY2toYTAwYzdzMWF1dzJwbnptbGRiYmJqNyJ9.HzjnJX8t13sCZuVe2PiixA'

    useEffect(() => {
        let instance = new CookieWorker('web3-client')

        let data = instance.gain()

        if (data === null) {
            instance.save(null, 10)
        } else {
            setUser(data)
        }
    }, [])

    const getOrdersM = gql`
        mutation getOrders($name: String!) {
            getOrders(name: $name) {
                shortid
                creator
                title
                category
                color
                calls {
                    id
                    call
                    sound_level
                    time_start
                }
                cost
                region
                cords {
                    lat
                    long
                }
                tel
                card
                isAccepted
                dateUp
            }
        }
    `

    const [getOrders] = useMutation(getOrdersM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getOrders !== undefined) {
                console.log(result.data.getOrders)
                setOrders(result.data.getOrders)
            }
        }
    })

    useEffect(() => {
        if (user !== null) {
            getOrders({
                variables: {
                    name: user.name
                }
            })
        }
    }, [user])

    return (
        <div className="con">
            {user !== null && orders !== null &&
                <>
                    <h4>Orders</h4>
                    <ReactMapGL {...view} mapboxApiAccessToken={token} onViewportChange={e => setView(e)}>
                        {orders.map(el => (
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <div className='con' onClick={() => setLoc(`/order/${el.shortid}`)}>
                                    <b>{el.title}</b>
                                </div>
                            </Marker>
                        ))}
                    </ReactMapGL>
                </>
            }
        </div>
    );
}

export default Orders