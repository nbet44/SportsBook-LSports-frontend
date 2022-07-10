import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    TabContent, TabPane, Nav, NavItem, NavLink,
    Card, CardHeader, CardBody
} from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import HeaderCmp from '../Header'
import { toast } from 'react-toastify'
import Spinner from "@components/spinner/Fallback-spinner"
import { Star, Lock } from 'react-feather'
import moment from 'moment'
import { flagsByRegionName, baseMarketsBySportId, sportsNameById } from '../../configs/mainConfig'
import BetSlipCmp from './betslip'
import $, { isEmptyObject } from "jquery"
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'
import { useDispatch, useSelector } from 'react-redux'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'
import { LeagueSport, SportHeader } from './sportsComponent'

const TodayGamesChildrenCmp = () => {
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setRefreshing] = useState(false)
    const [leagueData, setLeagueData] = useState({})
    const [timerNumber, setTimerNumber] = useState(30)
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const dispatch = useDispatch()
    const [oddType, setOddType] = useState("odds")
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const [getTextByLanguage] = useTranslator()

    const handleBetSlip = (data, event) => {
        if (data && data.Status === 1 && event) {
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
                eventId: event.Id,
                leagueId: event.LeagueId,
                IsPreMatch: event.IsPreMatch,
                isOddChanged: false
            }
            const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
            if (checkValue) {
                $(`#${data.Id}`).addClass("active")
            } else {
                $(`#${data.Id}`).removeClass("active")
            }
        }
    }

    const handleFavor = async (data, favorId) => {
        console.log("handleFavor")
        const request = data
        const response = await Axios({
            endpoint: "/sports/save-favorite",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            toast.success("success")
            if (response.data === "remove") {
                $(`#favor_${favorId}`).children().removeClass("active")
            } else {
                $(`#favor_${favorId}`).children().addClass("active")
            }
        } else {
            toast.error(response.data)
        }
    }

    const handleOddChange = (data) => {
        for (const i in data.eventData) {
            if (eventData[data.eventData[i].Id]) {
                for (const j in eventData[data.eventData[i].Id].Markets) {
                    for (const k in data.eventData[i].Markets) {
                        if ((eventData[data.eventData[i].Id].Markets[j].id === data.eventData[i].Markets[k].id) && (eventData[data.eventData[i].Id].Markets[j].name.value === "Match Result" || eventData[data.eventData[i].Id].Markets[j].name.value === "Total Goals - Over/Under" || eventData[data.eventData[i].Id].Markets[j].name.value === "Handicap")) {
                            for (const l in eventData[data.eventData[i].Id].Markets[j].results) {
                                for (const m in data.eventData[i].Markets[k].results) {
                                    if ((eventData[data.eventData[i].Id].Markets[j].results[l].id === data.eventData[i].Markets[k].results[m].id) && (eventData[data.eventData[i].Id].Markets[j].results[l][oddType] !== data.eventData[i].Markets[k].results[m][oddType])) {
                                        // if ((eventData[data.eventData[i].Id].Markets[j].results[l].id === data.eventData[i].Markets[k].results[m].id)) {
                                        if (eventData[data.eventData[i].Id].Markets[j].results[l][oddType] > data.eventData[i].Markets[k].results[m][oddType]) {
                                            data.eventData[i].Markets[k].results[m].updated = "match-odds-down"
                                        } else {
                                            data.eventData[i].Markets[k].results[m].updated = "match-odds-up"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const handleChangeSlipData = async (data) => {
        for (const i in data) {
            for (const j in betSlipData) {
                if (betSlipData[j].leagueId === data[i].LeagueId && betSlipData[j].eventId === data[i].Id) {
                    for (const k in data[i].Markets) {
                        if (data[i].Markets[k].id === betSlipData[j].marketId) {
                            for (const e in data[i].Markets[k].results) {
                                if (data[i].Markets[k].results[e].id === betSlipData[j].id) {
                                    if (data[i].Markets[k].results[e][oddType] !== betSlipData[j][oddType]) {
                                        const newData = betSlipData[j]
                                        dispatch(changeOdds(betSlipData, newData))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const handleSelectedSlipStyle = async () => {
        for (const i in betSlipData) {
            $(`#${betSlipData[i].id}`).addClass("active")
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        const request = {
            SportId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-today-match",
            method: "POST",
            params: request
        })
        if (response.status === 200) {
            setLeagueData(response.data)
            setRefreshing(false)
            handleOddChange(response.data)
            handleChangeSlipData(response.data)
        } else {
            setRefreshing(true)
            toast.error(response.data)
        }
        handleSelectedSlipStyle()
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
        if (window.innerWidth < 1184) {
            setClientPlatform("mobile")
        } else {
            setClientPlatform("desktop")
        }

        const request = {
            SportId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-today-match",
            method: "POST",
            params: request
        })
        if (response.status === 200) {
            setLeagueData(response.data)
            setOddType(getOddType())
            setIsLoading(false)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
    }, [])

    const makeMarket = (baseMarket, data) => {
        const markets = {}
        for (const i in baseMarket) {
            if (baseMarket[i].Mark === "1X2") {
                for (const j in data) {
                    if (data[j].Id === baseMarket[i].Id) {
                        markets[baseMarket[i].Id] = data[j].Bets
                        break
                    }
                }
            }

            if (baseMarket[i].Mark === "OU") {
                for (const j in data) {
                    if (data[j].Id === baseMarket[i].Id) {
                        const bets = []
                        for (const k in data[j].Bets) {
                            if (data[j].Bets[k].BaseLine === data[j].MainLine) {
                                data[j].Bets[k].Name === "Under" ? bets.push(data[j].Bets[k]) : bets.unshift(data[j].Bets[k])
                            }
                        }
                        markets[baseMarket[i].Id] = bets
                        break
                    }
                }
            }

            if (baseMarket[i].Mark === "HDP") {
                for (const j in data) {
                    if (data[j].Id === baseMarket[i].Id) {
                        const bets = []
                        for (const k in data[j].Bets) {
                            if (data[j].Bets[k].BaseLine === data[j].MainLine) {
                                data[j].Bets[k].Name === "2" ? bets.push(data[j].Bets[k]) : bets.unshift(data[j].Bets[k])
                            }
                        }
                        markets[baseMarket[i].Id] = bets
                        break
                    }
                }
            }
        }

        return markets
    }

    return (
        <React.Fragment>
            <ReactInterval timeout={1000} enabled={true} callback={e => { handleTimer() }} />

            {isLoading ? (
                <Spinner></Spinner>
            ) : (
                <Card className={`b-team__list px-0 col h-100 ${clientPlatform === "desktop" ? "mr-5" : "mr-1"}`}>
                    <SportHeader handleRefresh={handleRefresh} id={id} isRefreshing={isRefreshing} timerNumber={timerNumber} back={'home'} />
                    {
                        Object.keys(leagueData).map((key, index) => (
                            <LeagueSport data={leagueData[key]} key={index} />
                        ))
                    }
                </Card>
            )}
        </React.Fragment>
    )
}

export default TodayGamesChildrenCmp
