const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === Bitquery Proxy Endpoint ===
app.get('/api/bitquery', (req, res) => {
  const options = {
    method: 'POST',
    hostname: 'graphql.bitquery.io',
    path: '/',
    headers: {
      'Content-Type': 'application/json',
      // ⚠️ Replace with your valid Bitquery API key if needed
      'Authorization': 'Bearer ory_at_7hfMB8cdejHviJ_DxcOdek5a7TXOPZDsx53rFh8toQ8.y7lsBUrh4CZ7ZSqI4FU4EJk2RKP0bIdfqMLWzflgapA'
    }
  };

  // ✅ Correct Bitquery EVM query (as of 2025)
  const query = `
    query {
      ethereum(network: eth) {
        blocks(options: {limit: 5, desc: "height"}) {
          height
          hash
          timestamp {
            time
          }
          transactionCount
          gasUsed
          miner {
            address
          }
        }
      }
    }
  `;

  const postData = JSON.stringify({ query });

  const request = https.request(options, (upRes) => {
    let data = '';
    upRes.on('data', chunk => (data += chunk));
    upRes.on('end', () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      try {
        res.send(JSON.parse(data));
      } catch {
        res.send(data);
      }
    });
  });

  request.on('error', (e) => {
    console.error('Bitquery Error:', e);
    res.status(500).send({ error: e.message });
  });

  request.write(postData);
  request.end();
});

// === Start Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
