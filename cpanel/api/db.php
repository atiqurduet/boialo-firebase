<?php
/**
 * Boialo cPanel MySQL REST Bridge (PostgREST-Compatible)
 * Connects the React frontend's existing supabase.from('table') calls directly
 * to a cPanel MySQL / MariaDB database via PDO prepared statements.
 */

require_once __DIR__ . '/_helpers.php';

// CORS headers for PostgREST client requests
$origins = array_map('trim', explode(',', MEDIA_ALLOWED_ORIGINS));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if (in_array('*', $origins, true)) {
  header('Access-Control-Allow-Origin: *');
} elseif ($origin && in_array($origin, $origins, true)) {
  header('Access-Control-Allow-Origin: ' . $origin);
  header('Vary: Origin');
} else {
  header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, HEAD, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization, apikey, Prefer, Range, X-Client-Info, X-Supabase-Api-Version');
header('Access-Control-Expose-Headers: Content-Range, Range-Unit');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

function get_pdo(): PDO {
  static $pdo = null;
  if ($pdo !== null) return $pdo;
  $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', DB_HOST, DB_NAME, defined('DB_CHARSET') ? DB_CHARSET : 'utf8mb4');
  $pdo = new PDO($dsn, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
  ]);
  return $pdo;
}

$DEDICATED_TABLES = [
  'site_settings',
  'navigation_menus',
  'menu_items',
  'footer_sections',
  'footer_links',
  'banners',
  'categories',
  'writers',
  'publishers',
  'products',
  'homepage_sections',
  'product_types',
  'universal_categories',
  'universal_products',
  'payment_methods',
  'courier_providers',
  'delivery_zones',
  'profiles',
  'orders',
  'order_items',
  'media_library',
];

$JSON_COLUMNS = ['images', 'preview_pages', 'settings', 'content', 'config', 'payload'];
$BOOL_COLUMNS = ['is_active', 'is_featured', 'is_bestseller', 'is_new_release', 'is_preorder', 'open_in_new_tab'];
$NUMERIC_COLUMNS = ['price', 'original_price', 'discount_percent', 'stock_quantity', 'sort_order', 'charge', 'subtotal', 'shipping_cost', 'discount_amount', 'total_amount', 'quantity', 'unit_price', 'total_price'];

function normalize_row(array $row, array $JSON_COLUMNS, array $BOOL_COLUMNS, array $NUMERIC_COLUMNS): array {
  foreach ($row as $k => $v) {
    if ($v !== null && in_array($k, $JSON_COLUMNS, true) && is_string($v)) {
      $decoded = json_decode($v, true);
      if (json_last_error() === JSON_ERROR_NONE) {
        $row[$k] = $decoded;
      }
    } elseif (in_array($k, $BOOL_COLUMNS, true) && $v !== null) {
      $row[$k] = (bool)$v;
    } elseif (in_array($k, $NUMERIC_COLUMNS, true) && $v !== null && is_numeric($v)) {
      $row[$k] = strpos((string)$v, '.') !== false ? (float)$v : (int)$v;
    }
  }
  return $row;
}

function sanitize_identifier(string $ident): string {
  return preg_replace('/[^a-zA-Z0-9_]/', '', $ident);
}

