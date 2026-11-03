<?php
// cPanel MySQL Database Sync Engine (Database: ekosmart_Feedback)
header('Content-Type: application/json');

$mysqli = @new mysqli('127.0.0.1', 'ekosmart_fb', 'Shoyab@1516', 'ekosmart_Feedback');
if ($mysqli->connect_errno) {
    $mysqli = @new mysqli('localhost', 'ekosmart_fb', 'Shoyab@1516', 'ekosmart_Feedback');
}
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $mysqli->connect_error]);
    exit;
}
$mysqli->set_charset('utf8mb4');
$mysqli->query("DROP TABLE IF EXISTS `Array`");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $rawColl = isset($input['collection']) && is_string($input['collection']) ? $input['collection'] : '';
    $coll = preg_replace('/[^a-zA-Z0-9_]/', '', $rawColl);
    $docs = $input['docs'] ?? [];
    if ($coll && $coll !== 'Array' && is_array($docs)) {
        $createSql = "CREATE TABLE IF NOT EXISTS `$coll` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `title_or_name` VARCHAR(255) DEFAULT NULL,
            `email_or_code` VARCHAR(255) DEFAULT NULL,
            `status` VARCHAR(64) DEFAULT NULL,
            `document_json` LONGTEXT NOT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $mysqli->query($createSql);

        $mysqli->query("DELETE FROM `$coll`");
        $stmt = $mysqli->prepare("INSERT INTO `$coll` (`id`, `title_or_name`, `email_or_code`, `status`, `document_json`) VALUES (?, ?, ?, ?, ?)");
        if ($stmt) {
            foreach ($docs as $doc) {
                $rawId = $doc['_id'] ?? uniqid();
                $id = is_array($rawId) ? ($rawId['$oid'] ?? json_encode($rawId)) : (string)$rawId;
                $name = $doc['name'] ?? $doc['customerName'] ?? $doc['productName'] ?? $doc['title'] ?? $doc['key'] ?? null;
                $code = $doc['email'] ?? $doc['employeeId'] ?? $doc['invoiceNumber'] ?? $doc['ticketId'] ?? $doc['serialNumber'] ?? null;
                $status = $doc['status'] ?? $doc['paymentStatus'] ?? $doc['role'] ?? null;
                $json = json_encode($doc, JSON_UNESCAPED_UNICODE);
                $stmt->bind_param('sssss', $id, $name, $code, $status, $json);
                $stmt->execute();
            }
            $stmt->close();
        }
        echo json_encode(['success' => true, 'collection' => $coll, 'synced' => count($docs)]);
        $mysqli->close();
        exit;
    }
}

// GET: return all collections from MySQL ekosmart_Feedback
$res = $mysqli->query("SHOW TABLES");
$all = [];
if ($res) {
    while ($row = $res->fetch_array()) {
        $table = $row[0];
        $q = $mysqli->query("SELECT `document_json` FROM `$table`");
        $all[$table] = [];
        if ($q) {
            while ($r = $q->fetch_assoc()) {
                $decoded = json_decode($r['document_json'], true);
                if ($decoded) $all[$table][] = $decoded;
            }
        }
    }
}
$mysqli->close();
echo json_encode(['success' => true, 'database' => 'ekosmart_Feedback', 'collections' => $all]);
