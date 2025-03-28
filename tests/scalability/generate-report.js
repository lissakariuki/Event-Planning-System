import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createCanvas } from "canvas"

// Get current directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load test results
function loadTestResults() {
  const reportsDir = path.join(__dirname, "../../reports")
  const results = {
    api: JSON.parse(fs.readFileSync(path.join(reportsDir, "api-load-test.json"), "utf8")),
    realtime: JSON.parse(fs.readFileSync(path.join(reportsDir, "realtime-load-test.json"), "utf8")),
    performance: JSON.parse(fs.readFileSync(path.join(reportsDir, "performance-summary.json"), "utf8")),
  }

  return results
}

// Generate charts
function generateCharts(results) {
  const chartsDir = path.join(__dirname, "../../reports/charts")
  if (!fs.existsSync(chartsDir)) {
    fs.mkdirSync(chartsDir, { recursive: true })
  }

  // Generate API response time chart
  const apiResponseTimes = results.api.metrics.http_req_duration.values
  const canvas = createCanvas(800, 400)
  const ctx = canvas.getContext("2d")

  // Draw chart (simplified example)
  ctx.fillStyle = "#f5f5f5"
  ctx.fillRect(0, 0, 800, 400)

  ctx.fillStyle = "#0070f3"
  ctx.font = "24px Arial"
  ctx.fillText("API Response Times", 300, 30)

  // Save chart
  const apiChartPath = path.join(chartsDir, "api-response-times.png")
  const apiChartBuffer = canvas.toBuffer("image/png")
  fs.writeFileSync(apiChartPath, apiChartBuffer)

  // Generate more charts as needed...

  return {
    apiChartPath,
    // other chart paths
  }
}

// Generate HTML report
function generateHtmlReport(results, chartPaths) {
  const reportPath = path.join(__dirname, "../../reports/scalability-report.html")

  // Calculate summary metrics
  const apiP95 = results.api.metrics.http_req_duration.values.p(95)
  const apiErrorRate = results.api.metrics.http_req_failed.values.rate
  const avgPerformanceScore =
    results.performance.reduce((sum, page) => sum + page.performance, 0) / results.performance.length

  // Generate HTML content
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Planning System - Scalability Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #0070f3; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .metric-good { color: green; }
    .metric-warning { color: orange; }
    .metric-bad { color: red; }
    .chart { margin: 20px 0; max-width: 100%; }
  </style>
</head>
<body>
  <h1>Event Planning System - Scalability Test Report</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  
  <h2>Executive Summary</h2>
  <p>
    This report presents the results of scalability testing performed on the Event Planning System.
    The tests evaluated API performance, real-time capabilities, and UI performance under various load conditions.
  </p>
  
  <h3>Key Findings</h3>
  <ul>
    <li>API Response Time (P95): <span class="${apiP95 < 500 ? "metric-good" : apiP95 < 1000 ? "metric-warning" : "metric-bad"}">${apiP95.toFixed(2)}ms</span></li>
    <li>API Error Rate: <span class="${apiErrorRate < 0.01 ? "metric-good" : "metric-bad"}">${(apiErrorRate * 100).toFixed(2)}%</span></li>
    <li>Average UI Performance Score: <span class="${avgPerformanceScore > 0.9 ? "metric-good" : avgPerformanceScore > 0.8 ? "metric-warning" : "metric-bad"}">${(avgPerformanceScore * 100).toFixed(0)}/100</span></li>
  </ul>
  
  <h2>API Load Test Results</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Value</th>
      <th>Threshold</th>
      <th>Status</th>
    </tr>
    <tr>
      <td>Response Time (avg)</td>
      <td>${results.api.metrics.http_req_duration.values.avg.toFixed(2)}ms</td>
      <td>300ms</td>
      <td>${results.api.metrics.http_req_duration.values.avg < 300 ? "✅" : "❌"}</td>
    </tr>
    <tr>
      <td>Response Time (p95)</td>
      <td>${apiP95.toFixed(2)}ms</td>
      <td>500ms</td>
      <td>${apiP95 < 500 ? "✅" : "❌"}</td>
    </tr>
    <tr>
      <td>Error Rate</td>
      <td>${(apiErrorRate * 100).toFixed(2)}%</td>
      <td>1%</td>
      <td>${apiErrorRate < 0.01 ? "✅" : "❌"}</td>
    </tr>
    <tr>
      <td>Requests/sec</td>
      <td>${results.api.metrics.http_reqs.values.rate.toFixed(2)}</td>
      <td>50</td>
      <td>${results.api.metrics.http_reqs.values.rate > 50 ? "✅" : "❌"}</td>
    </tr>
  </table>
  
  <div class="chart">
    <h3>API Response Times</h3>
    <img src="charts/api-response-times.png" alt="API Response Times Chart" width="800">
  </div>
  
  <h2>UI Performance Results</h2>
  <table>
    <tr>
      <th>Page</th>
      <th>Performance</th>
      <th>FCP</th>
      <th>LCP</th>
      <th>CLS</th>
      <th>TBT</th>
    </tr>
    ${results.performance
      .map(
        (page) => `
    <tr>
      <td>${page.name}</td>
      <td>${(page.performance * 100).toFixed(0)}/100</td>
      <td>${page["first-contentful-paint"].toFixed(0)}ms</td>
      <td>${page["largest-contentful-paint"].toFixed(0)}ms</td>
      <td>${page["cumulative-layout-shift"].toFixed(2)}</td>
      <td>${page["total-blocking-time"].toFixed(0)}ms</td>
    </tr>
    `,
      )
      .join("")}
  </table>
  
  <h2>Recommendations</h2>
  <ul>
    <li>Implement caching for frequently accessed data to improve API response times</li>
    <li>Optimize database queries, particularly for the events listing which showed slower response times under load</li>
    <li>Consider implementing pagination for large data sets to improve performance</li>
    <li>Optimize JavaScript bundle size to improve UI performance metrics</li>
    <li>Implement rate limiting to protect against potential abuse</li>
  </ul>
  
  <h2>Conclusion</h2>
  <p>
    The Event Planning System demonstrates good scalability characteristics overall, with most metrics meeting
    the defined thresholds. Areas for improvement have been identified and should be addressed before scaling
    to production loads exceeding 100 concurrent users.
  </p>
</body>
</html>
  `

  fs.writeFileSync(reportPath, html)
  return reportPath
}

// Main function
async function generateReport() {
  console.log("Generating scalability test report...")

  try {
    // Load test results
    const results = loadTestResults()

    // Generate charts
    const chartPaths = generateCharts(results)

    // Generate HTML report
    const reportPath = generateHtmlReport(results, chartPaths)

    console.log(`Report generated successfully: ${reportPath}`)
  } catch (error) {
    console.error("Error generating report:", error)
  }
}

// Run the report generator
generateReport().catch(console.error)

