import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    TabContent, TabPane, Nav, NavItem, NavLink,
    Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import { Lock } from 'react-feather'
import $ from "jquery"
import AppCollapse from '@components/app-collapse'
import Axios from '../../utility/hooks/Axios'
import HeaderCmp from '../Header'
import Spinner from "@components/spinner/Fallback-spinner"
import BetSlipCmp from './betslip'
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'
import { Odd } from './sportsComponent'

const EventChildren = () => {
    const { id } = useParams()
    const [sportsData, setSportsData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [eventData, setEventData] = useState([])
    const [timerNumber, setTimerNumber] = useState(30)
    const dispatch = useDispatch()
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const [getTextByLanguage] = useTranslator()
    const [oddType, setOddType] = useState("odds")

    const handleBetSlip = (data, event, market) => {
        if (data.Status === 1) {
            if (Object.keys(betSlipData).length <= 5) {
                const result = {
                    HomeTeam: event.HomeTeam,
                    AwayTeam: event.AwayTeam,
                    LeagueName: event.LeagueName,
                    SportName: event.SportName,
                    odds: data.Price,
                    HomeTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[0] : "-",
                    AwayTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[1] : "-",
                    name: data.Name,
                    live: !event.IsPreMatch,
                    id: data.Id,
                    eventId: id,
                    leagueId: event.LeagueId,
                    marketId: market.Id,
                    IsPreMatch: event.IsPreMatch
                }
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.Id}`).addClass("active")
                } else {
                    $(`#${data.Id}`).removeClass("active")
                }
            }
        }
    }

    const handleChangeSlipData = async (data) => {
        const markets = data.Markets
        for (const l in markets) {
            for (const k in betSlipData) {
                if (markets[l].Id === betSlipData[k].marketId) {
                    for (const m in markets[l].Bets) {
                        if (markets[l].Bets[m].Id === Number(k)) {
                            console.log(markets[l].Bets[m])
                            if (Number(markets[l].Bets[m].Price) !== Number(betSlipData[k].odds)) {
                                const newData = betSlipData[k]
                                newData.odds = markets[l].Bets[m].Price
                                dispatch(changeOdds(betSlipData, newData))
                            }
                        }
                    }
                }
            }
        }
    }

    const handleRefresh = async () => {
        console.log("handleRefresh")
        setIsLoading(true)
        const request = {
            eventId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-event",
            method: "POST",
            params: request
        })
        if (response.status === 200 && response.data) {
            setSportsData(response.data)
            handleChangeSlipData(response.data)
            const leagueData = response.data
            const results = []
            if (response.data.Markets) {
                const markets = response.data.Markets
                for (const i in markets) {
                    if (markets[i]) {
                        const obj = {
                            title: getTextByLanguage(markets[i].Name)
                        }
                        obj.content = (
                            <Card className="border-0 row flex-row">
                                {
                                    markets[i].Bets.map((item, index) => (
                                        <Odd data={item} leagueData={leagueData} market={markets[i]} handleBetSlip={handleBetSlip} key={index} />
                                    ))
                                }
                            </Card>
                        )
                        results.push(obj)
                    }
                }
            }
            setEventData(results)
            setIsLoading(false)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
        setTimerNumber(30)
    }

    const handleTimer = async () => {
        if (timerNumber === 0) {
            setTimerNumber(30)
            handleRefresh()
        } else {
            setTimerNumber(timerNumber - 1)
        }
    }

    useEffect(async () => {
        const request = {
            eventId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-event",
            method: "POST",
            params: request
        })
        if (response.status === 200 && response.data) {
            setSportsData(response.data)
            setOddType(getOddType())
            const oddType = getOddType()
            const leagueData = response.data
            const results = []
            if (response.data.Markets) {
                const markets = response.data.Markets
                for (const i in markets) {
                    if (markets[i]) {
                        const obj = {
                            title: getTextByLanguage(markets[i].Name)
                        }
                        obj.content = (
                            <Card className="border-0 row flex-row">
                                {markets[i].Bets.map((item, index) => (
                                    <Odd data={item} leagueData={leagueData} market={markets[i]} handleBetSlip={handleBetSlip} key={index} />
                                ))
                                }
                            </Card>
                        )
                        results.push(obj)
                    }
                }
            }
            setEventData(results)
            setIsLoading(false)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
    }, [])

    return (
        <React.Fragment>
            <ReactInterval timeout={1000} enabled={true} callback={e => { handleTimer() }} />
            {isLoading ? (
                <Spinner></Spinner>
            ) : (
                <React.Fragment>
                    <Card className="b-team__list px-0 col h-100 mr-5">
                        <CardHeader >
                            <div className="left d-flex align-items-center">
                                <h3 id="soccer-game" className="soccer mr-1">{getTextByLanguage(sportsData.RegionName)} {getTextByLanguage(sportsData.LeagueName)}</h3>
                                <span onClick={e => { handleRefresh() }} className="timer-number d-flex align-items-center">{timerNumber}</span>
                            </div>
                            <div className="right">
                                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                                <a style={{ color: "white", fontSize: "15px" }} href="/home" data-nsfw-filter-status="swf">{getTextByLanguage("Back to League")}</a>
                            </div>
                        </CardHeader>
                        <AppCollapse data={eventData} type='border' accordion={false} />
                    </Card>
                </React.Fragment>
            )}
        </React.Fragment>
    )
}

export default EventChildren
