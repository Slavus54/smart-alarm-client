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

const Home = () => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [colls] = useState(['order', 'sleep'])

    useEffect(() => {
        let instance = new CookieWorker('web3-client')

        let data = instance.gain()

        if (data === null) {
            instance.save(null, 10)
        } else {
            setUser(data)
        }
    }, [])

    const onUpload = e => {
        let reader = new FileReader()

        reader.onload = ev => {
            setDaten({...daten, text: ev.target.result})
        }

        reader.readAsDataURL(e.target.files[0])
    }

    const onLogOut = () => {
        let instance = new CookieWorker('web3-client')
        instance.save(null, 20)

        window.location.href = ''
        window.location.reload()
    }

    return (
        <div className="con">
            <h3>Welcome to Platform</h3>
            {user !== null && 
                <>
                    <h4>Collections to Create</h4>
                    <div className='invs'>
                        {colls.map(el => (
                            <Card className='inv' onClick={() => setLoc(`/create-${el}/${user.collectionId}`)}>
                                <CardContent>
                                    <Typography>{el}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Button onClick={onLogOut}>Log Out</Button>
                </>
            }
        </div>
    );
}

export default Home