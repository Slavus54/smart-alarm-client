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

const Sleeps = () => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [view, setView] = useState({
        latitude: 55,
        longitude: 83,
        width: '800px',
        height: '350px',
        zoom: 7
    })
    const [sleeps, setSleeps] = useState(null)

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

    const getSleepsM = gql`
        mutation getSleeps($name: String!) {
            getSleeps(name: $name) {
                shortid
                creator
                title
                level
                region
                cords {
                    lat
                    long
                }
                impressions {
                    id
                    impression
                    category
                    dot {
                        lat
                        long
                    }
                    link
                }
                dateUp
                time_start
                total
                rating {
                    name
                    rates {
                        criterion
                        rate
                    }
                    review
                }
                questions {
                    id
                    question
                    impression
                    level
                    choices
                    answer
                }
            }
        }
    `

    const [getSleeps] = useMutation(getSleepsM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getSleeps !== undefined) {
                console.log(result.data.getSleeps)
                setSleeps(result.data.getSleeps)
            }
        }
    })

    useEffect(() => {
        if (user !== null) {
            getSleeps({
                variables: {
                    name: user.name
                }
            })
        }
    }, [user])

    return (
        <div className="con">
            {user !== null && sleeps !== null &&
                <>
                    <h4>Sleeps</h4>
                    <ReactMapGL {...view} mapboxApiAccessToken={token} onViewportChange={e => setView(e)}>
                        {sleeps.map(el => (
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <div className='con' onClick={() => setLoc(`/sleep/${el.id}`)}>
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

export default Sleeps