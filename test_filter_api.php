<?php
/**
 * Test Filter API
 * Simple test to verify the filter API is working
 */

echo "<h2>Testing Filter API</h2>";

// Test the API endpoint directly
$url = 'http://localhost/Accounting%20and%20finance/modules/api/filter-data.php?action=filter_data';
echo "<p>Testing URL: <a href='$url' target='_blank'>$url</a></p>";

// Test with cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "<h3>API Response:</h3>";
echo "<p>HTTP Code: $http_code</p>";

if ($error) {
    echo "<p style='color: red;'>cURL Error: $error</p>";
} else {
    echo "<p style='color: green;'>cURL Success</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
    
    // Try to decode JSON
    $data = json_decode($response, true);
    if ($data) {
        echo "<h3>Decoded Response:</h3>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    } else {
        echo "<p style='color: orange;'>Could not decode JSON response</p>";
    }
}

echo "<h3>Next Steps:</h3>";
echo "<ol>";
echo "<li>If you see sample data above, the API is working correctly</li>";
echo "<li>Go to <a href='modules/financial-reporting.php'>Financial Reporting</a> and test the filters</li>";
echo "<li>Check browser console (F12) for any JavaScript errors</li>";
echo "<li>If still having issues, run <a href='populate_sample_data.php'>populate_sample_data.php</a></li>";
echo "</ol>";
?>
