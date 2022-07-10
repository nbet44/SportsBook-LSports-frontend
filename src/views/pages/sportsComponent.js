import React, { useCallback, useEffect, useState } from 'react'
import { CardHeader, CardBody } from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import { toast } from 'react-toastify'
import { Star, Lock } from 'react-feather'
import moment from 'moment'
import { flagsByRegionName, baseMarketsBySportId, sportsNameById } from '../../configs/mainConfig'
import $, { isEmptyObject } from "jquery"
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslator } from '@hooks/useTranslator'

export const LeagueSport = (props) => {
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const [matchData, setMatchData] = useState(null)
    const [eventData, setEventData] = useState(null)
    const [baseMarket, setBaseMarket] = useState([])
    const [flagImg, setFlagImg] = useState("all_leagues")
    const [status, setStatus] = useState(1)
    const dispatch = useDispatch()
    const [getTextByLanguage] = useTranslator()

    const handleOddChange = (data) => {
        if (eventData) {
            for (const i in data) {
                if (eventData[i]) {
                    for (const j in eventData[i].Markets) {
                        for (const k in data[i].Markets) {
                            if (eventData[i].Markets[j].Id === data[i].Markets[k].Id) {
                                for (const l in eventData[i].Markets[j].Bets) {
                                    for (const m in data[i].Markets[k].Bets) {
                                        if ((eventData[i].Markets[j].Bets[l].Id === data[i].Markets[k].Bets[m].Id) &&
                                            (Number(eventData[i].Markets[j].Bets[l].Price) !== Number(data[i].Markets[k].Bets[m].Price))) {
                                            if (Number(eventData[i].Markets[j].Bets[l].Price) > Number(data[i].Markets[k].Bets[m].Price)) {
                                                data[i].Markets[k].Bets[m].update = 'match-odds-down'
                                            } else {
                                                data[i].Markets[k].Bets[m].update = 'match-odds-up'
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
        setEventData(data)
    }

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

    const handleBetSlip = (data, event, marketId) => {
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
                marketId,
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

    useEffect(async () => {
        const data = props.data
        if (!isEmptyObject(data)) {
            await handleOddChange(data)
            setMatchData(data[Object.keys(data)[0]])
            setBaseMarket(baseMarketsBySportId[data[Object.keys(data)[0]].SportId])
            const regionName = data[Object.keys(data)[0]].RegionName
            flagsByRegionName[regionName] ? setFlagImg(flagsByRegionName[regionName]) : setFlagImg(regionName)
            if (props.status) {
                setStatus(props.status)
            }
        }
    }, [props])

    /*eslint-disable */
    return (
        <React.Fragment >
            {
                eventData && baseMarket.length ? (
                    <React.Fragment >
                        <div className="title py-1">
                            <div className="left">
                                <h3>
                                    <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                    <span data-nsfw-filter-status="swf"><b>{getTextByLanguage(matchData ? matchData["RegionName"] : "")}</b> {getTextByLanguage(matchData ? matchData["LeagueName"] : "")}</span>
                                </h3>
                            </div>
                        </div>

                        <CardBody className="b-team pt-0 pb-0">
                            <div className="table-wrapper">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr className="table-header">
                                            <td >
                                                <span>{getTextByLanguage("Time")}</span>
                                            </td>
                                            <td className="event" >{getTextByLanguage("Event")}</td>
                                            {
                                                baseMarket.map((item, i) => (
                                                    <td key={i}>{item.Mark}</td>
                                                ))
                                            }
                                            <td>M+</td>
                                        </tr>

                                        {
                                            Object.keys(eventData).map((key, order) => {
                                                const item = eventData[key]
                                                const favorId = item.Id
                                                let markets = {}
                                                if (item.Markets) {
                                                    markets = { ...makeMarket(baseMarket, item.Markets) }
                                                }
                                                return (
                                                    <React.Fragment key={order}>
                                                        <tr>
                                                            <td rowSpan="3" className=""><div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon ${item.favor ? "active" : ""} `} /></div><div className="d-flex justify-content-center">{moment(item.Date).format('MM/DD HH:mm')}</div></td>
                                                            <td>
                                                                <span className='red'>
                                                                    {
                                                                        status === 2 ? `${item.Scoreboard.Scoreboard.Results[0].Value} - ${getTextByLanguage(item.HomeTeam)}` : getTextByLanguage(item.HomeTeam)
                                                                    }
                                                                </span>
                                                            </td>
                                                            {
                                                                markets[baseMarket[0].Id] && markets[baseMarket[0].Id].length ?
                                                                    <td className={`match-odds ${markets[baseMarket[0].Id][0].update}`} id={`${markets[baseMarket[0].Id][0].Id}`} onClick={() => handleBetSlip(markets[baseMarket[0].Id][0], item, baseMarket[0].Id)} >
                                                                        {markets[baseMarket[0].Id][0].Status === 1 ? markets[baseMarket[0].Id][0].Price : <Lock />}
                                                                    </td>
                                                                    : <td className='match-odds' />
                                                            }
                                                            {
                                                                markets[baseMarket[1].Id] && markets[baseMarket[1].Id].length ?
                                                                    <td className={`match-odds ${markets[baseMarket[1].Id][0].update}`} id={`${markets[baseMarket[1].Id][0].Id}`} onClick={e => { handleBetSlip(markets[baseMarket[1].Id][0], item, baseMarket[1].Id) }} ><span className="odd-td-left">{markets[baseMarket[1].Id][0].Status === 1 ? `O ${markets[baseMarket[1].Id][0].BaseLine}` : <></>}</span>
                                                                        <span className="odd-td-right">{markets[baseMarket[1].Id][0].Status === 1 ? markets[baseMarket[1].Id][0].Price : <Lock />}</span>
                                                                    </td>
                                                                    : <td className='match-odds' />
                                                            }
                                                            {
                                                                markets[baseMarket[2].Id] && markets[baseMarket[2].Id].length ?
                                                                    <td className={`match-odds ${markets[baseMarket[2].Id][0].update}`} id={`${markets[baseMarket[2].Id][0].Id}`} onClick={e => { handleBetSlip(markets[baseMarket[2].Id][0], item, baseMarket[2].Id) }} >
                                                                        <span className="odd-td-left">{markets[baseMarket[2].Id][0].Status === 1 ? markets[baseMarket[2].Id][0].BaseLine : <></>}</span>
                                                                        <span className="odd-td-right">{markets[baseMarket[2].Id][0].Status === 1 ? markets[baseMarket[2].Id][0].Price : <Lock />}</span>
                                                                    </td>
                                                                    : <td className='match-odds' />
                                                            }
                                                            <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{item.Markets.length}</a></td>
                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <span className='yellow'>
                                                                    {
                                                                        status === 2 ? `${item.Scoreboard.Scoreboard.Results[1].Value} - ${getTextByLanguage(item.AwayTeam)}` : getTextByLanguage(item.AwayTeam)
                                                                    }
                                                                </span>
                                                            </td>
                                                            {
                                                                markets[baseMarket[0].Id] && markets[baseMarket[0].Id].length ?
                                                                    <td className={`match-odds ${markets[baseMarket[0].Id][2].update}`} id={`${markets[baseMarket[0].Id][2].Id}`} onClick={e => { handleBetSlip(markets[baseMarket[0].Id][2], item, baseMarket[0].Id) }} >
                                                                        {markets[baseMarket[0].Id][2].Status === 1 ? markets[baseMarket[0].Id][2].Price : <Lock />}
                                                                    </td>
                                                                    : <td className='match-odds' />
                                                            }
                                                            {
                                                                markets[baseMarket[1].Id] && markets[baseMarket[1].Id].length ?
                                                                    <td className={`match-odds ${markets[baseMarket[1].Id][1].update}`} id={`${markets[baseMarket[1].Id][1].Id}`} onClick={e => { handleBetSlip(markets[baseMarket[1].Id][1], item, baseMarket[1].Id) }} >
                                                                        <span className="odd-td-left">
                                                                            {markets[baseMarket[1].Id][0].Status === 1 ? `U ${markets[baseMarket[1].Id][0].BaseLine}` : ""}
                                                                        </span>
                                                                        <span className="odd-td-right">
                                                                            {markets[baseMarket[1].Id][1].Status === 1 ? markets[baseMarket[1].Id][1].Price : <Lock />}
                                                                        </span>
                                                                    </td>
                                                                    : <td className='match-odds' />
                                                            }
                                                            {
                                                                markets[baseMarket[2].Id] && markets[baseMarket[2].Id].length ?
                                                                    <td className={`match-odds ${markets[baseMarket[2].Id][1].update}`} id={`${markets[baseMarket[2].Id][1].Id}`} onClick={e => { handleBetSlip(markets[baseMarket[2].Id][1], item, baseMarket[2].Id) }} >
                                                                        <span className="odd-td-left">
                                                                            {
                                                                                markets[baseMarket[2].Id][0].Status === 1 ? markets[baseMarket[2].Id][0].BaseLine : ""
                                                                            }
                                                                        </span>
                                                                        <span className="odd-td-right">
                                                                            {
                                                                                markets[baseMarket[2].Id][1].Status === 1 ? markets[baseMarket[2].Id][1].Price : <Lock />
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    : <td className='match-odds' />
                                                            }
                                                        </tr>

                                                        <tr>
                                                            <td>{getTextByLanguage("Draft")}</td>
                                                            {
                                                                markets[baseMarket[0].Id] && markets[baseMarket[0].Id].length ?
                                                                    <td className={`match-odds ${markets[baseMarket[0].Id][1].update}`} id={`${markets[baseMarket[0].Id][1].Id}`} onClick={e => { handleBetSlip(markets[baseMarket[0].Id][1], item, baseMarket[0].Id) }} >
                                                                        {markets[baseMarket[0].Id][1].Status === 1 ? markets[baseMarket[0].Id][1].Price : <Lock />}
                                                                    </td>
                                                                    : <td className='match-odds' />
                                                            }
                                                            <td className='match-odds' />
                                                            <td className='match-odds' />
                                                        </tr>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </React.Fragment >
                ) : null
            }
        </React.Fragment >
    )
    /*eslint-enable */
}

export const Odd = ({ data, leagueData, market, handleBetSlip }) => {
    const [getTextByLanguage] = useTranslator()
    let name = data.Name
    if (market.Id === 3) name = data.Name === '1' ? `${leagueData.HomeTeam} ${data.BaseLine}` : data.Name === '2' ? `${leagueData.AwayTeam} ${data.BaseLine}` : `${data.Name} ${data.BaseLine}`
    if (data.Name === 'Under' || data.Name === 'Over') name = `${data.Name} ${market.MainLine}`
    if (data.Name === '1' || data.Name === '2') name = data.Name === '1' ? `${leagueData.HomeTeam} (1)` : data.Name === '2' ? `${leagueData.AwayTeam} (2)` : data.Name
    // if (market.Id === 1) name = data.Name === '1' ? `${leagueData.HomeTeam} (1)` : data.Name === '2' ? `${leagueData.AwayTeam} (2)` : 'X'

    return (
        <span id={data.Id} className="event-box p-1 col m-1" onClick={(e) => { handleBetSlip(data, leagueData, market) }}>
            {getTextByLanguage(name)}
            <a>
                {data.Status === 1 ? data.Price : <Lock />}
            </a>
        </span>
    )
}

export const SportHeader = ({ handleRefresh, id, isRefreshing, timerNumber, back }) => {
    const [getTextByLanguage] = useTranslator()
    return (
        <CardHeader >
            <div className="left d-flex align-items-center">
                <h2 id={`sport-title-${id}`} className="soccer m-auto pl-3 p-1">{getTextByLanguage(sportsNameById[id])}</h2>
                <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
            </div>
            <div className="right">
                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                {
                    back ? <a style={{ color: "white", fontSize: "15px" }} href={`/${back}`} data-nsfw-filter-status="swf">{getTextByLanguage("Back to League")}</a> : null
                }
            </div>
        </CardHeader>
    )
}