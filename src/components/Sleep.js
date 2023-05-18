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

const Sleep = ({params}) => {
    const [loc, setLoc] = useLocation('')
    const [user, setUser] = useState(null)
    const [view, setView] = useState({
        latitude: 55,
        longitude: 83,
        width: '300px',
        height: '300px',
        zoom: 7
    })
    const [sleep, setSleep] = useState(null)
    const [imp, setImp] = useState(null)
    const [quest, setQuest] = useState(null)
    const [choice, setChoice] = useState(null)
    const [levs] = useState([
        {
            title: 'Easy',
            points: 1.5
        }
    ])
    const [crits] = useState(['Truth'])
    const [rat, setRat] = useState({
        criterion: '',
        rate: 5
    })
    const [daten, setDaten] = useState({
        rates: [],
        review: '',
        question: '',
        level: '',
        choices: [],
        answer: '',
        link: ''
    })

    const {question, level, choices, answer, link} = daten

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

    const rateSleepM = gql`
        mutation rateSleep($name: String!, $id: String!, $rates: [Rates]!, $review: String!)  {
            rateSleep(name: $name, id: $id, rates: $rates, review: $review) 
        }
    `

    const manageSleepQuestionM = gql`
        mutation manageSleepQuestion($name: String!, $id: String!, $option: String!, $question: String!, $impression: String!, $level: String!, $choices: [String]!, $answer: String!, $collectionId: String!)  {
            manageSleepQuestion(name: $name, id: $id, option: $option, question: $question, impression: $impression, level: $level, choices: $choices, answer: $answer, collectionId: $collectionId) 
        }
    `

    const updateSleepImpressionM = gql`
        mutation updateSleepImpression($name: String!, $id: String!, $collectionId: String!, $link: String!)  {
            updateSleepImpression(name: $name, id: $id, collectionId: $collectionId, link: $link) 
        }
    `

    const [getSleep] = useMutation(getSleepM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.getSleep !== undefined) {
                console.log(result.data.getSleep)
                setSleep(result.data.getSleep)
            }
        }
    })

    const [rateSleep] = useMutation(rateSleepM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.rateSleep !== undefined) {
                console.log(result.data.rateSleep)
            }
        }
    })

    const [manageSleepQuestion] = useMutation(manageSleepQuestionM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.manageSleepQuestion !== undefined) {
                console.log(result.data.manageSleepQuestion)
            }
        }
    })

    const [updateSleepImpression] = useMutation(updateSleepImpressionM, {
        optimisticResponse: true,
        update(proxy, result) {
            if (result.data.updateSleepImpression !== undefined) {
                console.log(result.data.updateSleepImpression)
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
        if (imp !== null) {
            setDaten({...daten, choices: [], answer: ''})
        }
    }, [imp])


    const onUpload = e => {
        let reader = new FileReader()

        reader.onload = ev => {
            setDaten({...daten, link: ev.target.result})
        }

        reader.readAsDataURL(e.target.files[0])
    }

    const onAddCrit = () => {
        setDaten({...daten, rates: [...rates, rat]})
        
        setRat({
            criterion: '',
            rate: 5
        })
    }

    const onAddCh = () => {
        if (choices.find(el => el === choice) === undefined) {
            setDaten({...daten, choices: [...choices, choice]})
        }

        setChoice('')
    }

    const onEst = () => {
        if (user !== null) {
            rateSleep({
                variables: {
                    name: user.name, id: params.id, rates, review
                }
            })
        }
    }

    const onUpdateImp = () => {
        if (user !== null) {
            updateSleepImpression({
                variables: {
                    name: user.name, id: params.id, collectionId: imp.id, link
                }
            })
        }
    }

    const onManageQuest = option => {
        if (user !== null) {
            manageSleepQuestion({
                variables: {
                    name: user.name, id: params.id, option, question, impression: imp.impression, level, choices, answer, collectionId: option === 'add' ? '' : quest.id
                }
            })
        }
    }

    return (
        <div className="con">
            {user !== null && sleep !== null &&
                <>
                    <h3>{sleep.title}</h3>

                    {user.name === sleep.creator ?
                        <>
                            <h4>Impressions</h4>
                            <div className='invs'>
                                {sleep.impressions.map(el => (
                                    <Card className='inv' onClick={() => setImp(el)}>
                                        <CardContent>
                                            <Typography>{el.impression}</Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {imp !== null &&
                                <>
                                    <h4>Add {imp.impression}'s Question</h4>
                                    <TextField value={question} onChange={e => setDaten({...daten, question: e.target.value})} placeholder='Enter title of question' />
                                    <Typography>Add Choices of Answer</Typography>
                                    <TextField value={choice} onChange={e => setChoice(e.target.value)} placeholder='Enter choice' />
                                    <Button onClick={onAddCh}>Add Choice</Button>
                                    <Select onChange={e => setDaten({...daten, level: e.target.value})}>
                                        {levs.map(el => el.title).map(el => <option value={el}>{el}</option>)}
                                    </Select>
                                    <div className='invs'>
                                        {choices.map(el => (
                                            <Card className='inv' onClick={() => setDaten({...daten, answer: el})}>
                                                <CardContent>
                                                    <Typography>{el}</Typography>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    {answer !== '' && <Button onClick={() => onManageQuest('add')}>Add Question</Button>}

                                    <h4>Update</h4>
                                    <TextField onChange={onUpload} type='file' />
                                    <Button onClick={onUpdateImp}>Update</Button>
                                </>
                            }
                        </>
                        :
                        <Button onClick={() => setLoc(`/sleeping-game/${sleep.shortid}`)}>Game</Button>
                    }

                    {user.name !== sleep.creator && sleep.rating.find(el => el.name === user.name) === undefined &&
                        <>
                            <h4>Estimate</h4>
                            <div className='invs'>
                                {crits.filter(e => rates.find(el => el.criterion === e) === undefined).map(el => (
                                    <Card className='inv' onClick={() => setRat({...rat, criterion: el})}>
                                        <CardContent>
                                            <Typography>{el}</Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <Button onClick={() => rate > 1 && setRat({...rat, rate: rate - 1})}>-</Button>
                            <Typography>{rate}/10</Typography>
                            <Button onClick={() => rate < 10 && setRat({...rat, rate: rate + 1})}>+</Button>
                            <Button onClick={onAddCrit}>Add Criterion</Button>
                            <TextareaAutosize value={review} onChange={e => setDaten({...daten, review: e.target.value})} placeholder='Enter your review' minRows={3} />
                            <Button onClick={onEst}>Estimate</Button>
                        </>
                    }

                    <h4>Questions</h4>
                    <div className='invs'>
                        {sleep.questions.map(el => (
                            <Card className='inv' onClick={() => setQuest(el)}>
                                <CardContent>
                                    <Typography>{el.question}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {quest !== null &&
                        <>
                            <h4>{quest.question}</h4>
                            {user.name === sleep.creator && <Button onClick={() => onManageQuest('delete')}>Delete</Button>}
                        </>
                    }
                </>
            }
        </div>
    );
}

export default Sleep