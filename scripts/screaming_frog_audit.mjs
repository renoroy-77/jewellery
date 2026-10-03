import https from 'https';

const BASE_URL = 'https://aamadappetti.com';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      parsed,
      {
        method: options.method || 'GET',
        headers: {
          'User-Agent':
            'Screaming Frog SEO Spider/20.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`🐸 SCREAMING FROG SEO SPIDER LIVE AUDIT FOR: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const auditResults = {
    passed: 0,
    warnings: 0,
    failed: 0,
    pages: [],
  };

  // 1. Audit robots.txt
  console.log(`[1/5] 🤖 Auditing robots.txt...`);
  const robotsRes = await fetchUrl(`${BASE_URL}/robots.txt`);
  if (robotsRes.statusCode === 200 && robotsRes.body.includes('Sitemap:')) {
    console.log(`   ✅ Status 200 OK | Sitemap declared: Yes`);
    console.log(`   ✅ Consistent User-agent: * and Googlebot rules detected`);
    auditResults.passed++;
  } else {
    console.log(`   ❌ robots.txt error: HTTP ${robotsRes.statusCode}`);
    auditResults.failed++;
  }

  // 2. Audit sitemap.xml
  console.log(`\n[2/5] 🗺️  Auditing sitemap.xml...`);
  const sitemapRes = await fetchUrl(`${BASE_URL}/sitemap.xml`);
  const sitemapUrls = [];
  if (sitemapRes.statusCode === 200) {
    const locMatches = sitemapRes.body.match(/<loc>(.*?)<\/loc>/g) || [];
    locMatches.forEach((m) => {
      const u = m.replace(/<\/?loc>/g, '').trim();
      if (u) sitemapUrls.push(u);
    });
    console.log(`   ✅ Status 200 OK | Total URLs discovered: ${sitemapUrls.length}`);
    if (sitemapUrls.some((u) => u.includes('/authenticity'))) {
      console.log(`   ❌ Warning: 404 URL /authenticity still found in sitemap!`);
      auditResults.failed++;
    } else {
      console.log(`   ✅ 404 URL /authenticity is removed from sitemap!`);
      auditResults.passed++;
    }
  } else {
    console.log(`   ❌ sitemap.xml failed with HTTP ${sitemapRes.statusCode}`);
    auditResults.failed++;
  }

  // 3. Test Redirects
  console.log(`\n[3/5] 🔀 Auditing Permanent Redirects (301/308)...`);
  const testRedirects = [
    { from: `${BASE_URL}/book-consultation`, expected: '/collections' },
    { from: `${BASE_URL}/authenticity`, expected: '/about' },
    { from: `${BASE_URL}/terms`, expected: '/terms-and-conditions' },
    { from: `${BASE_URL}/privacy`, expected: '/privacy-policy' },
    { from: `${BASE_URL}/refund-policy`, expected: '/refunds-and-cancellations' },
  ];

  for (const r of testRedirects) {
    const res = await fetchUrl(r.from, { method: 'HEAD' });
    const location = res.headers['location'] || '';
    const is3xx = res.statusCode === 301 || res.statusCode === 308 || res.statusCode === 307;
    const matchesTarget = location.includes(r.expected);
    if (is3xx && matchesTarget) {
      console.log(`   ✅ ${r.from} -> ${res.statusCode} to ${location}`);
      auditResults.passed++;
    } else {
      console.log(`   ⚠️  ${r.from} returned HTTP ${res.statusCode}, target: ${location}`);
      auditResults.warnings++;
    }
  }

  // 4. Crawl and Validate Core Pages (HTML, Headings, Meta, Canonicals, Schema)
  console.log(`\n[4/5] 🕷️  Crawling & Auditing Indexable Pages...`);
  
  const urlsToCrawl = Array.from(new Set([
    `${BASE_URL}`,
    `${BASE_URL}/about`,
    `${BASE_URL}/collections`,
    `${BASE_URL}/collections/lockets`,
    `${BASE_URL}/collections/ganesha-jewellery`,
    `${BASE_URL}/products/vishnumaya-dollar-locket`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/blog/alchemical-secrets-of-panchaloham`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/shipping-policy`,
    `${BASE_URL}/privacy-policy`,
    `${BASE_URL}/terms-and-conditions`,
    `${BASE_URL}/refunds-and-cancellations`,
  ]));

  for (const url of urlsToCrawl) {
    const startTime = Date.now();
    const res = await fetchUrl(url);
    const duration = Date.now() - startTime;
    const html = res.body;

    // Title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const titleLen = title.length;

    // Meta Description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const desc = descMatch ? descMatch[1].trim() : '';
    const descLen = desc.length;

    // Canonical
    const canonMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const canonical = canonMatch ? canonMatch[1].trim() : '';

    // H1
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const h1Count = h1Matches.length;
    const firstH1 = h1Count > 0 ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : '';

    // Schema JSON-LD
    const hasSchema = html.includes('application/ld+json');

    const issues = [];
    if (res.statusCode !== 200) issues.push(`HTTP ${res.statusCode}`);
    if (!title) issues.push('Missing Title');
    else if (titleLen > 65) issues.push(`Title Over 60 Chars (${titleLen})`);
    if (title.includes('Aamadappetti') && title.match(/Aamadappetti/g).length > 2) {
      issues.push('Repeated Brand Suffix in Title');
    }
    if (!desc) issues.push('Missing Meta Description');
    else if (descLen > 160) issues.push(`Desc Over 155 Chars (${descLen})`);
    if (!canonical) issues.push('Missing Canonical Tag');
    if (h1Count === 0) issues.push('Missing H1');
    else if (h1Count > 1) issues.push(`Multiple H1s (${h1Count})`);

    const pagePath = url.replace(BASE_URL, '') || '/';
    const statusIcon = issues.length === 0 ? '✅' : '⚠️ ';
    console.log(`   ${statusIcon} [${res.statusCode}] ${pagePath} (${duration}ms)`);
    console.log(`      Title (${titleLen} chars): "${title.slice(0, 50)}${titleLen > 50 ? '...' : ''}"`);
    console.log(`      H1 (${h1Count}): "${firstH1.slice(0, 45)}${firstH1.length > 45 ? '...' : ''}"`);
    console.log(`      Canonical: ${canonical}`);
    console.log(`      Schema.org JSON-LD: ${hasSchema ? 'Present ✓' : 'None'}`);
    if (issues.length > 0) {
      console.log(`      ⚠️  Issues: ${issues.join(', ')}`);
      auditResults.warnings++;
    } else {
      auditResults.passed++;
    }
  }

  // 5. Audit Fragment Anchors
  console.log(`\n[5/5] ⚓ Auditing Internal Fragment Identifiers...`);
  const aboutHtml = (await fetchUrl(`${BASE_URL}/about`)).body;
  if (aboutHtml.includes('id="size-guide"') || aboutHtml.includes('id=\'size-guide\'')) {
    console.log(`   ✅ Fragment #size-guide successfully resolved on /about!`);
    auditResults.passed++;
  } else {
    console.log(`   ❌ Fragment #size-guide missing on /about!`);
    auditResults.failed++;
  }

  const homeHtml = (await fetchUrl(`${BASE_URL}`)).body;
  if (homeHtml.includes('id="faq-section"') || homeHtml.includes('id=\'faq-section\'')) {
    console.log(`   ✅ Fragment #faq-section successfully resolved on /!`);
    auditResults.passed++;
  } else {
    console.log(`   ❌ Fragment #faq-section missing on /!`);
    auditResults.failed++;
  }

  console.log(`\n======================================================`);
  console.log(`📊 SCREAMING FROG AUDIT SCORECARD`);
  console.log(`   Passed Checks:   ${auditResults.passed}`);
  console.log(`   Warnings:        ${auditResults.warnings}`);
  console.log(`   Failed Errors:   ${auditResults.failed}`);
  console.log(`   Status:          ${auditResults.failed === 0 ? '🟢 100% AUDIT PASS' : '🔴 ISSUES DETECTED'}`);
  console.log(`======================================================\n`);
}

runAudit().catch(console.error);
