<?php
// Universal HTTP/HTTPS -> Local Passenger Socket Bridge for cPanel LiteSpeed
$apiNodeDir = __DIR__ . '/api_node';
$apiNodeHt = $apiNodeDir . '/.htaccess';
if (!is_dir($apiNodeDir) || !file_exists($apiNodeHt)) {
    @mkdir($apiNodeDir, 0755, true);
    $htContent = "# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN\n"
        . "PassengerAppRoot \"/home/ekosmart/ekosmart-api\"\n"
        . "PassengerBaseURI \"/api_node\"\n"
        . "PassengerNodejs \"/opt/alt/alt-nodejs20/root/usr/bin/node\"\n"
        . "PassengerAppType node\n"
        . "PassengerStartupFile app.js\n"
        . "PassengerEnabled on\n"
        . "# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END\n";
    @file_put_contents($apiNodeHt, $htContent);
}
if (is_dir(__DIR__ . '/api')) {
    @unlink(__DIR__ . '/api/.htaccess');
    @rmdir(__DIR__ . '/api');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
    header('Access-Control-Allow-Credentials: true');
    http_response_code(204);
    exit;
}

$path = isset($_GET['__path']) ? $_GET['__path'] : '';
$qs = $_SERVER['QUERY_STRING'] ?? '';
$qs = preg_replace('/(^|&)__path=[^&]*/', '', $qs);
$qs = ltrim($qs, '&');
$targetUrl = 'https://ekosmartfeedback.in/api_node/api/' . ltrim($path, '/') . ($qs ? '?' . $qs : '');

$ch = curl_init($targetUrl);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_RESOLVE, ['ekosmartfeedback.in:443:103.120.179.212']);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);

$reqHeaders = ['Host: ekosmartfeedback.in'];
$allHeaders = function_exists('getallheaders') ? getallheaders() : [];
foreach ($allHeaders as $k => $v) {
    $kl = strtolower($k);
    if ($kl === 'host' || $kl === 'content-length' || $kl === 'connection' || $kl === 'accept-encoding') continue;
    $reqHeaders[] = "$k: $v";
}
if (!isset($allHeaders['Authorization']) && !isset($allHeaders['authorization'])) {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $reqHeaders[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $reqHeaders[] = 'Authorization: ' . $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
}

if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $rawBody = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody);
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $reqHeaders);

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Local API bridge error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$rawRespHeaders = substr($response, 0, $headerSize);
$respBody = substr($response, $headerSize);
curl_close($ch);

http_response_code($statusCode);
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Credentials: true');
foreach (explode("\r\n", $rawRespHeaders) as $line) {
    if (stripos($line, 'Content-Type:') === 0 || stripos($line, 'Content-Disposition:') === 0) {
        header($line);
    }
}
echo $respBody;
