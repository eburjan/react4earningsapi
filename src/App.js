import React, { Component } from 'react';
import SearchBox from './SearchBox';
import {tickerquery} from './tickerquery';

class App extends Component {

  constructor()
  {
      super();
      this.state={
          searchfield: '',
          hanyszor:0,
          metadata:''
      }
  }

  searchBoxChangeHandler=(event)=>
  {   
      this.state.searchfield=event.target.value;
  }

  clickedHandler=()=>
  {
    let url=`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${this.state.searchfield}&apikey=49A9CU1MD39A3K45`;
    console.log("url:"+url);
    fetch(url).then(response=>
    {
        return response.json();
    }).then(tombelem=>{
      //console.log(tombelem);
      this.state.metadata=tombelem;
        return this.setState({hanyszor: this.state.hanyszor+1});
    });
  }

  getatrinfo=(count, values)=>
  {
    let WEEKLY_ATR_1=[];
    let WEEKLY_ATR_3=[];
    let WEEKLY_ATR_3_AVG=0;
    let WEEKLY_ATR_3_MIN=Number.MAX_SAFE_INTEGER;
    let WEEKLY_ATR_3_CTR=0;

    for(var i=0;i<count+3;i++)
    {
      let subvaluesArray=Object.values(values[i]);
      //console.log(subvaluesArray);
      WEEKLY_ATR_1.push(Math.abs(Number(subvaluesArray[1]-Number(subvaluesArray[2]))));
    }

    for(var j=0;j<count;j++)
    {
      let avg3=WEEKLY_ATR_1[j]+WEEKLY_ATR_1[j+1]+WEEKLY_ATR_1[j+2];
      avg3/=3;
      WEEKLY_ATR_3.push(avg3);
      if(avg3<WEEKLY_ATR_3_MIN)WEEKLY_ATR_3_MIN=avg3;
      WEEKLY_ATR_3_AVG+=avg3;
    }

    WEEKLY_ATR_3_AVG/=count;
    WEEKLY_ATR_3_CTR=(WEEKLY_ATR_3_AVG+WEEKLY_ATR_3_MIN)/2;

    //console.log(WEEKLY_ATR_1);
    /*console.log(WEEKLY_ATR_3_MIN);
    console.log(WEEKLY_ATR_3_AVG);
    console.log(WEEKLY_ATR_3_CTR);*/

    return {
      "MIN": WEEKLY_ATR_3_MIN.toFixed(2),
      "AVG": WEEKLY_ATR_3_AVG.toFixed(2),
      "CTR": WEEKLY_ATR_3_CTR.toFixed(2)
    };
  }

  render() {
    let jsonobj=tickerquery;
    /*if(this.state.metadata == ''){
      return (
        <div className="tc">
        <SearchBox searchChange={this.searchBoxChangeHandler} clicked={this.clickedHandler}/>
      </div>
      );
    }*/

    if(this.state.metadata !== ''){
      jsonobj=this.state.metadata;
    }    

    //console.log("series length:"+Object.keys(jsonobj['Weekly Time Series']).length);

    let weeklykeys=Object.keys(jsonobj['Weekly Time Series']);
    const weeklies = Object.entries(jsonobj['Weekly Time Series']);

    let result50=this.getatrinfo(50, Object.values(jsonobj['Weekly Time Series']));
    let result100=this.getatrinfo(100, Object.values(jsonobj['Weekly Time Series']));
    let result300=this.getatrinfo(300, Object.values(jsonobj['Weekly Time Series']));
    //console.log(result50);

    return (
      <div className="tc">
        <SearchBox searchChange={this.searchBoxChangeHandler} clicked={this.clickedHandler}/>
        <p className="tc ba">
          DataSeriesReader '<b>{this.state.searchfield.toUpperCase()}</b>' '{this.state.hanyszor}'
        </p>
        <p className="tc ba">
          METADATA: {JSON.stringify(jsonobj['Meta Data'])}
        </p>
        <p className="tc ba">
          LASTDATA: {JSON.stringify(weeklykeys[0])} , RECORDS: {weeklies.length}
        </p>
        <h3>RESULT50</h3>
        <p className="tc ba">
          {JSON.stringify(result50)}
        </p>
        <h3>RESULT100</h3>
        <p className="tc ba">
          {JSON.stringify(result100)}
        </p>
        <h3>RESULT300</h3>
        <p className="tc ba">
          {JSON.stringify(result300)}
        </p>
        <h3>CTR VECTOR: [ {result50["CTR"]} {result100["CTR"]} {result300["CTR"]} ]</h3>
      </div>
    );
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