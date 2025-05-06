using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace aircon_on
{
    public class Function1
    {
        private readonly ILogger<Function1> _logger;
        private static readonly HttpClient _httpClient = new HttpClient();

        // コンストラクタでILoggerを注入
        public Function1(ILogger<Function1> logger)
        {
            _logger = logger;
        }

        [Function("Function1")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            // Nature Remo APIの設定
            const string token = "<冬の朝をもっと快適に！Cloud Run×Cloud Scheduler×Nature Remoで実現するエアコン自動化プロジェクト で取得したトークン>"; // トークンを設定
            const string deviceId = "<device_list.jsonで取得した登録している家電のID>"; // 家電のIDを設定
            string url = $"https://api.nature.global/1/appliances/{deviceId}/aircon_settings";

            try
            {
                // 送信するデータをURLエンコードされた形式で作成
                var data = new StringContent(
                    "operation_mode=warm&temperature=24&temperature_unit=c&button=&air_volume=auto&air_direction=auto&air_direction_h=auto",
                    Encoding.UTF8,
                    "application/x-www-form-urlencoded"
                );

                // 必要なヘッダーを設定
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
                _httpClient.DefaultRequestHeaders.Add("accept", "application/json");

                // Nature Remo APIにPOSTリクエストを送信
                HttpResponseMessage response = await _httpClient.PostAsync(url, data);

                // ステータスコードが成功の場合
                if (response.IsSuccessStatusCode)
                {
                    string responseData = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Nature Remoへの送信に成功しました。");
                    _logger.LogInformation($"レスポンスデータ: {responseData}");

                    // 成功メッセージを返却
                    return new OkObjectResult($"Nature Remo送信成功! レスポンスデータ: {responseData}");
                }
                else
                {
                    // ステータスコードが予期しない場合の処理
                    _logger.LogError($"予期しないステータスコード: {response.StatusCode}");
                    return new StatusCodeResult((int)response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                // エラー発生時の処理
                _logger.LogError($"エラーが発生しました: {ex.Message}");
                return new ObjectResult($"エラーが発生しました: {ex.Message}") { StatusCode = 500 };
            }
        }
    }
}
