const url ="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

let listData ="";
let checkedCoins=[];

// getting the information from api + functions for buttons

$(async() => {
    allCoinsData = await $.get(url);
    createCards(allCoinsData);
    
    $("#searchBtn").on("click", () => {
        let userInput = $("#userInput").val().toString();
        console.log(userInput);
     if (!userInput) return;
        createCards(filterCoins(userInput.toLowerCase()));})
      

      $("#home").on("click",  () => {
      checkedCoins=[];
      $("#cardsBoard").show()
      $("#chartContainer").hide()
        createCards(allCoinsData);
      });
      
      $("#aboutUs").on("click",  () => {
        $("#cardsBoard").show()
        $("#chartContainer").hide()
          showAbout();
        });
    




      $("#liveReport").on("click",  () => {
      $("#cardsBoard").hide()
      $("#chartContainer").show()
        createChart(checkedCoins);
      });
    
// inside modal 
    $("#closeBtn").on("click",()=>{
        const lastCoin=checkedCoins[checkedCoins.length-1]
        uncheckCoin(lastCoin)
        
    });
// inside modal (prompt) - get all with  ype radio and with name "prompt checkbox"( only checked ones)
    $("#saveChanges").on("click", () => {$('#exampleModal').modal('hide');
    console.log("ddddd"+$('input[type=radio][name="promptCheckbox"]'));
    const checkedItem = $('input[type=radio][name="promptCheckbox"]:checked').map(function() {
        return $(this).val();
      }).get();
      console.log("save"+checkedItem);
      uncheckCoin(checkedItem)
    }); 
});

    
// filter function for the array of coins - search btn
const filterCoins= (userInput) => {
    let filteredCoins = [];
    filteredCoins = allCoinsData.filter((item) => {
      return item.name.toLowerCase().includes(userInput);
    });
    console.log(filteredCoins)
    return filteredCoins;
}

// main function - map all the cards and show them in container
const createCards = (listData) => {   $("#cardsBoard").empty()
    console.log(listData);
    listData.map(coin => $("#cardsBoard").append(`<div class="col-lg-4 col-md-6 col-sm-12 mb-4">
    <div class="card border border-dark-subtle">
      <div class="card-body p-4">
        <div class="float-end mb-3">
        <img id="coinThumb" src="${coin.image}">
        </div>
        <h5 class="card-title">${coin.name}</h5>
        <p class="card-text text-muted mb-4">${coin.symbol}</p>
        <div class="form-check form-switch mb-3">
          <input class="form-check-input" id="checkBox-${coin.symbol.toUpperCase()}" onchange= "handleToggle('${coin.symbol.toUpperCase()}')" value="coin" type="checkbox"  >
          <label class="form-check-label" >Enable live updates</label>
        </div>
        <button onclick="moreInfo('${coin.id}')" class="btn btn-primary" >More info</button>
      <div id='${coin.id}'></div>
    </div>
  </div>`))
//the last div is where the more info (from api) will be shown...  

}

const showAbout=()=>{
  $("#cardsBoard").show()
  $("#cardsBoard").html(`<div class="container-fluid">
  <div class="row">
    <div class="col-md-4">
      <div class="card bg-light shadow-sm">
        <div class="card-body">
          <img src="images/me.png" alt="about image" class="img-fluid shadow-sm mb-3">
          <p class="card-text text-muted">
            Explore the world of cryptocurrency.
          </p>
        </div>
      </div>
    </div>

    <div class="col-md-8">
      <div class="card bg-light border-0 shadow-sm">
        <div class="card-body">
          <h2 class="card-title text-uppercase font-weight-bold">About me</h2>
          <hr>
          <p class="card-text text-muted">Name: Shahar Weissman</p>
          <p class="card-text text-muted">Welcome to my professional cryptocurrency website! My platform presents the latest cryptocurrency coins from an API and organizes them in visually-appealing cards for your convenience. Our website features a live report section that provides updated charts of the coins you are interested in. You can easily track the performance of your investments using BootStrap features. Thank you for choosing my professional cryptocurrency website.
          
          I hope to help you explore the world of cryptocurrency and discover the future of finance.</p>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>`);}


// add to array of checked coins
const handleToggle = (coinID)=> {
  
    console.log($(`#checkBox-${coinID}`))
    if ($(`#checkBox-${coinID}`)[0].checked) {
        console.log("checking")
        if(checkedCoins.length<5){
            checkedCoins.push(coinID);
            console.log(checkedCoins)
        }else{
            promptWarning(coinID)
        }
      } else {
       uncheckCoin(coinID)
      }
}


const promptWarning =(extraCoin)=>{
  let modalBody="";
  console.log("bdika "+checkedCoins)
  checkedCoins.map((checkedCoin)=>{
      modalBody+= `<div class="form-check form-switch mb-3">
      <input class="form-check-input" checked="true" id="modalReport-${checkedCoin}" name="promptCheckbox" value='${checkedCoin}' type="radio"  >
      <label class="form-check-label" >${checkedCoin}</label>
      </div>`})
      checkedCoins.push(extraCoin);

      $('#exampleModalLabel').text("More than 5 coins, please choose a coin to replace ");
      $('#exampleModal .modal-body').html(modalBody);
      $('#exampleModal').modal('show');
   console.log(modalBody);

}


