
const axios = require ("axios");
const api = require ('imersao-bot-cripto-api')

const credentials = {
    apiKey: "NUf9UTdJqHLkbzQuZEbqI6JyxvNxxtDWEI4z1X7dlSYUJYPLWpT76wseWGs8ph4Y",
    apiSecret: "pVYSa4m6Rs64dz4tlk5sMyCITQZdUvA6gsu9UHhxWqwH9kZyczvfId4kx2Fu35KP",
    test: true //-> em produção, para fazer operações reais: test = false e criar apiKey e apiSecret de verdade. 
}

function calcRSI(closes){ // -> calculo de RSI, verifica se a cada vela houve alta ou baixa
    let gains = 0
    let losses = 0
    
    for (let i = closes.length - 14; i < closes.length; i++){ //-> análisar ultimas 14 velas
        const diff = closes[i] - closes [i - 1] //-> diferença entre vela atual e vela anterior
        if (diff >= 0) //-> se for positivo, = a ganho!
            gains += diff
        else
            losses -= diff
    }

    const strength = gains / losses
    return 100 - (100 / (1 + strength)); // -> fórmula RSI
}

let bought = false;

async function process(){

    const symbol = 'BTCBUSD'
    const quantity = 0.001
    
    const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m`); 
    const closes = response.data.map(candle => parseFloat(candle[4]))
    //-> *parseFloat* coverter essa informação em numero, pois a informação chega como texto(string)
    
    const rsi = calcRSI(closes)
    console.log(rsi) //--> rsi acima de 70, sobrecomprado. Abaixo de 30 sobrevendido

    if(rsi > 70 && bought){ //--> se rsi > 70, vender
        console.log('SOBRECOMPRADO!')
        const sellResult = await api.sell(credentials, symbol, quantity)
        console.log(sellResult)
        bought = false;
    }
        
    else if (rsi < 30 && !bought){ //--> se rsi < 30, comprar
        console.log('SOBREVENDIDO')
        const buyResult = await api.buy(credentials, symbol, quantity)
        console.log(buyResult)
        bought = true
    }
        
    else
        console.log('AGUARDAR')
    
    /* sobrevendido? É o inverso do sobrecomprado, significa que um ativo passou por um movimento de desvalorização intenso 
    ou prolongado e está próximo de reverter, ou seja, iniciar um movimento de alta. */ 
}

setInterval(process, 60000) 
/* -> para executar a função a cada 1 minuto, pois recebemos os valor de RSI nesse tempo, 
tempo grafico definito na chamada api (link binance). */ 

process()
