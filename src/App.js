import React, { Component } from 'react';
import SearchBox from './SearchBox';
import {tickerquery} from './tickerquery';
import {tickerwatchlist} from './watchlist';
import { isUndefined } from 'util';
import axios from 'axios'

class App extends Component {

  constructor()
  {
      super();
      this.state={
          searchfield: '',
          hanyszor:0,
          metadata:'',
          earningsqueryrunning: false,
          lastuimode:'CTR',
          daterange: null,
          queryresult:null,
          querydate:null,
          userresult:[],
          datumindex:0
      }
      this.hanynapotKeressen=25;
  }



  searchBoxChangeHandler=(event)=>
  {
      this.state.searchfield=event.target.value;
  }

  clickedHandler=()=>
  {
    if(this.state.earningsqueryrunning)return;
    this.state.lastuimode="CTR";
    let url=`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${this.state.searchfield}&apikey=49A9CU1MD39A3K45`;
    //console.log("url:"+url);
    fetch(url).then(response=>
    {
        return response.json();
    }).then(tombelem=>{
      //console.log(tombelem);
      this.state.metadata=tombelem;
        return this.setState({hanyszor: this.state.hanyszor+1});
    });
  }

  queryOneDate=()=>
  {
    //https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
    // react+express: https://www.youtube.com/watch?v=TTZOoWfGjCo


    const actualdateindex=this.state.datumindex;

    //https://github.com/Rob--W/cors-anywhere/blob/440d2de180737ef6bb16d1b38aaa6b5ce31363a8/demo.html#L67-L70
    //https://stackoverflow.com/questions/29670703/how-to-use-cors-anywhere-to-reverse-proxy-and-add-cors-headers
    
    let url="https://cors-anywhere.herokuapp.com/https://api.earningscalendar.net/?date="+this.state.daterange[actualdateindex];
    //let url="https://cors.io/?https://api.earningscalendar.net/?date="+this.state.daterange[this.state.datumindex+2];
/*
    axios({
      method:'get',
      url:url
    })
      .then(function(response) {
      console.log(response.text)
    });*/


    console.log(Date.now()+", url:"+url);
    
    fetch(url).then(response=>
    {
      //console.log(response.text);
        return response.json();
    }).then(tombelem=>{
      //console.log(tombelem);
      return this.setState({queryresult: tombelem, querydate: this.state.daterange[actualdateindex]});
    }).catch(error=>{
      this.state.datumindex=this.hanynapotKeressen;
      return this.setState({queryresult: error, querydate: this.state.daterange[actualdateindex]});
    });
    
    this.state.datumindex++;
    if(this.state.datumindex<this.hanynapotKeressen){
      //function() { startTimer(parm1); }
      setTimeout(this.queryOneDate, 3000);
    }
  }

  //https://api.earningscalendar.net/?date=20190412
  earningsclickhandler=()=>
  {
    this.state.lastuimode="EARNINGS";
    this.state.earningsqueryrunning=true;
    let today = new Date();
    var datumlista=[];
    for(var i=0;i<this.hanynapotKeressen;i++)
    {
      let tomorrow = new Date();
      tomorrow.setDate(today.getDate()+i);
      let dd = tomorrow.getDate();
      let mm = tomorrow.getMonth()+1; //January is 0!
      let yyyy = tomorrow.getFullYear();
      if(dd<10) {
        dd = '0'+dd;
      }
      if(mm<10) {
          mm = '0'+mm;
      }
      let qdate=String(yyyy)+String(mm)+String(dd);
      datumlista.push(qdate);
    }
    this.state.daterange=datumlista;
    this.state.userresult=[];
    this.state.datumindex=0;
    this.queryOneDate();
  }

  getatrinfo=(count, values)=>
  {
    let WEEKLY_ATR_1=[];
    let WEEKLY_ATR_3=[];
    let WEEKLY_ATR_3_AVG=0;
    let WEEKLY_ATR_3_MIN=Number.MAX_SAFE_INTEGER;
    let WEEKLY_ATR_3_CTR=0;
    let WEEKLY_ATR_3_MAX=-1;
    let ujcount=count;
    let mark=undefined;
    for(var i=0;i<count+3;i++)
    {
      if(values[i]===undefined){
        ujcount--;
        continue;
      }
      let subvaluesArray=Object.values(values[i]);
      //console.log(subvaluesArray);
      WEEKLY_ATR_1.push(Math.abs(Number(subvaluesArray[1]-Number(subvaluesArray[2]))));
      if(isUndefined(mark))
      {
        mark=subvaluesArray[3];
      }
    }

    for(var j=0;j<ujcount;j++)
    {
      let avg3=WEEKLY_ATR_1[j]+WEEKLY_ATR_1[j+1]+WEEKLY_ATR_1[j+2];
      avg3/=3;
      WEEKLY_ATR_3.push(avg3);
      if(avg3<WEEKLY_ATR_3_MIN)WEEKLY_ATR_3_MIN=avg3;
      WEEKLY_ATR_3_AVG+=avg3;
      if(avg3>WEEKLY_ATR_3_MAX)WEEKLY_ATR_3_MAX=avg3;
    }

    WEEKLY_ATR_3_AVG/=count;
    WEEKLY_ATR_3_CTR=(WEEKLY_ATR_3_AVG+WEEKLY_ATR_3_MIN)/2;

    //console.log(WEEKLY_ATR_1);
    /*console.log(WEEKLY_ATR_3_MIN);
    console.log(WEEKLY_ATR_3_AVG);
    console.log(WEEKLY_ATR_3_CTR);*/

    return {
      "MIN": WEEKLY_ATR_3_MIN.toFixed(2),
      "MAX": WEEKLY_ATR_3_MAX.toFixed(2),
      "AVG": WEEKLY_ATR_3_AVG.toFixed(2),
      "CTR": WEEKLY_ATR_3_CTR.toFixed(2),
      "%MARK": (WEEKLY_ATR_3_AVG*100/mark).toFixed(0)
    };
  }

