import lighthouse from "lighthouse"
import chromeLauncher from "chrome-launcher"
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

// Get current directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Pages to test
const pagesToTest = [
  { name: "dashboard", url: "http://localhost:3000/dashboard" },
  { name: "events", url: "http://localhost:3000/events" },
  { name: "tasks", url: "http://localhost:3000/tasks" },
  { name: "budget", url: "http://localhost:3000/budget" },
  { name: "documents", url: "http://localhost:3000/documents" },
]

// Performance thresholds
const thresholds = {
  performance: 0.8, // 80/100
  accessibility: 0.9, // 90/100
  "best-practices": 0.9, // 90/100
  seo: 0.9, // 90/100
  "first-contentful-paint": 2000, // 2 seconds
  "largest-contentful-paint": 2500, // 2.5 seconds
  "cumulative-layout-shift": 0.1, // 0.1 or less
  "total-blocking-time": 300, // 300ms or less
}

async function runLighthouseTests() {
  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
  })

  const options = {
    logLevel: "info",
    output: "html",
    port: chrome.port,
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  }

  const results = []

  // Test each page
  for (const page of pagesToTest) {
    console.log(`Testing ${page.name} at ${page.url}...`)

    try {
      const runnerResult = await lighthouse(page.url, options)

      // Save the report
      const reportPath = join(__dirname, "../../reports", `${page.name}-performance.html`)
      writeFileSync(reportPath, runnerResult.report)

      // Extract metrics
      const metrics = {
        name: page.name,
        url: page.url,
        performance: runnerResult.lhr.categories.performance.score,
        accessibility: runnerResult.lhr.categories.accessibility.score,
        "best-practices": runnerResult.lhr.categories["best-practices"].score,
        seo: runnerResult.lhr.categories.seo.score,
        "first-contentful-paint": runnerResult.lhr.audits["first-contentful-paint"].numericValue,
        "largest-contentful-paint": runnerResult.lhr.audits["largest-contentful-paint"].numericValue,
        "cumulative-layout-shift": runnerResult.lhr.audits["cumulative-layout-shift"].numericValue,
        "total-blocking-time": runnerResult.lhr.audits["total-blocking-time"].numericValue,
      }

      results.push(metrics)

      // Check against thresholds
      const failures = []
      for (const [metric, threshold] of Object.entries(thresholds)) {
        if (metrics[metric] < threshold) {
          failures.push(`${metric}: ${metrics[metric]} (threshold: ${threshold})`)
        }
      }

      if (failures.length > 0) {
        console.log(`❌ ${page.name} failed performance thresholds:`)
        failures.forEach((failure) => console.log(`  - ${failure}`))
      } else {
        console.log(`✅ ${page.name} passed all performance thresholds`)
      }

      console.log(`Report saved to ${reportPath}`)
    } catch (error) {
      console.error(`Error testing ${page.name}:`, error)
    }
  }

  // Close Chrome
  await chrome.kill()

  // Save summary report
  const summaryPath = join(__dirname, "../../reports", "performance-summary.json")
  writeFileSync(summaryPath, JSON.stringify(results, null, 2))
  console.log(`Summary report saved to ${summaryPath}`)

  return results
}

// Run the tests
runLighthouseTests()
  .then(() => console.log("Performance tests completed"))
  .catch(console.error)

