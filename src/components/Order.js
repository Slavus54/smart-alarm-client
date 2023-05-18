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

const Order = ({params}) => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [view, setView] = useState({
        latitude: 55,
        longitude: 83,
        width: '800px',
        height: '350px',
        zoom: 7
    })
    const [levels] = useState([
        {
            title: 'Loudly and Short',
            borders: [100, 120],
            time: 7
        },
        {
            title: 'Usual and Long',
            borders: [80, 100],
            time: 20
        }
    ])
    const [order, setOrder] = useState(null)
    const [calls, setCalls] = useState([])
    const [timer, setTimer] = useState(0)
    const [daten, setDaten] = useState({
        id: '',
        call: '',
        sound_level: '',
        time_start: '00:00',
        cost: 0
    })

    const {id, call, sound_level, time_start, cost} = daten

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

    const getOrderM = gql`
        mutation getOrder($name: String!, $shortid: String!) {
            getOrder(name: $name, shortid: $shortid) {
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

    const updateOrderStatusM = gql`
        mutation updateOrderStatus($name: String!, $id: String!, $dateUp: String!) {
            updateOrderStatus(name: $name, id: $id, dateUp: $dateUp)
        }
    `

    const updateOrderCallsM = gql`
        mutation updateOrderCalls($name: String!, $id: String!, $calls: [Calls]!, $cost: Float!) {
            updateOrderCalls(name: $name, id: $id, calls: $calls, cost: $cost)
        }
    `

    const [getOrder] = useMutation(getOrderM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getOrder !== undefined) {
                console.log(result.data.getOrder)
                setOrder(result.data.getOrder)
                setCalls(result.data.getOrder.calls)
                setDaten({...daten, cost: result.data.getOrder.cost})
            }
        }
    })

    const [updateOrderStatus] = useMutation(updateOrderStatusM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.updateOrderStatus !== undefined) {
                console.log(result.data.updateOrderStatus)
            }
        }
    })

    const [updateOrderCalls] = useMutation(updateOrderCallsM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.updateOrderCalls !== undefined) {
                console.log(result.data.updateOrderCalls)
            }
        }
    })

    useEffect(() => {
        if (user !== null) {
            getOrder({
                variables: {
                    name: user.name, shortid: params.id
                }
            })
        }
    }, [user])

    useEffect(() => {
        if (timer > 0) {
            setDaten({...daten, time_start: `${parseInt(timer / 60)}:${parseInt(timer % 60)}`})
        } 
    }, [timer])

    useEffect(() => {
        if (time_start !== '') {
            let parts = time_start.split(':').map(el => parseInt(el))

            setTimer(parts[0] * 60 + parts[1])
        } 
    }, [time_start])

    const onSetTime = flag => {
        setTimer(eval(`${timer}${flag}${30}`))
    }

    const onUpdCall = () => {
        let result = []

        calls.map(el => {
            if (el.id === id) {
                result = [...result, {
                    id,
                    call,
                    sound_level,
                    time_start
                }]
            } else {
                result = [...result, el]
            }
        })

        setCalls(result)
    }
   
    const onUpdStatus = () => {
        if (user !== null) {
            updateOrderStatus({
                variables: {
                    name: user.name, id: params.id, dateUp: moment().format('DD.MM.YYYY')
                }
            })
        }
    }

    const onUpdAllCalls = () => {
        if (user !== null) {

        }
    }

    return (
        <div className="con">
            {user !== null && order !== null &&
                <>
                    <h4>{order.title}</h4>
                    <Typography>Amount: {order.cost}R</Typography>

                    {user.name === order.creator && order.isAccepted === false &&
                        <>
                            <h4>Update Calls</h4>
                            <div className='invs'>
                                {calls.map(el => (
                                    <Card className='inv' onClick={() => id === el.id ? setDaten({...daten, id: '', call: '', sound_level: '', time_start: '00:00'}) : setDaten({...daten, ...el})}>
                                        <CardContent>
                                            <Typography>{el.call}</Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <h4>Call Title: {call === '' ? '?' : call}</h4>
                            <Button onClick={() => onSetTime('-')}>-</Button>
                            <Typography>{time_start}</Typography>
                            <Button onClick={() => onSetTime('+')}>+</Button>
                            <Button onClick={onUpdCall}>Update Call</Button>
                            <Button onClick={onUpdAllCalls}>Update All</Button>
                        </>
                    }

                    {user.name === 'Slavus54' && 
                        <>
                            <h4>Admin Panel</h4>
                            <Button onClick={onUpdStatus}>{order.isAccepted === false ? 'Accept' : 'Cancel'} Delivery</Button>
                        </>
                    }
                </>
            }
        </div>
    );
}

export default Order