const uncheckCoin=(coinId)=>{
  console.log("before : "+checkedCoins)
  $(`#checkBox-${coinId}`)[0].checked=false
  checkedCoins=checkedCoins.filter(coin=>coin!=coinId)
  console.log(checkedCoins)
}

const moreInfo = async (coinId) => {
  const moreInfoDiv = $(`#${coinId}`);
  const cacheName = 'coinInfo';
  const cacheKey = `coinInfo-${coinId}`;

  // second press will hide the div
  if (moreInfoDiv.html().trim().length > 0) {
    moreInfoDiv.empty();
    return;
  }

  // show loading spinner while data is being fetched.....
  moreInfoDiv.html(`
    <div class="text-center">
      <div class="spinner-border spinner-border-md" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`);

  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      const now=new Date()
      const cachedData = await cachedResponse.json();
      console.log("EXPIRED Time:  "+new Date(cachedData.expiredTime)+"NOW: "+now)
      const expiredTime =new Date(cachedData.expiredTime)
    if(expiredTime > now ){
      console.log(`Loading data from cache...Time to load from API: ${(expiredTime-now)/1000} SEC`);
      displayData(cachedData);
      return;
    }
      
    };
    console.log(`Loading data from API...`);
      const infoTime = new Date();
      const expiredTime = new Date(infoTime.getTime() + 2 * 60 * 1000);

    const coinApiInfo = await $.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);

    const coinData = {
      current_price_usd: coinApiInfo.market_data.current_price.usd,
      current_price_ils: coinApiInfo.market_data.current_price.ils,
      current_price_eur: coinApiInfo.market_data.current_price.eur,
      expiredTime: expiredTime,
    };

    displayData(coinData);

    // make cache entry
    const cacheEntry = new Response(JSON.stringify(coinData));

    // Store cache entry
    await cache.put(cacheKey, cacheEntry);

  } catch (error) {
    console.error(`Failed to fetch coin info for ${coinId}: ${error}`);
  }

  
  function displayData(coinData) {
    moreInfoDiv.html(`<div id="more-info"><b>Currency:</b>
      <p class="card-text text-muted mt-2" >  ${coinData.current_price_usd} $</br>
      ${coinData.current_price_ils} ILS </br>
      ${coinData.current_price_eur} EUR</p></div>`);
  }
};
// live report chart function
const createChart = (checkedCoins) => {
  const chartOptions = {
    exportEnabled: true,
    animationEnabled: true,
    title: { text: "Crypto Prices" },
    subtitles: [{ text: "Click Legend to Hide or Unhide Data Series" }],
    axisX: { 
      title: "Time",
      valueFormatString: "hh:mm:ss"
    },
    axisY: {
      title: "Price in USD",
      titleFontColor: "#4F81BC",
      lineColor: "#4F81BC",
      labelFontColor: "#4F81BC",
      tickColor: "#4F81BC",
      minimum: 0,
      maximum: 10,
      interval: 1,
      labelFormatter: function(e) {
        return e.value.toFixed(2);
      }
    },
    
    toolTip: { shared: true },
    legend: { cursor: "pointer", itemclick: toggleDataSeries },
    data: []
  };
  let coins = checkedCoins;
  coins.forEach((coin) => {
    chartOptions.data.push({
      type: "spline",
      name: coin,
      showInLegend: true,
      xValueFormatString: "hh:mm:ss",
      yValueFormatString: "$#,##0.#",
      dataPoints: []
    });
  });
  let chart = new CanvasJS.Chart("chartContainer", chartOptions);

  const padding = 0.1; // Adjust the padding factor as desired

  function updateChart() {
    $.getJSON(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coins.join(",")}&tsyms=USD`, function(data) {
      let minY = Infinity, maxY = -Infinity;
      coins.forEach((coin, i) => {
        let price = data[coin]["USD"];
        chart.options.data[i].dataPoints.push({ x: new Date(), y: price });
        if (chart.options.data[i].dataPoints.length > 10) chart.options.data[i].dataPoints.shift();
        let dataPoints = chart.options.data[i].dataPoints;
        dataPoints.forEach((dataPoint) => {
          let y = dataPoint.y;
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        });
      });
      let range = maxY - minY;
      if (range > 8) {
        chart.options.axisY.interval = range / 8;
      } else {
        chart.options.axisY.interval = 1;
      }
      chart.options.axisY.minimum = minY - 0.2 * range;
      chart.options.axisY.maximum = maxY + 0.2 * range;
      chart.render();
    });
  }
  
  setInterval(updateChart, 4000);

  function toggleDataSeries(e) {
    e.dataSeries.visible = typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ? false : true;
    e.chart.render();
  }
};
