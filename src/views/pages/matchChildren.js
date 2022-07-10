import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    Card, CardHeader
} from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import Spinner from "@components/spinner/Fallback-spinner"
import $, { isEmptyObject } from "jquery"
import { changeOdds } from '../../redux/actions/sports'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'

import { LeagueSport } from './sportsComponent'

const MatchChildren = () => {
    const { id } = useParams()
    const [matchData, setMatchData] = useState(null)
    const [eventData, setEventData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setRefreshing] = useState(false)
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const [timerNumber, setTimerNumber] = useState(30)
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const [oddType, setOddType] = useState("odds")
    const dispatch = useDispatch()
    const [tempData, setTempData] = useState(null)
    const [getTextByLanguage] = useTranslator()

    const handleChangeSlipData = async (data) => {
        const league = data
        for (const j in league) {
            for (const k in betSlipData) {
                if (j === betSlipData[k].eventId) {
                    const markets = league[j].Markets
                    for (const l in markets) {
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
        setMatchData(data[Object.keys(data)[0]])
        setEventData(data)
    }

    const handleSelectedSlipStyle = async () => {
        for (const i in betSlipData) {
            $(`#${betSlipData[i].id}`).addClass("active")
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        const request = {
            LeagueId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-match",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200 && !isEmptyObject(response.data)) {
            if (!isEmptyObject(response.data)) {
                const data = response.data
                handleOddChange(response.data)
                handleChangeSlipData(data)
            }
            setRefreshing(false)
            handleSelectedSlipStyle()
        } else {
            setRefreshing(true)
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
        if (window.innerWidth < 1184) {
            setClientPlatform("mobile")
        } else {
            setClientPlatform("desktop")
        }
        const request = {
            LeagueId: id,
            first: true
        }
        const response = await Axios({
            endpoint: "/sports/get-match",
            method: "POST",
            params: request
        })
        if (response.status === 200) {
            if (!isEmptyObject(response.data)) {
                const data = response.data
                setTempData(data)
                setMatchData(data[Object.keys(data)[0]])
                setEventData(data)
                setOddType(getOddType())
            }
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
                <Card className={`b-team__list px-0 col h-100 ${clientPlatform === "desktop" ? "mr-5" : "mr-1"}`}>
                    <CardHeader >
                        <div className="left d-flex align-items-center">
                            <h2 id={`sport-title-${matchData ? matchData.SportId : ''}`} className="soccer m-auto pl-3 p-1">{matchData && matchData.SportName ? getTextByLanguage(matchData.SportName) : ""}</h2>
                            <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                        </div>
                        <div className="right">
                            <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                            <a style={{ color: "white", fontSize: "15px" }} href="/home" data-nsfw-filter-status="swf">{getTextByLanguage("Back to League")}</a>
                        </div>
                    </CardHeader>

                    <LeagueSport data={tempData} />
                </Card>
            )}
        </React.Fragment>
    )
}

export default MatchChildren