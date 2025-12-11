export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, username, password } = req.body;
    
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const hasAuth = username && password;
    
    const tests = {
      api: [
        { name: `Test ${domain} Homepage`, method: 'GET', endpoint: url, expectedStatus: 200 },
        { name: `Test ${domain} API Health`, method: 'GET', endpoint: `${urlObj.origin}/api/health`, expectedStatus: 200 }
      ],
      security: [
        { name: `SQL Injection Test - ${domain}`, testType: 'sql_injection', endpoint: url },
        { name: `XSS Test - ${domain}`, testType: 'xss', endpoint: url }
      ],
      performance: [
        { name: `Load Test - ${domain}`, requests: 100, users: 10 }
      ],
      ui: [
        { name: `Homepage Load - ${domain}`, url: url, action: 'page_load' }
      ],
      unit: [
        { name: `URL Validation Test`, code: `const isValid = /^https?:\\/\\/.+/.test("${url}");` }
      ],
      database: [
        { name: `Connection Test - ${domain}`, query: 'SELECT 1', database: 'main' }
      ]
    };

    if (hasAuth) {
      tests.api.push({ name: `Test ${domain} Login`, method: 'POST', endpoint: `${urlObj.origin}/api/auth/login`, expectedStatus: 200 });
    }

    return res.status(200).json({ tests, success: true });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL', success: false });
  }
}