try {
  $pdo = get_pdo();
} catch (Throwable $e) {
  media_json(500, ['message' => 'MySQL connection failed: ' . $e->getMessage()]);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$accept = $_SERVER['HTTP_ACCEPT'] ?? '';
$wantsObject = strpos($accept, 'application/vnd.pgrst.object+json') !== false;

// Extract table or RPC name from query param `_path` or PATH_INFO
$rawPath = $_GET['_path'] ?? ($_SERVER['PATH_INFO'] ?? '');
$rawPath = '/' . ltrim($rawPath, '/');

if (strpos($rawPath, '/rest/v1/rpc/') === 0) {
  $fnName = substr($rawPath, strlen('/rest/v1/rpc/'));
  if ($fnName === 'has_role' || $fnName === 'is_admin') {
    media_json(200, false);
  }
  media_json(200, []);
}

if (strpos($rawPath, '/rest/v1/') === 0) {
  $table = sanitize_identifier(explode('/', substr($rawPath, strlen('/rest/v1/')))[0]);
} else {
  $table = sanitize_identifier($_GET['_table'] ?? '');
}

if (!$table) {
  media_json(400, ['message' => 'Missing table name']);
}

$isDedicated = in_array($table, $DEDICATED_TABLES, true);

// Build WHERE clauses from PostgREST query parameters
$whereClauses = [];
$bindings = [];
$reservedParams = ['_path', '_table', 'select', 'order', 'limit', 'offset', 'on_conflict', 'columns', 'or'];

if (!$isDedicated) {
  $whereClauses[] = '`collection_name` = ?';
  $bindings[] = $table;
}

foreach ($_GET as $col => $expr) {
  if (in_array($col, $reservedParams, true)) continue;
  $safeCol = sanitize_identifier($col);
  if (!$safeCol || !is_string($expr)) continue;

  $colSql = $isDedicated ? "`$safeCol`" : "JSON_UNQUOTE(JSON_EXTRACT(`payload`, '$.\"$safeCol\"'))";

  if (strpos($expr, 'eq.') === 0) {
    $val = substr($expr, 3);
    if ($val === 'true') $val = $isDedicated ? 1 : 'true';
    elseif ($val === 'false') $val = $isDedicated ? 0 : 'false';
    $whereClauses[] = "$colSql = ?";
    $bindings[] = $val;
  } elseif (strpos($expr, 'neq.') === 0) {
    $whereClauses[] = "$colSql != ?";
    $bindings[] = substr($expr, 4);
  } elseif (strpos($expr, 'is.') === 0) {
    $target = strtolower(substr($expr, 3));
    if ($target === 'null') $whereClauses[] = "$colSql IS NULL";
    elseif ($target === 'true') $whereClauses[] = "$colSql = 1";
    elseif ($target === 'false') $whereClauses[] = "$colSql = 0";
  } elseif (strpos($expr, 'in.(') === 0 && substr($expr, -1) === ')') {
    $inner = substr($expr, 4, -1);
    $items = array_map(fn($s) => trim($s, " \t\n\r\0\x0B\"'"), explode(',', $inner));
    $items = array_values(array_filter($items, fn($s) => $s !== ''));
    if (count($items) > 0) {
      $placeholders = implode(',', array_fill(0, count($items), '?'));
      $whereClauses[] = "$colSql IN ($placeholders)";
      array_push($bindings, ...$items);
    }
  } elseif (strpos($expr, 'ilike.') === 0 || strpos($expr, 'like.') === 0) {
    $pattern = preg_replace('/^(i?like)\./', '', $expr);
    $pattern = str_replace('*', '%', $pattern);
    $whereClauses[] = "LOWER($colSql) LIKE LOWER(?)";
    $bindings[] = $pattern;
  } elseif (strpos($expr, 'gte.') === 0) {
    $whereClauses[] = "$colSql >= ?";
    $bindings[] = substr($expr, 4);
  } elseif (strpos($expr, 'gt.') === 0) {
    $whereClauses[] = "$colSql > ?";
    $bindings[] = substr($expr, 3);
  } elseif (strpos($expr, 'lte.') === 0) {
    $whereClauses[] = "$colSql <= ?";
    $bindings[] = substr($expr, 4);
  } elseif (strpos($expr, 'lt.') === 0) {
    $whereClauses[] = "$colSql < ?";
    $bindings[] = substr($expr, 3);
  }
}

$whereSql = count($whereClauses) > 0 ? 'WHERE ' . implode(' AND ', $whereClauses) : '';
$targetTableSql = $isDedicated ? "`$table`" : '`app_collections`';

// Handle POST (INSERT / UPSERT)
if ($method === 'POST') {
  $rawBody = file_get_contents('php://input');
  $parsed = json_decode($rawBody ?: '{}', true);
  $items = isset($parsed[0]) && is_array($parsed[0]) ? $parsed : [$parsed];
  $inserted = [];

  foreach ($items as $item) {
    if (!is_array($item)) continue;
    if (empty($item['id'])) {
      $item['id'] = media_uuid();
    }
    if ($isDedicated) {
      $cols = [];
      $vals = [];
      $updates = [];
      foreach ($item as $k => $v) {
        if (is_array($v) && !in_array($k, $JSON_COLUMNS, true)) continue;
        $safeK = sanitize_identifier($k);
        if (!$safeK) continue;
        $cols[] = "`$safeK`";
        if (is_array($v)) $vals[] = json_encode($v, JSON_UNESCAPED_UNICODE);
        elseif (is_bool($v)) $vals[] = $v ? 1 : 0;
        else $vals[] = $v;
        if ($safeK !== 'id') {
          $updates[] = "`$safeK` = VALUES(`$safeK`)";
        }
      }
      $placeholders = implode(',', array_fill(0, count($cols), '?'));
      $sql = "INSERT INTO `$table` (" . implode(',', $cols) . ") VALUES ($placeholders)";
      if (count($updates) > 0) {
        $sql .= " ON DUPLICATE KEY UPDATE " . implode(', ', $updates);
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($vals);
    } else {
      $stmt = $pdo->prepare("INSERT INTO `app_collections` (`collection_name`, `id`, `payload`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `payload` = VALUES(`payload`)");
      $stmt->execute([$table, $item['id'], json_encode($item, JSON_UNESCAPED_UNICODE)]);
    }
    $inserted[] = $item;
  }

  $payload = $wantsObject ? ($inserted[0] ?? null) : $inserted;
  media_json(201, $payload);
}

// Handle PATCH (UPDATE)
if ($method === 'PATCH') {
  $rawBody = file_get_contents('php://input');
  $updates = json_decode($rawBody ?: '{}', true);
  if (!is_array($updates) || empty($updates)) {
    media_json(200, $wantsObject ? null : []);
  }

  if ($isDedicated) {
    $setParts = [];
    $setVals = [];
    foreach ($updates as $k => $v) {
      if (is_array($v) && !in_array($k, $JSON_COLUMNS, true)) continue;
      $safeK = sanitize_identifier($k);
      if (!$safeK || $safeK === 'id') continue;
      $setParts[] = "`$safeK` = ?";
      if (is_array($v)) $setVals[] = json_encode($v, JSON_UNESCAPED_UNICODE);
      elseif (is_bool($v)) $setVals[] = $v ? 1 : 0;
      else $setVals[] = $v;
    }
    if (count($setParts) > 0) {
      $sql = "UPDATE `$table` SET " . implode(', ', $setParts) . " $whereSql";
      $stmt = $pdo->prepare($sql);
      $stmt->execute(array_merge($setVals, $bindings));
    }
    $stmt = $pdo->prepare("SELECT * FROM `$table` $whereSql");
    $stmt->execute($bindings);
    $rows = array_map(fn($r) => normalize_row($r, $JSON_COLUMNS, $BOOL_COLUMNS, $NUMERIC_COLUMNS), $stmt->fetchAll());
  } else {
    $stmt = $pdo->prepare("SELECT `id`, `payload` FROM `app_collections` $whereSql");
    $stmt->execute($bindings);
    $rows = [];
    foreach ($stmt->fetchAll() as $r) {
      $doc = json_decode($r['payload'], true) ?: [];
      $merged = array_merge($doc, $updates);
      $uStmt = $pdo->prepare("UPDATE `app_collections` SET `payload` = ? WHERE `collection_name` = ? AND `id` = ?");
      $uStmt->execute([json_encode($merged, JSON_UNESCAPED_UNICODE), $table, $r['id']]);
      $rows[] = $merged;
    }
  }

  media_json(200, $wantsObject ? ($rows[0] ?? null) : $rows);
}

// Handle DELETE
if ($method === 'DELETE') {
  $stmt = $pdo->prepare("DELETE FROM $targetTableSql $whereSql");
  $stmt->execute($bindings);
  media_json(200, $wantsObject ? null : []);
}

// Handle GET / HEAD (SELECT)
$orderSql = '';
if (!empty($_GET['order']) && $isDedicated) {
  $parts = explode('.', $_GET['order']);
  $orderCol = sanitize_identifier($parts[0] ?? '');
  $orderDir = strtolower($parts[1] ?? 'asc') === 'desc' ? 'DESC' : 'ASC';
  if ($orderCol) {
    $orderSql = "ORDER BY `$orderCol` $orderDir";
  }
}

$limitSql = '';
$offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
$limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : null;

$rangeHeader = $_SERVER['HTTP_RANGE'] ?? '';
if ($rangeHeader && strpos($rangeHeader, '-') !== false) {
  [$startStr, $endStr] = explode('-', str_replace('items=', '', $rangeHeader));
  if (is_numeric($startStr) && is_numeric($endStr)) {
    $offset = (int)$startStr;
    $limit = max(1, (int)$endStr - $offset + 1);
  }
}

if ($limit !== null) {
  $limitSql = sprintf('LIMIT %d OFFSET %d', $limit, $offset);
}

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM $targetTableSql $whereSql");
$countStmt->execute($bindings);
$total = (int)$countStmt->fetchColumn();

if ($method === 'HEAD') {
  header('Content-Range: ' . ($total > 0 ? "0-" . max(0, $total - 1) . "/$total" : "*/0"));
  http_response_code(200);
  exit;
}

$stmt = $pdo->prepare("SELECT * FROM $targetTableSql $whereSql $orderSql $limitSql");
$stmt->execute($bindings);
$rawRows = $stmt->fetchAll();

$rows = [];
foreach ($rawRows as $r) {
  if ($isDedicated) {
    $rows[] = normalize_row($r, $JSON_COLUMNS, $BOOL_COLUMNS, $NUMERIC_COLUMNS);
  } else {
    $decoded = json_decode($r['payload'], true);
    if (is_array($decoded)) $rows[] = $decoded;
  }
}

$contentRange = $total > 0 ? sprintf('0-%d/%d', max(0, count($rows) - 1), $total) : '*/0';
header('Content-Range: ' . $contentRange);

if ($wantsObject) {
  media_json(200, $rows[0] ?? null);
}
media_json(200, $rows);