  render() {
    if(this.state.lastuimode==="EARNINGS")
    {
      let tickerinfos=Object.values(this.state.queryresult);
      this.state.userresult.push(this.state.querydate);
      //console.log(tickerinfos.length);
      for(let t=0;t<tickerinfos.length;t++)
      {
        //console.log(tickerinfos[t]);
        let ticker=tickerinfos[t].ticker;
        let when=tickerinfos[t].when;
        //console.log(ticker);console.log(when);
        if(tickerwatchlist.indexOf(ticker) > -1)
        {
          this.state.userresult.push(ticker+" ("+when+")");
        }
      }
      const resultcomponent=this.state.userresult.map(function(sv, i){
        //console.log(String(sv));
        return <div key={i}>{sv}</div>;
      });
      return (
        <div className="tc">
          <SearchBox searchChange={this.searchBoxChangeHandler} clicked={this.clickedHandler} earningsclick={this.earningsclickhandler}/>
          <div>
            {resultcomponent}
          </div>
        </div>
      );
    }
    else
    {
      let jsonobj=tickerquery;
      if(this.state.metadata !== ''){
        jsonobj=this.state.metadata;
      }
      let weeklykeys=Object.keys(jsonobj['Weekly Time Series']);
      const weeklies = Object.entries(jsonobj['Weekly Time Series']);
  
      let i50=Math.min(50,weeklies.length);
      let i100=Math.min(100,weeklies.length);
      let i300=Math.min(300,weeklies.length);
      let result50=this.getatrinfo(i50, Object.values(jsonobj['Weekly Time Series']));    
      let result100=this.getatrinfo(i100, Object.values(jsonobj['Weekly Time Series']));
      let result300=this.getatrinfo(i300, Object.values(jsonobj['Weekly Time Series']));
      return (
        <div className="tc">
          <SearchBox searchChange={this.searchBoxChangeHandler} clicked={this.clickedHandler} earningsclick={this.earningsclickhandler}/>
          <p className="tc ba">
            DataSeriesReader '<b>{this.state.searchfield.toUpperCase()}</b>' '{this.state.hanyszor}'
          </p>
          <p className="tc ba">
            METADATA: {JSON.stringify(jsonobj['Meta Data'])}
          </p>
          <p className="tc ba">
            LASTDATA: {JSON.stringify(weeklykeys[0])} , RECORDS: {weeklies.length}
          </p>
          <h3>RESULT{i50}</h3>
          <p className="tc ba">
            {JSON.stringify(result50)}
          </p>
          <h3>RESULT{i100}</h3>
          <p className="tc ba">
            {JSON.stringify(result100)}
          </p>
          <h3>RESULT{i300}</h3>
          <p className="tc ba">
            {JSON.stringify(result300)}
          </p>
          <p className="tc ba">CTR VECTOR: [ {result50["CTR"]} {result100["CTR"]} {result300["CTR"]} ]</p>
          <h3>Details50</h3>
          <p className="tc ba">
            {result50["CTR"]}|{result50["MIN"]}:{result50["AVG"]}:{result50["MAX"]}|{(result50["AVG"]-result50["MIN"]).toFixed(2)}:{(result50["MAX"]-result50["AVG"]).toFixed(2)}|{(result50["AVG"]/result50["CTR"]).toFixed(2)}
          </p>
          <h3>Compact50</h3>
          <p className="tc ba">
            {result50["CTR"]}, {(result50["AVG"]/result50["CTR"]).toFixed(2)} | %{result50["%MARK"]} | {result50["MIN"]}:{result50["AVG"]}:{result50["MAX"]}
          </p>
        </div>
      );
    }
  }
}

export default App;

/*
const entries = Object.entries(operatingSystem);
entries.forEach(entry => {
    let key = entry[0];
    let value = entry[1];

    console.log(`${key}: ${value}`);
});
Object.entries(obj) – returns an array of [key, value] pairs.

WEEKLY series->

[Y:1, 2, 6]
N: 50, 100, 300
WEEKLY_ATR_1->WEEKLY_ATR_3
WEEKLY_ATR_3->WEEKLY_ATR_3_MIN,WEEKLY_ATR_3_AVG
WEEKLY_ATR_3_MIN,WEEKLY_ATR_3_AVG->WEEKLY_ATR_3_CTR

         MIN   AVG   CTR
50:
100:
300:

*/