document.addEventListener('DOMContentLoaded', function() {
    const cryptoSymbolInput = document.getElementById('cryptoSymbol');
    const cryptoSelect = document.getElementById('cryptoSelect');
    const currentPriceInput = document.getElementById('currentPrice');
    const buyPriceInput = document.getElementById('buyPrice');
    const quantityTypeSelect = document.getElementById('quantityType');
    const quantityInput = document.getElementById('quantity');
    
    let currentPrice = 0;

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
            cryptoSelect.innerHTML = ''; // 清空下拉選單
        }
    });

    // 當用戶選擇一個交易對時，更新當前價格和買入價格
    cryptoSelect.addEventListener('change', function() {
        const selectedSymbol = cryptoSelect.value.replace('/', '');
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedSymbol}`)
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

    // 當選擇的數量單位更改時，自動計算對應的數量
    quantityTypeSelect.addEventListener('change', function() {
        const quantityType = quantityTypeSelect.value;
        const quantity = parseFloat(quantityInput.value);

        if (quantity && currentPrice > 0) {
            if (quantityType === 'crypto') {
                // 使用幣種數量，不需要額外計算
                quantityInput.placeholder = "輸入幣種數量";
            } else if (quantityType === 'usdt') {
                // 使用USDT數量，計算出相應的幣種數量
                const equivalentQuantity = (quantity / currentPrice).toFixed(6);
                quantityInput.value = equivalentQuantity;
                quantityInput.placeholder = "輸入USDT數量";
            }
        }
    });

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const buyPrice = parseFloat(buyPriceInput.value);
        const sellPrice = parseFloat(document.getElementById('sellPrice').value);
        const quantity = parseFloat(quantityInput.value);
        const feeRate = parseFloat(document.getElementById('feeRate').value) / 100;

        const buyCost = (buyPrice * quantity) * (1 + feeRate);
        const sellRevenue = (sellPrice * quantity) * (1 - feeRate);
        const profit = sellRevenue - buyCost;

        document.getElementById('buyCost').textContent = buyCost.toFixed(2);
        document.getElementById('sellRevenue').textContent = sellRevenue.toFixed(2);
        document.getElementById('profit').textContent = profit.toFixed(2);
    });
});
