import axios from 'axios';
import express from 'express';
const app = express();

// トークンとデバイスIDを設定
const token = '<冬の朝をもっと快適に！Cloud Run×Cloud Scheduler×Nature Remoで実現するエアコン自動化プロジェクト で取得したトークン>'; // トークンを設定
const deviceId = '<device_list.jsonで取得した登録している家電のID>'; // 家電のIDを設定
const url = `https://api.nature.global/1/appliances/${deviceId}/aircon_settings`;


// 現在の日時を取得してフォーマットするヘルパー関数
function getCurrentDateTime() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false
    };
    return now.toLocaleString('ja-JP', options).replace(/\//g, '-').replace(',', '');
}

// 暖房をオフにする関数
async function turnHeatingOff(res) {
    const data = new URLSearchParams({
        button: 'power-off', // 電源オフボタン
    });

    try {
        console.log(`[${getCurrentDateTime()}] 暖房をオフにする操作開始...`);
        
        const response = await axios.post(url, data.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log(`[${getCurrentDateTime()}] 暖房をオフにする操作完了`);

        if (response.status === 200) {
            res.send('暖房をオフにしました!');
            console.log(`[${getCurrentDateTime()}] 操作成功: response.status = ${response.status}`);
            console.log(`[${getCurrentDateTime()}] Response data:`, response.data); // レスポンスデータを出力
        } else {
            res.status(500).send('暖房のオフ操作に失敗しました。');
            console.error(`[${getCurrentDateTime()}] 操作失敗: Unexpected status code ${response.status}`);
            console.error(`[${getCurrentDateTime()}] Response data:`, response.data); // レスポンスデータを出力
        }
    } catch (error) {
        res.status(500).send('暖房のオフ操作中にエラーが発生しました。');
        console.error(`[${getCurrentDateTime()}] エラー: ${error.message}`);
    }
}

// 暖房の温度を設定する関数
async function setHeatingTemperature(res, temperature) {
    const data = new URLSearchParams({
        operation_mode: 'warm',  // 暖房モード
        temperature: temperature.toString(),
        temperature_unit: 'c',
        air_volume: 'auto',
        air_direction: 'auto',
        air_direction_h: 'auto',
    });

    try {
        console.log(`[${getCurrentDateTime()}] 暖房の温度を${temperature}度に設定する操作開始...`);
        
        const response = await axios.post(url, data.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log(`[${getCurrentDateTime()}] 暖房の温度を${temperature}度に設定する操作完了`);

        if (response.status === 200) {
            res.send(`暖房の温度を${temperature}度に設定しました!`);
            console.log(`[${getCurrentDateTime()}] 操作成功: response.status = ${response.status}`);
            console.log(`[${getCurrentDateTime()}] Response data:`, response.data); // レスポンスデータを出力
        } else {
            res.status(500).send('温度設定に失敗しました。');
            console.error(`[${getCurrentDateTime()}] 操作失敗: Unexpected status code ${response.status}`);
            console.error(`[${getCurrentDateTime()}] Response data:`, response.data); // レスポンスデータを出力
        }
    } catch (error) {
        res.status(500).send('温度設定中にエラーが発生しました。');
        console.error(`[${getCurrentDateTime()}] エラー: ${error.message}`);
    }
}

// ルートエンドポイント
app.get('/', (req, res) => {
    res.send('暖房操作用APIにようこそ!');
});


// 暖房をオフにするルート
app.get('/heating/off', async (req, res) => {
    await turnHeatingOff(res);
});

// 暖房の温度を設定するルート（例：温度25度に設定）
app.get('/heating/temperature/:temp', async (req, res) => {
    const temperature = req.params.temp;
    await setHeatingTemperature(res, temperature);
});

// サーバーをポート8080で起動
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`ac_automation_controller: listening on port ${PORT}`);
});
