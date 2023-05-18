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

const Register = () => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [isValid, setIsValid] = useState(false)
    const [genders] = useState(['Male', 'Female'])
    const [view, setView] = useState({
        latitude: 55,
        longitude: 83,
        width: '300px',
        height: '300px',
        zoom: 7
    })
    const [daten, setDaten] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        sex: '',
        location: {lat: 0, long: 0}
    })

    const {name, email, password, age, sex, location} = daten

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

    const registerM = gql`
        mutation register($name: String!, $email: String!, $password: String!, $age: Float!, $sex: String!, $location: Cords!) {
            register(name: $name, email: $email, password: $password, age: $age, sex: $sex, location: $location) {
                name
                collectionId
            }
        }
    `

    const [register] = useMutation(registerM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.register !== undefined) {
                console.log(result.data.register)

                let instance = new CookieWorker('web3-client')
                instance.save(result.data.register, 1200)
                
                window.location.href = ''
                window.location.reload()
            }
        }
    })

    useEffect(() => {
        if (typeof age === 'number') {
            setIsValid(true)
        } else {
            setIsValid(false)
        }
    }, [age])

    const setCords = e => {
        setDaten({...daten, location: {
            lat: e.lngLat[1],
            long: e.lngLat[0]
        }})
    }

    const onRegister = () => {
        register({
            variables: {
                name, email, password, age, sex, location
            }
        })
    }

    return (
        <div className="con">
            <h3>Register to Platform</h3>
            <Typography>(Personal Data)</Typography>
            <TextField value={name} onChange={e => setDaten({...daten, name: e.target.value})} placeholder='Enter your name' />
            <TextField value={age} onChange={e => setDaten({...daten, age: parseInt(e.target.value)})} placeholder='Enter your age' />
            <Select onChange={e => setDaten({...daten, sex: e.target.value})}>
                {genders.map(el => <option value={el}>{el}</option>)}
            </Select>
            <Typography>(Profile Data)</Typography>
            <TextField value={email} onChange={e => setDaten({...daten, email: e.target.value})} placeholder='Enter your email' />
            <TextField value={password} onChange={e => setDaten({...daten, password: e.target.value})} placeholder='Enter your password' />
     
            <ReactMapGL {...view} onDblClick={setCords} mapboxApiAccessToken={token} onViewportChange={e => setView(e)} />
            {isValid && <Button onClick={onRegister}>Register</Button>}
        </div>
    );
}

export default Register