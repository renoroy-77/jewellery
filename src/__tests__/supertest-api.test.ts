/**
 * @jest-environment node
 */
import http from 'http';
import request from 'supertest';
import { GET, POST } from '@/app/api/inquiries/route';

describe('Frontend API Endpoints (Supertest + Jest Integration)', () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(async (req, res) => {
      const url = `http://localhost${req.url}`;
      if (req.method === 'GET') {
        const nextResponse = await GET();
        const data = await nextResponse.json();
        res.writeHead(nextResponse.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const nextReq = new Request(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: body || '{}',
            });
            const nextResponse = await POST(nextReq);
            const data = await nextResponse.json();
            res.writeHead(nextResponse.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      } else {
        res.writeHead(405);
        res.end();
      }
    });

    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('GET /api/inquiries - should return JSON list with 200 OK', async () => {
    const res = await request(server)
      .get('/api/inquiries')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/inquiries - should create an inquiry and return 201 Created', async () => {
    const payload = {
      name: 'Ramesh Devotee',
      email: 'ramesh@example.com',
      phone: '+919876543210',
      inquiryType: 'Consecrated Panchaloham Vel',
      preferredContact: 'WhatsApp',
      message: 'Looking for a consecrated 1-foot Vel.',
    };

    const res = await request(server)
      .post('/api/inquiries')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body.name).toBe('Ramesh Devotee');
    expect(res.body.inquiryType).toBe('Consecrated Panchaloham Vel');
    expect(res.body.status).toBe('NEW');
    expect(res.body.referenceId).toBeDefined();
  });
});
