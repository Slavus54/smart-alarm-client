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

const CreateOrder = ({params}) => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [isValid, setIsValid] = useState(false)
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
    const [cats] = useState(['Bussiness', 'Vocation'])
    const [regs] = useState([
        {
            title: 'Western Siberia',
            cords: {
                lat: 54.98,
                long: 82.9
            }
        }
    ])
    const [rgb, setRGB] = useState('')
    const [office, setOffice] = useState(null)
    const [item, setItem] = useState({
        id: '',
        call: '',
        sound_level: '',
        time_start: ''
    })
    const [daten, setDaten] = useState({
        title: '',
        category: '',
        color: '',
        calls: [],
        cost: 500,
        region: '',
        cords: {
            lat: 0,
            long: 0
        },
        tel: '',
        card: '',
        distance: 0
    })

    const {title, category, color, calls, cost, region, cords, tel, card, distance} = daten
    const {id, call, sound_level, time_start} = item

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

    const createOrderM = gql`
        mutation createOrder($name: String!, $id: String!, $title: String!, $category: String!, $color: String!, $calls: [Calls]!, $cost: Float!, $region: String!, $cords: Cords!, $tel: String!, $card: String!) {
            createOrder(name: $name, id: $id, title: $title, category: $category, color: $color, calls: $calls, cost: $cost, region: $region, cords: $cords, tel: $tel, card: $card)
        }
    `

    const [createOrder] = useMutation(createOrderM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.createOrder !== undefined) {
                console.log(result.data.createOrder)
            }
        }
    })

    useEffect(() => {
        if (category !== '') {
            let finden = cats.find(el => el.toLowerCase().includes(category.toLowerCase()) && el.length / 2 <= category.length)

            if (finden !== undefined) {
                setDaten({...daten, category: finden})
            }
        } 
    }, [category])

    useEffect(() => {
        if (call !== '' && id === '') {
            setItem({...item, id: shortid.generate().toString()})
        } 
    }, [call])

    useEffect(() => {
        if (time_start.length === 2) {
            setItem({...item, time_start: time_start + ':'})
        } 
    }, [time_start])

    useEffect(() => {
        if (color !== '') {
            let r_value = parseInt(color.substr(1, 2), 16)
            let g_value = parseInt(color.substr(3, 2), 16)
            let b_value = parseInt(color.substr(5, 2), 16)

            setRGB(`${r_value}-${g_value}-${b_value}`)
        } 
    }, [color])

    useEffect(() => {
        if (office !== null) {
            let dist = parseInt(haversine(cords.lat, cords.long, office.cords.lat, office.cords.long) * 1000)

            setDaten({...daten, distance: dist})
        } 
    }, [cords])

    const haversine = (lat1, long1, lat2, long2) => {
        let r = 6371

        let latDiff = Math.PI * (lat2 - lat1) / 180
        let longDiff = Math.PI * (long2 - long1) / 180

        let sin = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) + Math.cos(Math.PI * lat1 / 180) * Math.cos(Math.PI * lat2 / 180) * Math.sin(longDiff / 2) * Math.sin(longDiff / 2)
        let a = 2 * Math.atan2(Math.sqrt(sin), Math.sqrt(1 - sin))

        return a * r
    }

    const setCords = e => {
        setDaten({...daten, cords: {
            lat: e.lngLat[1],
            long: e.lngLat[0]
        }})
    }

    const onSetLocation = region_item => {
        setOffice(region_item)
        setDaten({...daten, region: region_item.title})
    }

    const onAddCall= () => {
        setDaten({...daten, calls: [...calls, item], cost: 500 + (calls.length + 1) * 100})

        setItem({
            id: '',
            call: '',
            sound_level: '',
            time_start: ''
        })
    }

    const onCreate = () => {
        if (user !== null) {
            createOrder({
                variables: {
                    name: user.name, id: params.id, title, category, color, calls, cost, region, cords, tel, card
                }
            })
        }
    }

    return (
        <div className="con">
            <h3>Create Smart Alarm Order</h3>
            <TextField value={title} onChange={e => setDaten({...daten, title: e.target.value})} placeholder='Enter title of alarm' />
            <TextField value={category} onChange={e => setDaten({...daten, category: e.target.value})} placeholder='Enter category of alarm' />
        
            <h3>Add Calls</h3>
            <TextField value={call} onChange={e => setItem({...item, call: e.target.value})} placeholder='Enter title of call' />
            <div className='invs'>
                {levels.map((el, idx) => (
                    <Card key={idx} className='inv' onClick={() => setItem({...item, sound_level: el.title})}>
                        <CardContent>
                            <Typography>{el.title} ({el.borders[0]} - {el.borders[1]}db)</Typography>
                            <Typography>{el.time} seconds</Typography>
                            <Typography>{el.title === sound_level ? 'Selected' : ''}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </div>  
            <TextField value={time_start} onChange={e => time_start.length < 5 && setItem({...item, time_start: e.target.value})} placeholder='Enter start time' />
            <Button onClick={onAddCall}>Add</Button>

            <Typography>Color code: {color}</Typography>
            <Typography>RGB: {rgb}</Typography>
            <input value={color} onChange={e => setDaten({...daten, color: e.target.value})} type='color' />
       
            <h3>Enter location</h3>
            <Select onChange={e => onSetLocation(e.target.value)}>
                {regs.map(el => <option value={el}>{el.title}</option>)}
            </Select>
            <ReactMapGL {...view} onDblClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)}>
                <Marker latitude={cords.lat} longitude={cords.long}>
                    <div className='con'>       
                        <b>You</b>
                    </div>  
                </Marker>
                {office !== null &&
                    <Marker latitude={office.cords.lat} longitude={office.cords.long}>
                        <div className='con'>       
                            <b>Office</b>
                        </div>  
                    </Marker>
                }
            </ReactMapGL>

            <Typography>Distance from  Office {distance}m</Typography>
            <Typography>Total: {cost}R</Typography>

            <h3>Enter Payment Info</h3>

            <TextField value={tel} onChange={e => tel.length < 11 && setDaten({...daten, tel: e.target.value})} placeholder='Enter your tel' />
            <TextField value={card} onChange={e => card.length < 16 && setDaten({...daten, card: e.target.value})} placeholder='Enter your card number' />

            <Button onClick={onCreate}>Create</Button>
        </div>
    );
}

export default CreateOrder