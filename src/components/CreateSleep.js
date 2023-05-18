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

const CreateSleep = ({params}) => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [isValid, setIsValid] = useState(false)
    const [viewC, setViewC] = useState({
        latitude: 55,
        longitude: 83,
        width: '300px',
        height: '300px',
        zoom: 7
    })
    const [view, setView] = useState({
        latitude: 55,
        longitude: 83,
        width: '300px',
        height: '300px',
        zoom: 7
    })
    const [levs] = useState(['Easy', 'Medium', 'Hard'])
    const [cats] = useState(['Event', 'Place'])
    const [regs] = useState(['Siberia', 'Moscow'])
    const [index, setIndex] = useState(0)
    const [imp, setImp] = useState({
        id: '',
        impression: '',
        category: '',
        dot: {lat: 0, long: 0},
        link: ''
    })
    const [daten, setDaten] = useState({
        title: '',
        level: '',
        region: '',
        cords: {},
        impressions: [], 
        dateUp: moment().format('DD.MM.YYYY'),
        time_start: '',
        total: 8
    })

    const {title, level, region, cords, impressions, dateUp, time_start, total} = daten
    const {id, impression, category, dot, link} = imp

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

    const createSleepM = gql`
        mutation createSleep($name: String!, $id: String!, $title: String!, $level: String!, $region: String!, $cords: Cords!, $impressions: [Impressions]!, $dateUp: String!, $time_start: String!, $total: Float!) {
            createSleep(name: $name, id: $id, title: $title, level: $level, region: $region, cords: $cords, impressions: $impressions, dateUp: $impressions, time_start: $time_start, total: $total)
        }
    `

    const [createSleep] = useMutation(createSleepM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.createSleep !== undefined) {
                console.log(result.data.createSleep)
            }
        }
    })

    useEffect(() => {
        if (category !== '') {
            let finden = cats.find(el => el.toLowerCase().includes(category.toLowerCase()) && el.length / 2 <= category.length)

            if (finden !== undefined) {
                setImp({...imp, category: finden})
            }
        } 
    }, [category])

    useEffect(() => {
        if (impression !== '' && id === '') {
            setImp({...imp, id: shortid.generate().toString()})
        } 
    }, [impression])

    useEffect(() => {
        if (index) {
            setDaten({...daten, dateUp: moment().subtract(index, 'days').format('DD.MM.YYYY')})
        } 
    }, [index])

    useEffect(() => {
        if (time_start.length === 2) {
            setDaten({...daten, time_start: time_start + ':'})
        } 
    }, [time_start])

    const setCords = (e, key) => {
        if (key === 'sleep') {
            setDaten({...daten, cords: {
                lat: e.lngLat[1],
                long: e.lngLat[0]
            }})
        } else {
            setImp({...imp, dot: {
                lat: e.lngLat[1],
                long: e.lngLat[0]
            }})
        }   
    }

    const onAddImp = () => {
        if (impressions.find(el => el.impression === impression) === undefined) {
            setDaten({...daten, impressions: [...impressions, imp]})
        }

        setImp({
            id: '',
            impression: '',
            category: '',
            dot: {lat: 0, long: 0},
            link: ''
        })
    }

    const onUpload = e => {
        let reader = new FileReader()

        reader.onload = ev => {
            setImp({...imp, link: ev.target.result})
        }

        reader.readAsDataURL(e.target.files[0])
    }

    const onCreate = () => {
        if (user !== null) {
            createSleep({
                variables: {
                    name: user.name, id: params.id, title, level, region, cords, impressions, dateUp, time_start, total
                }
            })
        }
    }

    return (
        <div className="con">
            <h3>Create Sleep</h3>
            <TextField value={title} onChange={e => setDaten({...daten, title: e.target.value})} placeholder='Enter title of sleep' />
            <Select onChange={e => setDaten({...daten, level: e.target.value})}>
                {levs.map(el => <option value={el}>{el}</option>)}
            </Select>
           
            <Button onClick={() => total > 5 && setDaten({...daten, total: total - 1})}>-</Button>
            <Typography>{total} hours</Typography>
            <Button onClick={() => total < 10 && setDaten({...daten, total: total + 1})}>+</Button>    
         
            <Select onChange={e => setDaten({...daten, region: e.target.value})}>
                {regs.map(el => <option value={el}>{el}</option>)}
            </Select>
            <ReactMapGL {...view} onDblClick={e => setCords(e, 'sleep')} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} />

            <h3>Set Date and Sleep's Start</h3>
            <Button onClick={() => index < 10 && setIndex(index + 1)}>Past</Button>
            <Typography>{dateUp}</Typography>
            <Button onClick={() => index > 1 && setIndex(index - 1)}>Future</Button>

            <h3>Add Impressions</h3>
            <TextField value={impression} onChange={e => setImp({...imp, impression: e.target.value})} placeholder='Enter title of impression' />
            <TextField value={category} onChange={e => setImp({...imp, category: e.target.value})} placeholder='Enter category of impression' />
            <ReactMapGL {...viewC} onDblClick={e => setCords(e, 'sleep')} mapboxApiAccessToken={token} onViewportChange={e => setViewC(e)} />
            <TextField onChange={onUpload} type='file' />
            <Button onClick={onAddImp}>Add</Button>

            <Button onClick={onCreate}>Create</Button>
        </div>
    );
}

export default CreateSleep