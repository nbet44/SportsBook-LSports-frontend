import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    TabContent, TabPane, Nav, NavItem, NavLink,
    Card, CardHeader, CardBody
} from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import { toast } from 'react-toastify'
import Spinner from "@components/spinner/Fallback-spinner"
import { Lock, Star } from 'react-feather'
import moment from 'moment'
import { flagsByRegionName, mainMarketResultBySportId } from '../../configs/mainConfig'
import $, { isEmptyObject } from "jquery"
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'
import { useDispatch, useSelector } from 'react-redux'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'
import { SportHeader, LeagueSport } from './sportsComponent'

const LiveChildren = () => {
    const [active, setActive] = useState('1')
    const [SportId, setSportId] = useState(6046)
    const [sportsData, setSportsData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setRefreshing] = useState(false)
    const [eventData, setEventData] = useState([])
    const [leagueData, setLeagueData] = useState(null)
    const [timerNumber, setTimerNumber] = useState(30)
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const dispatch = useDispatch()
    const [oddType, setOddType] = useState("odds")
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const [getTextByLanguage] = useTranslator()

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

    const handleBetSlip = (data, event, index) => {
        if (data.results && data.results[index] && event) {
            if (data.results[index]["odds"] < 100 && data.results[index][oddType]) {
                const result = {
                    HomeTeam: event.HomeTeam,
                    AwayTeam: event.AwayTeam,
                    LeagueName: event.LeagueName,
                    SportName: event.SportName,
                    odds: data.results[index][oddType],
                    HomeTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[0] : "-",
                    AwayTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[1] : "-",
                    name: data.results[index].name.value,
                    live: !event.IsPreMatch,
                    id: data.results[index].id,
                    eventId: event.Id,
                    leagueId: event.LeagueId,
                    marketId: data.id,
                    IsPreMatch: event.IsPreMatch,
                    isOddChanged: false
                }
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.results[index].id}`).addClass("active")
                } else {
                    $(`#${data.results[index].id}`).removeClass("active")
                }
            }
        }
    }

    const handleChangeSlipData = async (data) => {
        for (const i in data) {
            const league = data[i]
            for (const j in league) {
                for (const k in betSlipData) {
                    if (j === betSlipData[k].eventId) {
                        const markets = league[j].Markets
                        for (const l in markets) {
                            if (markets[l].Id === betSlipData[k].marketId) {
                                for (const m in markets[l].Bets) {
                                    if (markets[l].Bets[m].Id === Number(k)) {
                                        if (Number(markets[l].Bets[m].Price) !== Number(betSlipData[k].odds)) {
                                            console.log(Number(markets[l].Bets[m].Price), Number(betSlipData[k].odds))
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
    }

    const getLeagueDataBySportId = async (id, tab) => {
        // setIsLoading(true)
        const request = {
            SportId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-live",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            setLeagueData(response.data)
            // handleChangeSlipData(response.data.eventData)
            setOddType(getOddType())
            setIsLoading(false)
            setTimerNumber(30)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
    }

    const toggle = (tab, id) => {
        if (active !== tab) {
            setActive(tab)
        }
        setSportId(id)
        getLeagueDataBySportId(id, tab)
    }

    const handleSelectedSlipStyle = async () => {
        for (const i in betSlipData) {
            $(`#${betSlipData[i].id}`).addClass("active")
        }
    }

    const handleRefresh = async () => {
        console.log("handleRefresh")
        setRefreshing(true)
        const request = {
            SportId
        }
        const response = await Axios({
            endpoint: "/sports/get-live",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            handleChangeSlipData(response.data)
            setRefreshing(false)
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

    useEffect(() => {
        if (window.innerWidth < 1184) {
            setClientPlatform("mobile")
        } else {
            setClientPlatform("desktop")
        }
        getLeagueDataBySportId(SportId)
    }, [])

    return (
        <React.Fragment>
            <ReactInterval timeout={1000} enabled={true} callback={e => { handleTimer() }} />
            {isLoading ? <Spinner color='white' size='lg' /> : (
                <React.Fragment>
                    <Nav tabs className="category-links m-0">
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '1'}
                                onClick={() => {
                                    toggle('1', 6046)
                                }}
                            >
                                {getTextByLanguage("Football")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '2'}
                                onClick={() => {
                                    toggle('2', 265917)
                                }}
                            >
                                {getTextByLanguage("Table Tennis")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '3'}
                                onClick={() => {
                                    toggle('3', 48242)
                                }}
                            >
                                {getTextByLanguage("Basketball")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '4'}
                                onClick={() => {
                                    toggle('4', 54094)
                                }}
                            >
                                {getTextByLanguage("Tennis")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '5'}
                                onClick={() => {
                                    toggle('5', 35232)
                                }}
                            >
                                {getTextByLanguage("Ice Hockey")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '6'}
                                onClick={() => {
                                    toggle('6', 154830)
                                }}
                            >
                                {getTextByLanguage("Volleyball")}
                            </NavLink>
                        </NavItem>
                    </Nav>
                    < TabContent className={`category-content ${clientPlatform === "desktop" ? "mr-5" : "mr-1"}`} activeTab={active} style={{ width: "70%" }}>
                        <TabPane tabId='1'>
                            {
                                active === "1" ? (
                                    <Card className="b-team__list">
                                        <SportHeader handleRefresh={handleRefresh} id={SportId} isRefreshing={isRefreshing} timerNumber={timerNumber} back={''} />
                                        {
                                            Object.keys(leagueData).map((key, index) => (
                                                <LeagueSport data={leagueData[key]} key={index} status={2} />
                                            ))
                                        }
                                    </Card >
                                ) : ""
                            }
                        </TabPane >
                        <TabPane tabId='2'>
                            {
                                active === "2" ? (
                                    <Card className="b-team__list">
                                        <SportHeader handleRefresh={handleRefresh} id={SportId} isRefreshing={isRefreshing} timerNumber={timerNumber} back={''} />
                                        {
                                            Object.keys(leagueData).map((key, index) => (
                                                <LeagueSport data={leagueData[key]} key={index} />
                                            ))
                                        }
                                    </Card >
                                ) : ""
                            }
                        </TabPane>
                        <TabPane tabId='3'>
                            {
                                active === "3" ? (
                                    <Card className="b-team__list">
                                        <SportHeader handleRefresh={handleRefresh} id={SportId} isRefreshing={isRefreshing} timerNumber={timerNumber} back={''} />
                                        {
                                            Object.keys(leagueData).map((key, index) => (
                                                <LeagueSport data={leagueData[key]} key={index} />
                                            ))
                                        }
                                    </Card >
                                ) : ""
                            }
                        </TabPane>
                        <TabPane tabId='4'>
                            {
                                active === "4" ? (
                                    <Card className="b-team__list">
                                        <SportHeader handleRefresh={handleRefresh} id={SportId} isRefreshing={isRefreshing} timerNumber={timerNumber} back={''} />
                                        {
                                            Object.keys(leagueData).map((key, index) => (
                                                <LeagueSport data={leagueData[key]} key={index} />
                                            ))
                                        }
                                    </Card >
                                ) : ""
                            }
                        </TabPane>
                        <TabPane tabId='5'>
                            {
                                active === "5" ? (
                                    <Card className="b-team__list">
                                        <SportHeader handleRefresh={handleRefresh} id={SportId} isRefreshing={isRefreshing} timerNumber={timerNumber} back={''} />
                                        {
                                            Object.keys(leagueData).map((key, index) => (
                                                <LeagueSport data={leagueData[key]} key={index} />
                                            ))
                                        }
                                    </Card >
                                ) : ""
                            }
                        </TabPane>
                        <TabPane tabId='6'>
                            {
                                active === "6" ? (
                                    <Card className="b-team__list">
                                        <SportHeader handleRefresh={handleRefresh} id={SportId} isRefreshing={isRefreshing} timerNumber={timerNumber} back={''} />
                                        {
                                            Object.keys(leagueData).map((key, index) => (
                                                <LeagueSport data={leagueData[key]} key={index} />
                                            ))
                                        }
                                    </Card >
                                ) : ""
                            }
                        </TabPane>
                    </TabContent >
                </React.Fragment >
            )
            }
        </React.Fragment >
    )
}

export default LiveChildren
