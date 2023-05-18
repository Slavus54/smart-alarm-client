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

const Login = () => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [key, setKey] = useState('password')
    const [keys] = useState(['password', 'collection ID'])
    const [view, setView] = useState({
        latitude: 55,
        longitude: 83,
        width: '300px',
        height: '300px',
        zoom: 7
    })
    const [daten, setDaten] = useState({
        name: '',
        password: '',
        collectionId: ''
    })

    const {name, password, collectionId} = daten

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

    const loginM = gql`
        mutation login($name: String!, $password: String!, $collectionId: String!, $key: String!) {
            login(name: $name, password: $password, collectionId: $collectionId, key: $key) {
                name
                collectionId
            }
        }
    `

    const [login] = useMutation(loginM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.login !== undefined) {
                console.log(result.data.login)

                let instance = new CookieWorker('web3-client')
                instance.save(result.data.login, 720)
                
                window.location.reload()
                window.location.href = ''
                
            }
        }
    })


    const onLogin = () => {
        login({
            variables: {
                name, password, collectionId, key
            }
        })
    }

    return (
        <div className="con">
            <h3>Login to Platform</h3>
            <TextField value={name} onChange={e => setDaten({...daten, name: e.target.value})} placeholder='Enter your name' />
            <Select value={key} onChange={e => setKey(e.target.value)}>
                {keys.map(el => <option value={el}>{el}</option>)}
            </Select>
            {key === 'password' ?
                    <TextField value={password} onChange={e => setDaten({...daten, password: e.target.value})} placeholder='Enter your password' />
                :
                    <TextField value={collectionId} onChange={e => collectionId.length < 9 && setDaten({...daten, collectionId: e.target.value})} placeholder='Enter collection ID' />
            }

            <Button onClick={onLogin}>Login</Button>
        </div>
    );
}

export default Login