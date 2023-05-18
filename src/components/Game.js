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

const Game = ({params}) => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [view, setView] = useState({
        latitude: 55,
        longitude: 83,
        width: '300px',
        height: '300px',
        zoom: 7
    })
    const [panel] = useState([
        {
            title: 'North',
            lat: '+',
            long: ''
        },
        {
            title: 'South',
            lat: '-',
            long: ''
        },
        {
            title: 'East',
            lat: '',
            long: '+'
        },
        {
            title: 'West',
            lat: '',
            long: '-'
        }  
    ])
    const [levs] = useState([
        {
            title: 'Easy',
            points: 1.5
        }
    ])
    const [phases_order] = useState(['H1', 'H2', 'H3', 'H1', 'REM'])
    const [sleep, setSleep] = useState(null)
    const [cords, setCords] = useState(null)
    const [impression, setImpression] = useState(null)
    const [question, setQuestion] = useState(null)
    const [speed, setSpeed] = useState(10)
    const [totalTime, setTotalTime] = useState(0)
    const [phaseTime, setPhaseTime] = useState(0)
    const [repeats, setRepeats] = useState(0)
    const [wakeUp, setWakeUp] = useState(50)
    const [phase, setPhase] = useState('H1')

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

    const getSleepM = gql`
        mutation getSleep($name: String!, $shortid: String!) {
            getSleep(name: $name, shortid: $shortid) {
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

    const [getSleep] = useMutation(getSleepM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getSleep !== undefined) {
                console.log(result.data.getSleep)
                setSleep(result.data.getSleep)
                setCords(result.data.getSleep.cords)
            }
        }
    })

    useEffect(() => {
        if (user !== null) {
            getSleep({
                variables: {
                    name: user.name, shortid: params.id
                }
            })
        }
    }, [user])

    useEffect(() => {
        if (sleep !== null && cords !== null && phase === 'H1') {
            setRepeats(repeats + 1)
        }
    }, [phase])

    useEffect(() => {
        if (sleep !== null && cords !== null && phase === 'H1') {
            let syms = ['+', '-']
            let value = parseInt(Math.random() * (100 - wakeUp))
            
            let random_string = `${wakeUp}${syms[parseInt(Math.random() * syms.length)]}${value}`

            setWakeUp(eval(random_string) < 0 ? wakeUp : eval(random_string))
        }
    }, [cords])

    useEffect(() => {
        if (sleep !== null && cords !== null && impression !== null && phase === 'REM') {
            let filtered = sleep.impressions
            let rand = filtered[parseInt(filtered.length * Math.random())]
                
            if (rand !== undefined) {
                setImpression(rand)
            }
        }
    }, [phase])

    useEffect(() => {
        if (sleep !== null && cords !== null && impression !== null) {
            
            if (question === null) {
                let filtered = sleep.questions.filter(el => el.impression === impression.impression)
                let rand = filtered[parseInt(filtered.length * Math.random())]
                
                if (rand !== undefined) {
                    setQuestion(rand)
                }
            }
        }
    }, [cords])

    useEffect(() => {
        if (sleep !== null && cords !== null && impression === null) {
            let filtered = sleep.impressions.filter(el => {
                let distance = haversine(cords.lat, cords.long, el.dot.lat, el.dot.long)
                
                if (el.category === 'Place' && distance < 500) {
                    return true
                } else if (el.category !== 'Place') {
                    return true
                } else {
                    return false
                }               
            })
            let rand = filtered[parseInt(filtered.length * Math.random())]

            if (rand !== undefined) {
                setImpression(rand)
            }
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

    const convert = t => {
        return `${parseInt(t / 60)}:${parseInt(t % 60)}`
    }

    const onSetLocation = ({title, lat, long}) => {
        let newCords = {
            lat: lat === '' ? cords.lat : eval(`${cords.lat}${lat}${speed/10000}`),
            long: long === '' ? cords.long : eval(`${cords.long}${long}${speed/10000}`)
        }

        setCords(newCords)
        
        // check phase
        
        if (phaseTime < 50) {
            setPhaseTime(phaseTime + 5)
        } else { 
            let index = phases_order.indexOf(phase)

            if (index === phases_order.length - 1) {
                setPhase(phases_order[0])
            } else {
                setPhase(phases_order[index + 1])
            }

            setPhaseTime(0)
        }

        setTotalTime(totalTime + 5)
    }   

    const onChooseAnswer = answer => {
        if (question.answer === answer) {
            let points = levs.find(el => el.title === question.level)?.points

            if (wakeUp > 20) {
                setWakeUp(wakeUp - points)
            }
        }

        setQuestion(null)
    }

    return (
        <div className="con">
            {user !== null && sleep !== null && cords !== null &&
                <>
                    <h3>{sleep.title} Sleep</h3>
                    <h4>WakeUp Chance: {wakeUp}%</h4>
                    <Typography>Current Phase: {phase} ({repeats} circles)</Typography>
                    <Typography>Current Phase Time: {convert(phaseTime)}</Typography>
                    <Typography>Total Time: {convert(totalTime)}</Typography>
                    <div className='invs'>
                        {panel.map(el => (
                            <Card className='inv' onClick={() => onSetLocation(el)}>
                                <CardContent>
                                    <Typography>{el.title}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Typography>{speed} km/h</Typography>
                    <input value={speed} onChange={e => setSpeed(parseInt(e.target.value))} placeholder='Enter speed' type='range' step={5} />
                    <ReactMapGL {...view} mapboxApiAccessToken={token} onViewportChange={e => setView(e)}>
                        {sleep.impressions.filter(el => el.category === 'Place').map(el => (
                            <Marker latitude={el.dot.lat} longitude={el.dot.long}>
                                <div className='con'>
                                    <b>{el.impression}</b>
                                </div>
                            </Marker>
                        ))}
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <div className='con'>
                                <b>{user.name}</b>
                            </div>
                        </Marker>
                    </ReactMapGL>
                    {impression !== null &&
                        <>
                            <h4>{impression.impression}</h4>
                            {question !== null &&
                                <>
                                    <h4>{question.question}</h4>
                                    <div className='invs'>
                                        {question.choices.map(el => (
                                            <Card className='inv' onClick={() => onChooseAnswer(el)}>
                                                <CardContent>
                                                    <Typography>{el}</Typography>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            }
                        </>
                    }
                </>
            }
        </div>
    );
}

export default Game