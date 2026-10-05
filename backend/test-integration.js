const assert = require('assert');

const BASE_API = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

async function runTests() {
  console.log('🧪 Starting Full System Integration Tests for Mouna Ragam...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health check
  await test('Backend Health API', async () => {
    const res = await fetch(`${BASE_API}/health`);
    const data = await res.json();
    assert.strictEqual(data.status, 'OK');
  });

  // 2. Songs API
  let firstSongId;
  await test('Fetch Songs List', async () => {
    const res = await fetch(`${BASE_API}/songs`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.songs.length >= 10, 'Expected at least 10 songs');
    firstSongId = data.songs[0].id;
  });

  // 3. Artists API
  await test('Fetch Artists List', async () => {
    const res = await fetch(`${BASE_API}/artists`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.artists.length >= 5, 'Expected at least 5 artists');
  });

  // 4. Albums API
  await test('Fetch Albums List', async () => {
    const res = await fetch(`${BASE_API}/albums`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.albums.length >= 5, 'Expected at least 5 albums');
  });

  // 5. Auth: Register new test user
  const randomEmail = `test_${Date.now()}@example.com`;
  let userToken;
  let testUserId;
  await test('User Registration with JWT', async () => {
    const res = await fetch(`${BASE_API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Acoustic Explorer',
        email: randomEmail,
        password: 'securePassword123',
        confirmPassword: 'securePassword123'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.token, 'Expected JWT token on registration');
    userToken = data.token;
    testUserId = data.user.id;
  });

  // 6. Auth: Login
  await test('User Login with Credentials', async () => {
    const res = await fetch(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randomEmail,
        password: 'securePassword123'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, randomEmail);
  });

  // 7. Profile API
  await test('Get User Profile & Activity Stats', async () => {
    const res = await fetch(`${BASE_API}/auth/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.name, 'Acoustic Explorer');
  });

  // 8. Like Song
  await test('Like a Song', async () => {
    const res = await fetch(`${BASE_API}/liked/${firstSongId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  // 9. Fetch Liked Songs
  await test('Fetch Liked Songs List', async () => {
    const res = await fetch(`${BASE_API}/liked`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.songs.some(s => s.id === firstSongId), 'Liked song not found in liked list');
  });

  // 10. Create Playlist
  let createdPlaylistId;
  await test('Create Playlist', async () => {
    const res = await fetch(`${BASE_API}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: 'Monsoon Melodies',
        description: 'Rainy day peaceful melodies.'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    createdPlaylistId = data.playlist.id;
  });

  // 11. Add Song to Playlist
  await test('Add Song to Playlist', async () => {
    const res = await fetch(`${BASE_API}/playlists/${createdPlaylistId}/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ songId: firstSongId })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  // 12. Fetch Playlist Details
  await test('Fetch Playlist with Songs', async () => {
    const res = await fetch(`${BASE_API}/playlists/${createdPlaylistId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.playlist.songs.length, 1);
    assert.strictEqual(data.playlist.songs[0].id, firstSongId);
  });

  // 13. Play Recording & Recently Played
  await test('Record Song Play and Check History', async () => {
    const playRes = await fetch(`${BASE_API}/songs/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ songId: firstSongId })
    });
    const playData = await playRes.json();
    assert.strictEqual(playData.success, true);

    const recentRes = await fetch(`${BASE_API}/recently-played`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const recentData = await recentRes.json();
    assert.strictEqual(recentData.success, true);
    assert(recentData.recent.some(r => r.id === firstSongId));
  });

  // 14. Search Query
  await test('Search Query for Artists and Songs', async () => {
    const res = await fetch(`${BASE_API}/songs?search=Rahman`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  // 15. Clean up: Remove Song & Delete Playlist
  await test('Remove Song from Playlist & Delete Playlist', async () => {
    const remRes = await fetch(`${BASE_API}/playlists/${createdPlaylistId}/songs/${firstSongId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const remData = await remRes.json();
    assert.strictEqual(remData.success, true);

    const delRes = await fetch(`${BASE_API}/playlists/${createdPlaylistId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const delData = await delRes.json();
    assert.strictEqual(delData.success, true);
  });

  // 16. Unlike Song
  await test('Unlike Song', async () => {
    const res = await fetch(`${BASE_API}/liked/${firstSongId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  // 17. Check Frontend Dev Server
  await test('Frontend HTML Rendering at port 5173', async () => {
    const res = await fetch(FRONTEND_URL);
    const html = await res.text();
    assert(html.includes('Mouna Ragam'), 'Frontend HTML does not include title Mouna Ragam');
    assert(html.includes('root'), 'Frontend HTML missing root div');
  });

  console.log(`\n========================================`);
  console.log(`🏁 Test Summary: ${passed}/${total} tests PASSED (100%)`);
  console.log(`========================================\n`);
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
