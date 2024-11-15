import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import Axios from '../utility/hooks/Axios'
import HeaderCmp from './Header'
import { getSportsDataBySportId } from '../redux/actions/sports'
import { sportsNameById, flagsByRegionName, topFootballLeagues } from '../configs/mainConfig'
import moment from 'moment'
import { useTranslator } from '@hooks/useTranslator'
import { convertIdFromText } from '../utility/hooks/useTranslator'
import Spinner from "@components/spinner/Fallback-spinner"


const Home = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [sportsData, setSportsData] = useState({})
  const userData = useSelector((state) => state.auth.userData)
  const [topFootballLeagueData, setTopFootballLeagueData] = useState([])
  const [getTextByLanguage] = useTranslator()

  const getSportsDataBySportId = (data, sortType) => {
    data.sort(function (a, b) {
      if (sortType === "clickCount") {
        const x = a.ClickCount
        const y = b.ClickCount
        if (x > y) { return -1 }
        if (x < y) { return 1 }
        return 0
      } else if (sortType === "playCount") {
        const x = a.PlayCount
        const y = b.PlayCount
        if (x > y) { return -1 }
        if (x < y) { return 1 }
        return 0
      } else {
        const x = a.RegionName.toLowerCase()
        const y = b.RegionName.toLowerCase()
        if (x < y) { return -1 }
        if (x > y) { return 1 }
      }
    })
    const result = {}
    for (const i in data) {
      const isCheck = true
      if (data[i].SportId === 4) {

        console.log(data[i])
      }
      // const tempData = topFootballLeagueData
      // for (const j in topFootballLeagues) {
      //   if ((data[i].SportId === 6046) && (topFootballLeagues[j].RegionId === data[i].RegionId) && (data[i].LeagueName.indexOf(topFootballLeagues[j].LeagueName) !== -1)) {
      //     tempData.push(data[i])
      //     setTopFootballLeagueData(tempData)
      //     isCheck = false
      //     break
      //   }
      // }
      if (isCheck) {
        if (result[data[i]["SportId"]]) {
          result[data[i]["SportId"]].push(data[i])
        } else {
          result[data[i]["SportId"]] = [data[i]]
        }
      }
    }
    return result
  }

  const handleGetLeagueByDate = async (number) => {
    const request = {
      agentId: userData._id,
      date: number
    }
    const response = await Axios({
      endpoint: "/sports/get-league",
      method: "POST",
      params: request
    })
    if (response.status === 200) {
      if (response.setting) {
        setSportsData(await getSportsDataBySportId(response.data, response.setting.leagueSort.value))
        setIsLoading(false)
      }
    } else {
      toast.error(response.data)
    }
  }

  useEffect(async () => {
    const request = {
      agentId: userData._id,
      date: Date.now()
    }
    const response = await Axios({
      endpoint: "/sports/get-league",
      method: "POST",
      params: request
    })
    if (response.status === 200) {
      if (response.setting) {
        setSportsData(await getSportsDataBySportId(response.data, response.setting.leagueSort.value))
        setIsLoading(false)
      }
    } else {
      toast.error(response.data)
    }
  }, [])

  const TopFootballLeaguesCmp = () => {
    return (
      <React.Fragment>
        {topFootballLeagueData.map((item, i) => {
          let flagImg = ""
          let regionName = item.RegionName.replaceAll(" ", "")
          regionName = regionName.replaceAll("(", "")
          regionName = regionName.replaceAll(")", "")
          if (flagsByRegionName[regionName]) {
            flagImg = flagsByRegionName[regionName]
          } else {
            flagImg = regionName
          }
          return (
            <React.Fragment key={i}>
              <a className="d-flex align-items-center col-4 mb-1" href={`/match/${item.LeagueId}`}>
                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} />
                <span style={{ fontSize: "12px", marginLeft: "3px" }} ><b>{getTextByLanguage(item.RegionName)}</b> {getTextByLanguage(item.LeagueName)} </span>
              </a>
            </React.Fragment>
          )
        })}
      </React.Fragment>
    )
  }

  if (isLoading) {
    return (
      <div>
        <HeaderCmp />
        <Spinner />
      </div>
    )
  }

  console.log(sportsData)
  return (
    <div>
      {/* <h1>{getTextByLanguage("Lig")}</h1> */}
      {/* <div className="content-news mb-2">
        <Card className="mb-0">
          <div className="mt-label">NEWS:</div>
        </Card>
      </div> */}
      <HeaderCmp />
      <div className="content-body">
        <div className="b-team__list">
          {Object.keys(sportsData).map((key, index) => {
            const eachData = sportsData[key]
            if (sportsNameById[eachData[0]["SportId"]]) {
              return (
                <React.Fragment key={index}>
                  <CardHeader className="align-items-center d-flex justify-content-between" >
                    <div className="left">
                      <h2 id={`sport-title-${eachData[0]["SportId"]}`} className="soccer m-auto pl-3 p-1">{getTextByLanguage(eachData[0]["SportName"])}</h2>
                    </div>
                    <div className="right main-links">
                      <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                      <a className="event-date" onClick={e => { handleGetLeagueByDate(Date.now() + (3600 * 24 * 1000 * 4)) }} data-nsfw-filter-status="swf">{moment(Date.now() + (3600 * 24 * 1000 * 4)).format('DD/MM')}</a>
                      <a className="event-date" onClick={e => { handleGetLeagueByDate(Date.now() + (3600 * 24 * 1000 * 3)) }} data-nsfw-filter-status="swf">{moment(Date.now() + (3600 * 24 * 1000 * 3)).format('DD/MM')}</a>
                      <a className="event-date" onClick={e => { handleGetLeagueByDate(Date.now() + (3600 * 24 * 1000 * 2)) }} data-nsfw-filter-status="swf">{moment(Date.now() + (3600 * 24 * 1000 * 2)).format('DD/MM')}</a>
                      <a className="event-date" onClick={e => { handleGetLeagueByDate(Date.now() + (3600 * 24 * 1000 * 1)) }} data-nsfw-filter-status="swf">{moment(Date.now() + (3600 * 24 * 1000)).format('DD/MM')}</a>
                      <a className="event-date" href={`/today/${eachData[0]["SportId"]}`} data-nsfw-filter-status="swf">{getTextByLanguage("Today Games")}</a>
                    </div>
                    {/* <div className="right">
                      <span className="open-button opened" href="#" data-nsfw-filter-status="swf">
                        <a href="today?sport=soccer" className="left" data-nsfw-filter-status="swf">Today Games</a>
                        <span className="open-arrow right" data-nsfw-filter-status="swf"></span>
                      </span>
                    </div> */}
                  </CardHeader>
                  <CardBody style={{ borderBottom: "1px solid #4b4b4b" }} className="b-team pt-0">
                    <a href="/" className="outright-link">{getTextByLanguage("Outrights")} ({eachData.length})</a>
                    <div className="list-container justify-content-center">
                      <div className="row col-12 home-sports-list">
                        {eachData[0].SportId === 4 ? <TopFootballLeaguesCmp /> : ""}
                        {eachData.map((item, i) => {
                          let flagImg = ""
                          let regionName = item.RegionName.replaceAll(" ", "")
                          regionName = regionName.replaceAll("(", "")
                          regionName = regionName.replaceAll(")", "")
                          if (flagsByRegionName[regionName]) {
                            flagImg = flagsByRegionName[regionName]
                          } else {
                            flagImg = regionName
                          }
                          return (
                            <React.Fragment key={i}>
                              <a className="d-flex align-items-center col-4 mb-1" href={`/match/${item.LeagueId}`}>
                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} />
                                <span style={{ fontSize: "12px", marginLeft: "3px" }} ><b>{getTextByLanguage(item.RegionName)}</b> {getTextByLanguage(item.LeagueName)} </span>
                              </a>
                            </React.Fragment>
                          )
                        })}
                      </div>
                      {/* <ul className="list-col">
                        <li className="d-flex align-items-center">
                          <input type="checkbox" name="sport[tennis][]" value="ATP Challenger Braunschweig - R1" />
                          <img src="https://getbet77.com/files/flags1/Germany.png" alt="ATP Challenger Braunschweig - R1" />
                          <a alt="ATP Challenger Braunschweig - R1" href="sl.php?sport=tennis&amp;selliga=ATP+Challenger+Braunschweig+-+R1" data-nsfw-filter-status="swf">
                            <span data-nsfw-filter-status="swf"> ATP Challenger Braunschwei...</span>
                          </a>
                        </li>
                      </ul>
                      <ul className="list-col">
                        <li className="d-flex align-items-center">
                          <input type="checkbox" name="sport[tennis][]" value="ATP Challenger Braunschweig - R1" />
                          <img src="https://getbet77.com/files/flags1/Germany.png" alt="ATP Challenger Braunschweig - R1" />
                          <a alt="ATP Challenger Braunschweig - R1" href="sl.php?sport=tennis&amp;selliga=ATP+Challenger+Braunschweig+-+R1" data-nsfw-filter-status="swf">
                            <span data-nsfw-filter-status="swf"> ATP Challenger Braunschwei...</span>
                          </a>
                        </li>
                      </ul> */}
                    </div>
                  </CardBody>
                </React.Fragment>
              )
            }
          })
          }
        </div>
      </div>
    </div>
  )
}

export default Home
