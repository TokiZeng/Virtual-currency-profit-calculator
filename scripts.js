document.addEventListener('DOMContentLoaded', function() {
    const cryptoSymbolInput = document.getElementById('cryptoSymbol');
    const cryptoSelect = document.getElementById('cryptoSelect');
    const currentPriceInput = document.getElementById('currentPrice');
    const buyPriceInput = document.getElementById('buyPrice');
    const quantityTypeSelect = document.getElementById('quantityType');
    const quantityLabel = document.getElementById('quantityLabel');
    const quantityTypeLabel = document.getElementById('quantityTypeLabel');
    const quantityInput = document.getElementById('quantity');
    const profitDisplaySelect = document.getElementById('profitDisplay');
    
    let currentPrice = 0;
    let selectedSymbol = 'BTC/USDT'; // 初始選擇的交易對為BTC/USDT

    // 預設的交易對
    const defaultSymbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'TON/USDT'];

    // 頁面加載時顯示預設交易對
    updateSymbolSelect(defaultSymbols.map(symbol => ({symbol: symbol.replace('/', '')})));

    // 當用戶輸入幣種代號時，動態搜尋對應的交易對
    cryptoSymbolInput.addEventListener('input', function() {
        const query = cryptoSymbolInput.value.toUpperCase();
        if (query.length > 0) {
            fetch(`https://api.binance.com/api/v3/ticker/price`)
                .then(response => response.json())
                .then(data => {
                    const symbolList = data.filter(item => 
                        item.symbol.endsWith('USDT') && item.symbol.startsWith(query)
                    );
                    updateSymbolSelect(symbolList);
                })
                .catch(error => console.error('Error fetching data:', error));
        } else {
            // 如果輸入框被清空，重新顯示預設交易對
            updateSymbolSelect(defaultSymbols.map(symbol => ({symbol: symbol.replace('/', '')})));
        }
    });

    // 當用戶選擇一個交易對時，更新當前價格和買入價格
    cryptoSelect.addEventListener('change', function() {
        selectedSymbol = cryptoSelect.value;
        const pureSymbol = selectedSymbol.split('/')[0];
        updateLabels(pureSymbol);

        const apiSymbol = selectedSymbol.replace('/', '');
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${apiSymbol}`)
            .then(response => response.json())
            .then(data => {
                currentPrice = parseFloat(data.lastPrice);
                currentPriceInput.value = currentPrice.toFixed(2);
                buyPriceInput.value = currentPrice.toFixed(2);
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    // 更新下拉選單
    function updateSymbolSelect(symbolList) {
        cryptoSelect.innerHTML = '';
        symbolList.forEach(symbol => {
            const formattedSymbol = symbol.symbol.replace('USDT', '/USDT');
            const option = document.createElement('option');
            option.value = formattedSymbol;
            option.textContent = formattedSymbol;
            cryptoSelect.appendChild(option);
        });
    }

    // 更新數量相關的標籤
    function updateLabels(pureSymbol) {
        quantityTypeLabel.textContent = `選擇數量單位：`;
        quantityLabel.textContent = `交易${pureSymbol}數量：`;

        if (quantityTypeSelect.value === 'usdt') {
            quantityLabel.textContent = '交易USDT數量：';
        }
    }

    // 當選擇的數量單位更改時，更新標籤
    quantityTypeSelect.addEventListener('change', function() {
        const pureSymbol = selectedSymbol.split('/')[0];
        updateLabels(pureSymbol);
    });

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const buyPrice = parseFloat(buyPriceInput.value);
        const sellPrice = parseFloat(document.getElementById('sellPrice').value);
        const quantity = parseFloat(quantityInput.value);
        const feeRate = parseFloat(document.getElementById('feeRate').value) / 100;

        const buyCost = (buyPrice * quantity) * (1 + feeRate);
        const sellRevenue = (sellPrice * quantity) * (1 - feeRate);
        const feeAmount = (buyPrice * quantity * feeRate) + (sellPrice * quantity * feeRate);
        let profit = sellRevenue - buyCost;

        if (profitDisplaySelect.value === 'crypto') {
            profit = profit / currentPrice;
            document.getElementById('profit').textContent = profit.toFixed(6) + ` ${selectedSymbol.split('/')[0]}`;
        } else {
            document.getElementById('profit').textContent = profit.toFixed(2) + ' USDT';
        }

        document.getElementById('buyCost').textContent = buyCost.toFixed(2) + ' USDT';
        document.getElementById('sellRevenue').textContent = sellRevenue.toFixed(2) + ' USDT';
        document.getElementById('feeAmount').textContent = feeAmount.toFixed(2) + ' USDT';
    });
});
